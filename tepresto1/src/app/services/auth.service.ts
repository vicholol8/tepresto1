import { Injectable, signal, computed, inject, effect, untracked } from '@angular/core';
import { SupabaseService, Resultado } from './supabase.service';
import { Fila } from './database.types';

export interface Usuario {
  id: string;
  email: string;
  nombre: string;
  depto: string;
  foto: string;
  comunidadId: number | null;
}

export interface ResultadoRegistro extends Resultado {
  requiereConfirmacion: boolean;
}

// Los mensajes de Supabase Auth vienen en inglés
const ERRORES_AUTH: [RegExp, string][] = [
  [/invalid login credentials/i, 'Correo o contraseña incorrectos.'],
  [/email not confirmed/i, 'Confirma tu correo antes de entrar (revisa tu bandeja de entrada).'],
  [/already registered/i, 'Este correo ya está registrado.'],
  [/password should be at least/i, 'La contraseña debe tener al menos 6 caracteres.'],
  [/unable to validate email|invalid format/i, 'El correo no es válido.'],
  [/rate limit/i, 'Demasiados intentos, espera un momento y vuelve a intentar.'],
];

function traducir(mensaje: string): string {
  return ERRORES_AUTH.find(([patron]) => patron.test(mensaje))?.[1] ?? mensaje;
}

