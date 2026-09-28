import { Injectable } from '@angular/core';
import { createClient, PostgrestError } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import { Database } from './database.types';

export interface Resultado {
  exito: boolean;
  mensaje: string;
}

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  readonly client = createClient<Database>(environment.supabaseUrl, environment.supabaseKey);

  // Escucha cambios (Realtime) en las tablas dadas y llama a alCambiar, agrupando ráfagas de eventos
  // (p. ej. aceptar un préstamo cambia varias tablas a la vez). RLS filtra lo que llega.
  // Devuelve la función para dejar de escuchar.
  escuchar(canal: string, tablas: (keyof Database['public']['Tables'])[], alCambiar: () => void): () => void {
    let espera: ReturnType<typeof setTimeout> | undefined;
    const programar = () => {
      clearTimeout(espera);
      espera = setTimeout(alCambiar, 150);
    };
    const nombre = `${canal}-${crypto.randomUUID()}`;
    let ch = this.client.channel(nombre);
    for (const table of tablas) {
      ch = ch.on('postgres_changes', { event: '*', schema: 'public', table }, programar);
    }
    ch.subscribe();
    return () => {
      clearTimeout(espera);
      this.client.removeChannel(ch);
    };
  }

  // Convierte la respuesta de una consulta/función en un Resultado para mostrar en pantalla.
  // Los mensajes de las funciones de la base ya vienen en español.
  resultado(error: PostgrestError | null, mensajeExito: string): Resultado {
    if (!error) return { exito: true, mensaje: mensajeExito };
    console.error('[Supabase]', error);
    if (/row-level security|permission denied/i.test(error.message)) {
      return { exito: false, mensaje: 'No tienes permiso para hacer eso.' };
    }
    return { exito: false, mensaje: error.message || 'Ocurrió un error, intenta de nuevo.' };
  }
}
