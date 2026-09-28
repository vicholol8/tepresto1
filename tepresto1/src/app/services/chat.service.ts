import { Injectable, signal, computed, inject, effect, untracked } from '@angular/core';
import { SupabaseService, Resultado } from './supabase.service';
import { AuthService, Usuario } from './auth.service';
import { Fila } from './database.types';

export interface Mensaje {
  id: number;
  autorId: string;
  texto: string;
  fecha: number; // timestamp en ms
}

export interface Conversacion {
  id: number;
  participantes: [string, string];
  itemId?: number; // opcional: los chats que se abren desde el muro pueden no tener item
  mensajes: Mensaje[];
  // Hasta qué momento leyó cada participante (id de usuario -> timestamp en ms)
  leidoHasta: Record<string, number>;
}

type FilaConversacion = Fila<'conversaciones'> & { mensajes: Fila<'mensajes'>[] };

function aConversacion(f: FilaConversacion): Conversacion {
  return {
    id: f.id,
    participantes: [f.usuario_a, f.usuario_b],
    itemId: f.item_id ?? undefined,
    mensajes: f.mensajes
      .map(m => ({ id: m.id, autorId: m.autor_id, texto: m.texto, fecha: Date.parse(m.created_at) }))
      .sort((a, b) => a.fecha - b.fecha),
    leidoHasta: { [f.usuario_a]: Date.parse(f.leido_a), [f.usuario_b]: Date.parse(f.leido_b) },
  };
}

@Injectable({ providedIn: 'root' })
export class ChatService {
  private sb = inject(SupabaseService);
  private supabase = this.sb.client;
  private auth = inject(AuthService);

  private conversaciones = signal<Conversacion[]>([]);
  readonly cargado = signal(false);

  // Conversaciones del usuario (RLS) con al menos un mensaje, la más reciente primero
  readonly misConversaciones = computed(() =>
    this.conversaciones()
      .filter(c => c.mensajes.length > 0)
      .sort((a, b) => this.ultimoMensaje(b)!.fecha - this.ultimoMensaje(a)!.fecha)
  );

  readonly totalNoLeidos = computed(() =>
    this.misConversaciones().reduce((total, c) => total + this.noLeidos(c), 0)
  );

  constructor() {
    effect(onCleanup => {
      const clave = this.auth.claveSesion();
      untracked(() => {
        this.conversaciones.set([]);
        this.cargado.set(false);
        if (!clave) return;
        this.cargar();
        onCleanup(this.sb.escuchar('chat', ['conversaciones', 'mensajes'], () => this.cargar()));
      });
    });
  }

  private async cargar() {
    const { data } = await this.supabase.from('conversaciones').select('*, mensajes(*)');
    this.conversaciones.set((data ?? []).map(aConversacion));
    this.cargado.set(true);
  }

  obtener(id: String | number): Conversacion | undefined {
    return this.conversaciones().find(c => c.id === Number(id));
  }

  // Reutiliza la conversación existente entre ambos (sobre el mismo item) o crea una nueva
  async abrirCon(otroId: string, itemId?: number): Promise<number | undefined> {
    const { data, error } = await this.supabase.rpc('abrir_conversacion', { p_otro: otroId, p_item: itemId });
    if (error) {
      console.error('[Chat]', error);
      return undefined;
    }
    await this.cargar();
    return data;
  }

  async enviar(conversacionId: number, texto: string): Promise<Resultado> {
    const limpio = texto.trim();
    if (!limpio) return { exito: false, mensaje: '' };
    const { error } = await this.supabase.from('mensajes').insert({ conversacion_id: conversacionId, texto: limpio });
    if (!error) await this.cargar();
    return this.sb.resultado(error, '');
  }

  async marcarLeida(conversacionId: number) {
    const yo = this.auth.usuario()?.id;
    const c = this.obtener(conversacionId);
    if (!yo || !c) return;
    // Optimista. Se usa el último mensaje como mínimo por si el reloj del teléfono va atrasado
    // respecto al servidor: si no, el mensaje seguiría "no leído" y se volvería a marcar sin fin.
    const hasta = Math.max(Date.now(), this.ultimoMensaje(c)?.fecha ?? 0);
    this.conversaciones.update(lista => lista.map(x => x.id === conversacionId
      ? { ...x, leidoHasta: { ...x.leidoHasta, [yo]: hasta } }
      : x));
    await this.supabase.rpc('marcar_leida', { p_conversacion: conversacionId });
  }

  noLeidos(c: Conversacion): number {
    const yo = this.auth.usuario()?.id;
    if (!yo) return 0;
    const desde = c.leidoHasta[yo] ?? 0;
    return c.mensajes.filter(m => m.autorId !== yo && m.fecha > desde).length;
  }

  ultimoMensaje(c: Conversacion): Mensaje | undefined {
    return c.mensajes[c.mensajes.length - 1];
  }

  otroParticipante(c: Conversacion): Usuario | undefined {
    const yo = this.auth.usuario()?.id;
    const otroId = c.participantes.find(p => p !== yo);
    return otroId === undefined ? undefined : this.auth.obtenerUsuario(otroId);
  }
}
