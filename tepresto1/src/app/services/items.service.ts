import { Injectable, signal, computed, inject, effect, untracked } from '@angular/core';
import { SupabaseService, Resultado } from './supabase.service';
import { AuthService, Usuario } from './auth.service';
import { Fila } from './database.types';

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

  // El trigger de la base también lo publica en el muro
  async agregar(datos: DatosItem): Promise<Resultado> {
    if (!datos.nombre.trim()) return { exito: false, mensaje: 'Ponle un nombre al producto.' };
    const { error } = await this.supabase.from('items').insert(this.limpiar(datos));
    if (!error) await this.cargar();
    return this.sb.resultado(error, 'Producto publicado.');
  }

  async editar(id: number, datos: DatosItem): Promise<Resultado> {
    const { error } = await this.supabase.from('items').update(this.limpiar(datos)).eq('id', id);
    if (!error) await this.cargar();
    return this.sb.resultado(error, 'Cambios guardados.');
  }

  async eliminar(id: number): Promise<Resultado> {
    const { error } = await this.supabase.from('items').delete().eq('id', id);
    if (!error) await this.cargar();
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

  private limpiar(d: DatosItem): DatosItem {
    return { nombre: d.nombre.trim(), tipo: d.tipo.trim(), precio: d.precio.trim(),
      descripcion: d.descripcion.trim(), foto: d.foto.trim() };
  }
}
