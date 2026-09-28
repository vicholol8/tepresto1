import { Injectable, signal, computed, inject, effect, untracked } from '@angular/core';
import { SupabaseService, Resultado } from './supabase.service';
import { AuthService, Usuario } from './auth.service';
import { Fila } from './database.types';
import { reducirImagen } from '../utils/imagen';

const BUCKET_FOTOS = 'productos';

export interface Items {
  id: number;
  nombre: string;
  tipo: string;
  precio: string;
  duenoId: string;
  comunidadId: number;
  descripcion: string;
  foto: string;
  arrendado: boolean;
  arrendadoHasta: string | null; // 'YYYY-MM-DD'
}

export type DatosItem = Pick<Items, 'nombre' | 'tipo' | 'precio' | 'descripcion' | 'foto'>;

function aItem(f: Fila<'items'>): Items {
  return {
    id: f.id, nombre: f.nombre, tipo: f.tipo, precio: f.precio, duenoId: f.dueno_id,
    comunidadId: f.comunidad_id, descripcion: f.descripcion, foto: f.foto,
    arrendado: f.arrendado, arrendadoHasta: f.arrendado_hasta,
  };
}

@Injectable({ providedIn: 'root' })
export class ItemService {
  private sb = inject(SupabaseService);
  private supabase = this.sb.client;
  private auth = inject(AuthService);

  private items = signal<Items[]>([]);
  private favoritosIds = signal<number[]>([]);
  readonly cargado = signal(false);
  // Se resuelve con la primera carga de la sesión actual
  private cargaLista!: Promise<void>;
  private resolverCarga!: () => void;

  // RLS ya limita los items a la comunidad del usuario
  readonly deMiComunidad = computed(() => this.items());

  readonly misProductos = computed(() => this.items().filter(i => this.auth.esDueno(i.duenoId)));

  readonly misFavoritos = computed(() => {
    const ids = this.favoritosIds();
    return this.items().filter(item => ids.includes(item.id));
  });

  constructor() {
    this.reiniciarEspera();
    // Carga y escucha cambios cada vez que cambia el usuario o su comunidad
    effect(onCleanup => {
      const clave = this.auth.claveSesion();
      untracked(() => {
        this.items.set([]);
        this.favoritosIds.set([]);
        if (this.cargado()) this.reiniciarEspera();
        this.cargado.set(false);
        if (!clave) return;
        this.cargar();
        onCleanup(this.sb.escuchar('items', ['items'], () => this.cargar()));
      });
    });
  }

  // Para pantallas que necesitan los datos antes de decidir algo (p. ej. editar)
  esperarCarga(): Promise<void> {
    return this.cargaLista;
  }

  private reiniciarEspera() {
    this.cargaLista = new Promise(resolve => this.resolverCarga = resolve);
  }

  // Público para que PrestamoService refresque el estado de arriendo al tiro
  async cargar() {
    const [items, favoritos] = await Promise.all([
      this.supabase.from('items').select('*').order('created_at', { ascending: false }),
      this.supabase.from('favoritos').select('item_id'),
    ]);
    this.items.set((items.data ?? []).map(aItem));
    this.favoritosIds.set((favoritos.data ?? []).map(f => f.item_id));
    this.cargado.set(true);
    this.resolverCarga();
  }

  obtener(id: String | number): Items | undefined {
    return this.items().find(i => i.id === Number(id));
  }

  dueno(item: Items): Usuario | undefined {
    return this.auth.obtenerUsuario(item.duenoId);
  }

  // Mensaje de error si faltan datos obligatorios, o '' si está todo bien
  validar(datos: DatosItem): string {
    return !datos.nombre.trim() || !datos.tipo.trim() || !datos.precio.trim()
      ? 'Nombre, tipo y precio son obligatorios.' : '';
  }

  // Si viene una foto nueva se sube primero a Storage y el item guarda su URL pública.
  // El trigger de la base también lo publica en el muro.
  async agregar(datos: DatosItem, foto?: File | null): Promise<Resultado> {
    if (!datos.nombre.trim()) return { exito: false, mensaje: 'Ponle un nombre al producto.' };
    const subida = await this.conFoto(datos, foto);
    if ('exito' in subida) return subida;
    const { error } = await this.supabase.from('items').insert(subida);
    if (error) await this.borrarFoto(subida.foto, datos.foto);
    else await this.cargar();
    return this.sb.resultado(error, 'Producto publicado.');
  }

