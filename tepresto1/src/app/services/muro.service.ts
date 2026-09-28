import { Injectable, signal, computed, inject, effect, untracked } from '@angular/core';
import { SupabaseService, Resultado } from './supabase.service';
import { AuthService } from './auth.service';
import { ItemService } from './items.service';
import { Fila } from './database.types';

export type TipoPost = 'producto' | 'busco' | 'ofrezco' | 'aviso';

export interface Comentario {
  id: number;
  autorId: string;
  texto: string;
  fecha: number; // timestamp en ms
}

export interface Post {
  id: number;
  autorId: string;
  tipo: TipoPost;
  texto: string;
  itemId?: number; // solo en posts de tipo 'producto'
  fecha: number;
  comentarios: Comentario[];
}

type FilaPost = Fila<'posts'> & { comentarios: Fila<'comentarios'>[] };

function aPost(f: FilaPost): Post {
  return {
    id: f.id, autorId: f.autor_id, tipo: f.tipo as TipoPost, texto: f.texto,
    itemId: f.item_id ?? undefined, fecha: Date.parse(f.created_at),
    comentarios: f.comentarios
      .map(c => ({ id: c.id, autorId: c.autor_id, texto: c.texto, fecha: Date.parse(c.created_at) }))
      .sort((a, b) => a.fecha - b.fecha),
  };
}

@Injectable({ providedIn: 'root' })
export class MuroService {
  private sb = inject(SupabaseService);
  private supabase = this.sb.client;
  private auth = inject(AuthService);
  private itemService = inject(ItemService);

  private posts = signal<Post[]>([]);
  readonly cargado = signal(false);

  // Posts de la comunidad (RLS), el más reciente primero.
  // Un post de producto se oculta hasta que su item esté cargado, para no mostrarlo vacío.
  readonly deMiComunidad = computed(() => {
    const itemsVisibles = new Set(this.itemService.deMiComunidad().map(i => i.id));
    return this.posts().filter(p => p.tipo !== 'producto' || (p.itemId !== undefined && itemsVisibles.has(p.itemId)));
  });

  constructor() {
    effect(onCleanup => {
      const clave = this.auth.claveSesion();
      untracked(() => {
        this.posts.set([]);
        this.cargado.set(false);
        if (!clave) return;
        this.cargar();
        onCleanup(this.sb.escuchar('muro', ['posts', 'comentarios'], () => this.cargar()));
      });
    });
  }

  private async cargar() {
    const { data } = await this.supabase.from('posts').select('*, comentarios(*)')
      .order('created_at', { ascending: false });
    this.posts.set((data ?? []).map(aPost));
    this.cargado.set(true);
  }

  obtener(id: String | number): Post | undefined {
    return this.deMiComunidad().find(p => p.id === Number(id));
  }

  async publicar(tipo: Exclude<TipoPost, 'producto'>, texto: string): Promise<Resultado> {
    const limpio = texto.trim();
    if (!limpio) return { exito: false, mensaje: 'Escribe algo para publicar.' };
    const { error } = await this.supabase.from('posts').insert({ tipo, texto: limpio });
    if (!error) await this.cargar();
    return this.sb.resultado(error, 'Publicado.');
  }

  async comentar(postId: number, texto: string): Promise<Resultado> {
    const limpio = texto.trim();
    if (!limpio) return { exito: false, mensaje: 'Escribe un comentario.' };
    const { error } = await this.supabase.from('comentarios').insert({ post_id: postId, texto: limpio });
    if (!error) await this.cargar();
    return this.sb.resultado(error, 'Comentario publicado.');
  }

  // Solo el autor puede eliminar; los posts de productos se eliminan junto con el producto
  async eliminar(postId: number): Promise<Resultado> {
    const { error } = await this.supabase.from('posts').delete().eq('id', postId);
    if (!error) await this.cargar();
    return this.sb.resultado(error, 'Publicación eliminada.');
  }
}
