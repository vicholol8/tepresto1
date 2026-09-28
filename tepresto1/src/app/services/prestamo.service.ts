import { Injectable, signal, computed, inject, effect, untracked } from '@angular/core';
import { SupabaseService, Resultado } from './supabase.service';
import { AuthService } from './auth.service';
import { ItemService } from './items.service';
import { Fila } from './database.types';

export type { Resultado } from './supabase.service';

export type EstadoPrestamo = 'pendiente' | 'aceptado' | 'rechazado' | 'cancelado' | 'devuelto';

export interface Prestamo {
  id: number;
  itemId: number;
  solicitanteId: string;
  duenoId: string;
  desde: string; // 'YYYY-MM-DD'
  hasta: string; // 'YYYY-MM-DD'
  mensaje: string;
  estado: EstadoPrestamo;
  fechaSolicitud: number; // timestamp en ms
}

function aPrestamo(f: Fila<'prestamos'>): Prestamo {
  return {
    id: f.id, itemId: f.item_id, solicitanteId: f.solicitante_id, duenoId: f.dueno_id,
    desde: f.desde, hasta: f.hasta, mensaje: f.mensaje, estado: f.estado as EstadoPrestamo,
    fechaSolicitud: Date.parse(f.created_at),
  };
}

// Las reglas (fechas, dueños, estados) las valida la base en las funciones *_prestamo;
// aquí solo se llaman y se muestran sus mensajes.
@Injectable({ providedIn: 'root' })
export class PrestamoService {
  private sb = inject(SupabaseService);
  private supabase = this.sb.client;
  private auth = inject(AuthService);
  private itemService = inject(ItemService);

  // RLS: solo los préstamos donde soy solicitante o dueño
  private prestamos = signal<Prestamo[]>([]);

  // Solo préstamos de items que siguen existiendo
  private visibles = computed(() => {
    const items = new Set(this.itemService.deMiComunidad().map(i => i.id));
    return this.prestamos()
      .filter(p => items.has(p.itemId))
      .sort((a, b) => b.fechaSolicitud - a.fechaSolicitud);
  });

  readonly pedidos = computed(() => {
    const yo = this.auth.usuario()?.id;
    return this.visibles().filter(p => p.solicitanteId === yo);
  });

  readonly prestados = computed(() => {
    const yo = this.auth.usuario()?.id;
    return this.visibles().filter(p => p.duenoId === yo);
  });

  readonly solicitudesPorResponder = computed(() =>
    this.prestados().filter(p => p.estado === 'pendiente').length
  );

  constructor() {
    effect(onCleanup => {
      const clave = this.auth.claveSesion();
      untracked(() => {
        this.prestamos.set([]);
        if (!clave) return;
        this.cargar();
        onCleanup(this.sb.escuchar('prestamos', ['prestamos'], () => this.cargar()));
      });
    });
  }

  private async cargar() {
    const { data } = await this.supabase.from('prestamos').select('*');
    this.prestamos.set((data ?? []).map(aPrestamo));
  }

  // Préstamo en curso visible para mí (solo si soy el dueño o quien lo arrienda)
  activoDeItem(itemId: number): Prestamo | undefined {
    return this.visibles().find(p => p.itemId === itemId && p.estado === 'aceptado');
  }

  miSolicitudPendiente(itemId: number): Prestamo | undefined {
    const yo = this.auth.usuario()?.id;
    return this.visibles().find(p => p.itemId === itemId && p.solicitanteId === yo && p.estado === 'pendiente');
  }

  pendientesDeItem(itemId: number): Prestamo[] {
    const yo = this.auth.usuario()?.id;
    return this.visibles().filter(p => p.itemId === itemId && p.duenoId === yo && p.estado === 'pendiente');
  }

  async solicitar(itemId: number, desde: string, hasta: string, mensaje: string): Promise<Resultado> {
    if (!desde || !hasta) return { exito: false, mensaje: 'Elige las fechas de inicio y término.' };
    const { error } = await this.supabase.rpc('solicitar_prestamo',
      { p_item: itemId, p_desde: desde, p_hasta: hasta, p_mensaje: mensaje });
    return this.despues(error, 'Solicitud enviada. Te avisaremos por chat cuando responda.');
  }

  async aceptar(id: number): Promise<Resultado> {
    const { error } = await this.supabase.rpc('aceptar_prestamo', { p_id: id });
    return this.despues(error, 'Solicitud aceptada.');
  }

  async rechazar(id: number): Promise<Resultado> {
    const { error } = await this.supabase.rpc('rechazar_prestamo', { p_id: id });
    return this.despues(error, 'Solicitud rechazada.');
  }

  async cancelar(id: number): Promise<Resultado> {
    const { error } = await this.supabase.rpc('cancelar_prestamo', { p_id: id });
    return this.despues(error, 'Solicitud cancelada.');
  }

  // La devolución la confirma el dueño, que es quien recibe el producto
  async marcarDevuelto(id: number): Promise<Resultado> {
    const { error } = await this.supabase.rpc('marcar_devuelto', { p_id: id });
    return this.despues(error, 'Producto marcado como devuelto.');
  }

  private async despues(error: Parameters<SupabaseService['resultado']>[0], mensajeExito: string): Promise<Resultado> {
    // Las funciones de préstamos también cambian el estado de arriendo del item
    if (!error) await Promise.all([this.cargar(), this.itemService.cargar()]);
    return this.sb.resultado(error, mensajeExito);
  }
}