  // Crea el producto y lo publica en el muro como "Ofrezco" con el texto dado (en vez del post de producto)
  async ofrecerNuevo(datos: DatosItem, foto: File | null, texto: string): Promise<Resultado> {
    const subida = await this.conFoto(datos, foto);
    if ('exito' in subida) return subida;
    const { error } = await this.supabase.rpc('ofrecer_producto_nuevo', {
      p_nombre: subida.nombre, p_tipo: subida.tipo, p_precio: subida.precio,
      p_descripcion: subida.descripcion, p_foto: subida.foto, p_texto: texto.trim(),
    });
    if (error) await this.borrarFoto(subida.foto, datos.foto);
    else await this.cargar();
    return this.sb.resultado(error, 'Publicado.');
  }

  async editar(id: number, datos: DatosItem, foto?: File | null): Promise<Resultado> {
    const anterior = this.obtener(id)?.foto;
    const subida = await this.conFoto(datos, foto);
    if ('exito' in subida) return subida;
    const { error } = await this.supabase.from('items').update(subida).eq('id', id);
    if (error) {
      await this.borrarFoto(subida.foto, datos.foto);
    } else {
      // La foto reemplazada o quitada ya no la usa nadie
      if (anterior && anterior !== subida.foto) await this.borrarFoto(anterior);
      await this.cargar();
    }
    return this.sb.resultado(error, 'Cambios guardados.');
  }

  async eliminar(id: number): Promise<Resultado> {
    const foto = this.obtener(id)?.foto;
    const { error } = await this.supabase.from('items').delete().eq('id', id);
    if (!error) {
      if (foto) await this.borrarFoto(foto);
      await this.cargar();
    }
    return this.sb.resultado(error, 'Producto eliminado.');
  }

  async toggleFavorito(id: number) {
    const yaEra = this.esFavorito(id);
    // Optimista: se actualiza al tiro y se revierte si falla
    this.favoritosIds.update(ids => yaEra ? ids.filter(i => i !== id) : [...ids, id]);
    const { error } = yaEra
      ? await this.supabase.from('favoritos').delete().eq('item_id', id)
      : await this.supabase.from('favoritos').insert({ item_id: id });
    if (error) {
      this.favoritosIds.update(ids => yaEra ? [...ids, id] : ids.filter(i => i !== id));
    }
  }

  esFavorito(id: number): boolean {
    return this.favoritosIds().includes(id);
  }

  // Datos limpios listos para guardar, con la URL de la foto nueva si se eligió una
  private async conFoto(datos: DatosItem, foto?: File | null): Promise<DatosItem | Resultado> {
    const limpio = this.limpiar(datos);
    if (!foto) return limpio;
    const url = await this.subirFoto(foto);
    if (typeof url !== 'string') return url;
    return { ...limpio, foto: url };
  }

  // Cada usuario sube a su propia carpeta (<uid>/...), así lo exige la política del bucket
  private async subirFoto(archivo: File): Promise<string | Resultado> {
    const uid = this.auth.usuario()?.id;
    if (!uid) return { exito: false, mensaje: 'Inicia sesión para subir fotos.' };
    if (!archivo.type.startsWith('image/')) return { exito: false, mensaje: 'El archivo debe ser una imagen.' };
    let imagen: Blob;
    try {
      imagen = await reducirImagen(archivo);
    } catch {
      return { exito: false, mensaje: 'No se pudo leer la imagen, prueba con otra.' };
    }
    const extension = imagen.type === 'image/gif' ? 'gif' : 'jpg';
    const ruta = `${uid}/${crypto.randomUUID()}.${extension}`;
    const { error } = await this.supabase.storage.from(BUCKET_FOTOS)
      .upload(ruta, imagen, { contentType: imagen.type, cacheControl: '31536000' });
    if (error) {
      console.error('[Storage]', error);
      return { exito: false, mensaje: 'No se pudo subir la foto, intenta de nuevo.' };
    }
    return this.supabase.storage.from(BUCKET_FOTOS).getPublicUrl(ruta).data.publicUrl;
  }

  // Borra una foto del bucket (solo las subidas por la app; los links externos se ignoran).
  // Con `salvo` no se borra si es la misma que ya estaba guardada.
  private async borrarFoto(url: string, salvo?: string) {
    if (!url || url === salvo?.trim()) return;
    const marca = `/storage/v1/object/public/${BUCKET_FOTOS}/`;
    const i = url.indexOf(marca);
    if (i === -1) return;
    await this.supabase.storage.from(BUCKET_FOTOS).remove([decodeURIComponent(url.slice(i + marca.length))]);
  }

  private limpiar(d: DatosItem): DatosItem {
    return { nombre: d.nombre.trim(), tipo: d.tipo.trim(), precio: d.precio.trim(),
      descripcion: d.descripcion.trim(), foto: d.foto.trim() };
  }
}