export function avatar(nombre: string): string {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(nombre || '?')}&background=random`;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private sb = inject(SupabaseService);
  private supabase = this.sb.client;

  private email = signal('');
  private perfil = signal<Usuario | null>(null);
  private sesionId = signal<string | null>(null);
  // Perfiles de la comunidad (incluido el propio), para mostrar nombres y fotos
  private vecinos = signal<Usuario[]>([]);
  readonly comunidad = signal<string>('');

  readonly usuario = computed(() => this.perfil());
  readonly estaLogueado = computed(() => this.sesionId() !== null);
  readonly tieneComunidad = computed(() => this.perfil()?.comunidadId != null);
  // Cambia solo al cambiar de usuario o de comunidad: los servicios de datos recargan con esto
  // (un computed de string evita recargar cuando solo se edita el nombre o la foto)
  readonly claveSesion = computed(() => {
    const p = this.perfil();
    return p?.comunidadId != null ? `${p.id}-${p.comunidadId}` : null;
  });

  // Se resuelve cuando se sabe si hay sesión guardada (los guards esperan esto)
  readonly listo: Promise<void>;

  constructor() {
    this.listo = this.supabase.auth.getSession().then(({ data }) => this.alCambiarSesion(data.session?.user ?? null));

    this.supabase.auth.onAuthStateChange((evento, sesion) => {
      if (evento === 'INITIAL_SESSION') return; // ya lo maneja getSession()
      // Se difiere para no llamar a Supabase dentro del callback (puede bloquearse)
      setTimeout(() => this.alCambiarSesion(sesion?.user ?? null));
    });

    // Vecinos nuevos o perfiles editados aparecen sin recargar
    effect(onCleanup => {
      const clave = this.claveSesion();
      untracked(() => {
        if (clave) onCleanup(this.sb.escuchar('perfiles', ['profiles'], () => this.cargarVecinos()));
      });
    });
  }

  private async alCambiarSesion(user: { id: string; email?: string } | null) {
    if (!user) {
      this.sesionId.set(null);
      this.perfil.set(null);
      this.vecinos.set([]);
      this.comunidad.set('');
      return;
    }
    if (user.id === this.sesionId() && this.perfil()) return;
    this.email.set(user.email ?? '');
    await this.cargarPerfil(user.id);
    this.sesionId.set(user.id);
  }

  private aUsuario(p: Fila<'profiles'>): Usuario {
    const nombre = p.full_name?.trim() || 'Vecino';
    return {
      id: p.id,
      email: '', // solo se conoce el correo propio (se completa en cargarPerfil)
      nombre,
      depto: p.depto ?? '',
      foto: p.foto || avatar(nombre),
      comunidadId: p.comunidad_id,
    };
  }

  private async cargarPerfil(id: string) {
    const { data } = await this.supabase.from('profiles').select('*').eq('id', id).maybeSingle();
    const propio = data ? { ...this.aUsuario(data), email: this.email() } : null;
    this.perfil.set(propio);
    await this.cargarVecinos();
  }

  async cargarVecinos() {
    const comunidadId = this.perfil()?.comunidadId;
    if (comunidadId == null) {
      this.vecinos.set(this.perfil() ? [this.perfil()!] : []);
      this.comunidad.set('');
      return;
    }
    const [perfiles, comunidad] = await Promise.all([
      this.supabase.from('profiles').select('*').eq('comunidad_id', comunidadId),
      this.supabase.from('comunidades').select('nombre').eq('id', comunidadId).maybeSingle(),
    ]);
    this.vecinos.set((perfiles.data ?? []).map(p => this.aUsuario(p)));
    this.comunidad.set(comunidad.data?.nombre ?? '');
  }

  async login(email: string, password: string): Promise<Resultado> {
    const { data, error } = await this.supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) return { exito: false, mensaje: traducir(error.message) };
    await this.alCambiarSesion(data.user);
    return { exito: true, mensaje: '' };
  }

  async logout() {
    await this.supabase.auth.signOut();
    await this.alCambiarSesion(null);
  }

  async registrar(datos: { nombre: string; depto: string; email: string; password: string }, codigo: string): Promise<ResultadoRegistro> {
    const fallo = (mensaje: string): ResultadoRegistro => ({ exito: false, mensaje, requiereConfirmacion: false });

    const { data: comunidad } = await this.supabase.rpc('validar_codigo', { p_codigo: codigo });
    if (!comunidad) return fallo('El código de edificio no existe.');

    // El trigger handle_new_user crea el perfil con estos datos
    const { data, error } = await this.supabase.auth.signUp({
      email: datos.email.trim(),
      password: datos.password,
      options: { data: { full_name: datos.nombre.trim(), depto: datos.depto.trim(), codigo } },
    });
    if (error) return fallo(traducir(error.message));
    // Con un correo ya registrado Supabase no da error, pero devuelve un usuario sin identidades
    if (data.user && data.user.identities?.length === 0) return fallo('Este correo ya está registrado.');

    if (!data.session) {
      return { exito: true, requiereConfirmacion: true,
        mensaje: `Te enviamos un correo a ${datos.email.trim()}. Confírmalo y luego inicia sesión.` };
    }
    await this.alCambiarSesion(data.user);
    return { exito: true, requiereConfirmacion: false, mensaje: `¡Bienvenido a ${comunidad}!` };
  }

  async unirseComunidad(codigo: string, depto: string): Promise<Resultado> {
    const { data, error } = await this.supabase.rpc('unirse_comunidad', { p_codigo: codigo, p_depto: depto });
    if (error) return { exito: false, mensaje: error.message };
    const id = this.perfil()?.id;
    if (id) await this.cargarPerfil(id);
    return { exito: true, mensaje: `¡Bienvenido a ${data}!` };
  }

  async actualizarPerfil(datos: Partial<Pick<Usuario, 'nombre' | 'depto' | 'foto'>>): Promise<Resultado> {
    const actual = this.perfil();
    if (!actual) return { exito: false, mensaje: 'Debes iniciar sesión.' };
    const { error } = await this.supabase.from('profiles').update({
      full_name: datos.nombre?.trim() ?? actual.nombre,
      depto: datos.depto?.trim() ?? actual.depto,
      foto: datos.foto?.trim() || null,
    }).eq('id', actual.id);
    if (error) return { exito: false, mensaje: error.message };
    await this.cargarPerfil(actual.id);
    return { exito: true, mensaje: 'Perfil actualizado.' };
  }

  obtenerUsuario(id: string): Usuario | undefined {
    return this.vecinos().find(u => u.id === id);
  }

  esDueno(duenoId: string): boolean {
    return this.sesionId() !== null && this.sesionId() === duenoId;
  }
}
