// Generado desde el esquema de Supabase (proyecto TePresto). Regenerar si cambia la base.
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      comentarios: {
        Row: { autor_id: string; created_at: string; id: number; post_id: number; texto: string }
        Insert: { autor_id?: string; created_at?: string; id?: never; post_id: number; texto: string }
        Update: { autor_id?: string; created_at?: string; id?: never; post_id?: number; texto?: string }
        Relationships: [
          { foreignKeyName: "comentarios_autor_id_fkey"; columns: ["autor_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] },
          { foreignKeyName: "comentarios_post_id_fkey"; columns: ["post_id"]; isOneToOne: false; referencedRelation: "posts"; referencedColumns: ["id"] },
        ]
      }
      comunidades: {
        Row: { codigo: string; created_at: string; id: number; nombre: string }
        Insert: { codigo: string; created_at?: string; id?: never; nombre: string }
        Update: { codigo?: string; created_at?: string; id?: never; nombre?: string }
        Relationships: []
      }
      conversaciones: {
        Row: { created_at: string; id: number; item_id: number | null; leido_a: string; leido_b: string; usuario_a: string; usuario_b: string }
        Insert: { created_at?: string; id?: never; item_id?: number | null; leido_a?: string; leido_b?: string; usuario_a: string; usuario_b: string }
        Update: { created_at?: string; id?: never; item_id?: number | null; leido_a?: string; leido_b?: string; usuario_a?: string; usuario_b?: string }
        Relationships: [
          { foreignKeyName: "conversaciones_item_id_fkey"; columns: ["item_id"]; isOneToOne: false; referencedRelation: "items"; referencedColumns: ["id"] },
          { foreignKeyName: "conversaciones_usuario_a_fkey"; columns: ["usuario_a"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] },
          { foreignKeyName: "conversaciones_usuario_b_fkey"; columns: ["usuario_b"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] },
        ]
      }
      favoritos: {
        Row: { created_at: string; item_id: number; usuario_id: string }
        Insert: { created_at?: string; item_id: number; usuario_id?: string }
        Update: { created_at?: string; item_id?: number; usuario_id?: string }
        Relationships: [
          { foreignKeyName: "favoritos_item_id_fkey"; columns: ["item_id"]; isOneToOne: false; referencedRelation: "items"; referencedColumns: ["id"] },
          { foreignKeyName: "favoritos_usuario_id_fkey"; columns: ["usuario_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] },
        ]
      }
      items: {
        Row: { arrendado: boolean; arrendado_hasta: string | null; comunidad_id: number; created_at: string; descripcion: string; dueno_id: string; foto: string; id: number; nombre: string; precio: string; tipo: string }
        Insert: { arrendado?: boolean; arrendado_hasta?: string | null; comunidad_id?: number; created_at?: string; descripcion?: string; dueno_id?: string; foto?: string; id?: never; nombre: string; precio?: string; tipo?: string }
        Update: { arrendado?: boolean; arrendado_hasta?: string | null; comunidad_id?: number; created_at?: string; descripcion?: string; dueno_id?: string; foto?: string; id?: never; nombre?: string; precio?: string; tipo?: string }
        Relationships: [
          { foreignKeyName: "items_comunidad_id_fkey"; columns: ["comunidad_id"]; isOneToOne: false; referencedRelation: "comunidades"; referencedColumns: ["id"] },
          { foreignKeyName: "items_dueno_id_fkey"; columns: ["dueno_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] },
        ]
      }
      mensajes: {
        Row: { autor_id: string; conversacion_id: number; created_at: string; id: number; texto: string }
        Insert: { autor_id?: string; conversacion_id: number; created_at?: string; id?: never; texto: string }
        Update: { autor_id?: string; conversacion_id?: number; created_at?: string; id?: never; texto?: string }
        Relationships: [
          { foreignKeyName: "mensajes_autor_id_fkey"; columns: ["autor_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] },
          { foreignKeyName: "mensajes_conversacion_id_fkey"; columns: ["conversacion_id"]; isOneToOne: false; referencedRelation: "conversaciones"; referencedColumns: ["id"] },
        ]
      }
      posts: {
        Row: { autor_id: string; comunidad_id: number; created_at: string; id: number; item_id: number | null; texto: string; tipo: string }
        Insert: { autor_id?: string; comunidad_id?: number; created_at?: string; id?: never; item_id?: number | null; texto?: string; tipo: string }
        Update: { autor_id?: string; comunidad_id?: number; created_at?: string; id?: never; item_id?: number | null; texto?: string; tipo?: string }
        Relationships: [
          { foreignKeyName: "posts_autor_id_fkey"; columns: ["autor_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] },
          { foreignKeyName: "posts_comunidad_id_fkey"; columns: ["comunidad_id"]; isOneToOne: false; referencedRelation: "comunidades"; referencedColumns: ["id"] },
          { foreignKeyName: "posts_item_id_fkey"; columns: ["item_id"]; isOneToOne: false; referencedRelation: "items"; referencedColumns: ["id"] },
        ]
      }
      prestamos: {
        Row: { created_at: string; desde: string; dueno_id: string; estado: string; hasta: string; id: number; item_id: number; mensaje: string; solicitante_id: string }
        Insert: { created_at?: string; desde: string; dueno_id: string; estado?: string; hasta: string; id?: never; item_id: number; mensaje?: string; solicitante_id: string }
        Update: { created_at?: string; desde?: string; dueno_id?: string; estado?: string; hasta?: string; id?: never; item_id?: number; mensaje?: string; solicitante_id?: string }
        Relationships: [
          { foreignKeyName: "prestamos_dueno_id_fkey"; columns: ["dueno_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] },
          { foreignKeyName: "prestamos_item_id_fkey"; columns: ["item_id"]; isOneToOne: false; referencedRelation: "items"; referencedColumns: ["id"] },
          { foreignKeyName: "prestamos_solicitante_id_fkey"; columns: ["solicitante_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] },
        ]
      }
      profiles: {
        Row: { comunidad_id: number | null; created_at: string; depto: string | null; foto: string | null; full_name: string | null; id: string }
        Insert: { comunidad_id?: number | null; created_at?: string; depto?: string | null; foto?: string | null; full_name?: string | null; id: string }
        Update: { comunidad_id?: number | null; created_at?: string; depto?: string | null; foto?: string | null; full_name?: string | null; id?: string }
        Relationships: [
          { foreignKeyName: "profiles_comunidad_id_fkey"; columns: ["comunidad_id"]; isOneToOne: false; referencedRelation: "comunidades"; referencedColumns: ["id"] },
        ]
      }
    }
    Views: { [_ in never]: never }
    Functions: {
      abrir_conversacion: { Args: { p_item?: number; p_otro: string }; Returns: number }
      aceptar_prestamo: { Args: { p_id: number }; Returns: undefined }
      cancelar_prestamo: { Args: { p_id: number }; Returns: undefined }
      marcar_devuelto: { Args: { p_id: number }; Returns: undefined }
      marcar_leida: { Args: { p_conversacion: number }; Returns: undefined }
      mi_comunidad: { Args: never; Returns: number }
      ofrecer_producto_nuevo: { Args: { p_nombre: string; p_tipo: string; p_precio: string; p_descripcion: string; p_foto: string; p_texto: string }; Returns: number }
      rechazar_prestamo: { Args: { p_id: number }; Returns: undefined }
      solicitar_prestamo: { Args: { p_desde: string; p_hasta: string; p_item: number; p_mensaje?: string }; Returns: number }
      unirse_comunidad: { Args: { p_codigo: string; p_depto: string }; Returns: string }
      validar_codigo: { Args: { p_codigo: string }; Returns: string }
    }
    Enums: { [_ in never]: never }
    CompositeTypes: { [_ in never]: never }
  }
}

type Tablas = Database['public']['Tables'];
export type Fila<T extends keyof Tablas> = Tablas[T]['Row'];
