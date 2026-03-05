export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      usuarios: {
        Row: {
          id: string
          nombre: string
          email: string
          activo: boolean
          created_at: string
        }
        Insert: {
          id?: string
          nombre: string
          email: string
          activo?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          nombre?: string
          email?: string
          activo?: boolean
          created_at?: string
        }
      }
      casos: {
        Row: {
          id: string
          numero_tramite: string
          numero_tratamiento: string | null
          afiliado_nombre: string
          afiliado_cuil: string
          tratamiento: string | null
          diagnostico: string | null
          medico: string | null
          medico_matricula: string | null
          estado_fefara: string
          motivo: string | null
          fecha_ingreso: string
          fecha_vencimiento: string | null
          estado_andar: string
          asignado_a: string | null
          decision_eliminar: string
          comentario_interno: string | null
          tipo_incidente: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          numero_tramite: string
          numero_tratamiento?: string | null
          afiliado_nombre: string
          afiliado_cuil: string
          tratamiento?: string | null
          diagnostico?: string | null
          medico?: string | null
          medico_matricula?: string | null
          estado_fefara: string
          motivo?: string | null
          fecha_ingreso: string
          fecha_vencimiento?: string | null
          estado_andar?: string
          asignado_a?: string | null
          decision_eliminar?: string
          comentario_interno?: string | null
          tipo_incidente?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          numero_tramite?: string
          numero_tratamiento?: string | null
          afiliado_nombre?: string
          afiliado_cuil?: string
          tratamiento?: string | null
          diagnostico?: string | null
          medico?: string | null
          medico_matricula?: string | null
          estado_fefara?: string
          motivo?: string | null
          fecha_ingreso?: string
          fecha_vencimiento?: string | null
          estado_andar?: string
          asignado_a?: string | null
          decision_eliminar?: string
          comentario_interno?: string | null
          tipo_incidente?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      timeline_fefara: {
        Row: {
          id: string
          caso_id: string
          fecha: string
          estado: string
          descripcion: string | null
          created_at: string
        }
        Insert: {
          id?: string
          caso_id: string
          fecha: string
          estado: string
          descripcion?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          caso_id?: string
          fecha?: string
          estado?: string
          descripcion?: string | null
          created_at?: string
        }
      }
      acciones: {
        Row: {
          id: string
          caso_id: string
          tipo: 'Llamado' | 'Correo'
          fecha: string
          resultado: string
          observacion: string | null
          numero_contacto: string
          usuario: string
          created_at: string
        }
        Insert: {
          id?: string
          caso_id: string
          tipo: 'Llamado' | 'Correo'
          fecha: string
          resultado: string
          observacion?: string | null
          numero_contacto: string
          usuario: string
          created_at?: string
        }
        Update: {
          id?: string
          caso_id?: string
          tipo?: 'Llamado' | 'Correo'
          fecha?: string
          resultado?: string
          observacion?: string | null
          numero_contacto?: string
          usuario?: string
          created_at?: string
        }
      }
    }
  }
}
