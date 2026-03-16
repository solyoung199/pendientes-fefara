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
          rol: 'Owner' | 'Gestor' | 'Operario'
          created_at: string
        }
        Insert: {
          id?: string
          nombre: string
          email: string
          activo?: boolean
          rol?: 'Owner' | 'Gestor' | 'Operario'
          created_at?: string
        }
        Update: {
          id?: string
          nombre?: string
          email?: string
          activo?: boolean
          rol?: 'Owner' | 'Gestor' | 'Operario'
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
          afiliado_con_cud: string | null
          tipo_beneficio: string | null
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
          afiliado_con_cud?: string | null
          tipo_beneficio?: string | null
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
          afiliado_con_cud?: string | null
          tipo_beneficio?: string | null
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
          tipo: 'Llamado' | 'Correo' | 'WhatsApp'
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
          tipo: 'Llamado' | 'Correo' | 'WhatsApp'
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
          tipo?: 'Llamado' | 'Correo' | 'WhatsApp'
          fecha?: string
          resultado?: string
          observacion?: string | null
          numero_contacto?: string
          usuario?: string
          created_at?: string
        }
      }
      drogas_tratamiento: {
        Row: {
          id: string
          caso_id: string
          numero_tratamiento: string | null
          id_interno: string | null
          tipo_ficha: string | null
          ciclo: string | null
          duracion: string | null
          tipo_origen: string | null
          primera_droga: string | null
          cantidad_drogas: number
          cie: string | null
          diagnostico: string | null
          indicacion_oncologica: string | null
          fecha_ingreso: string | null
          fecha_vencimiento: string | null
          fecha_autorizacion: string | null
          fecha_anulacion: string | null
          fecha_primera_dispensa: string | null
          fecha_ultima_dispensa: string | null
          created_at: string
        }
        Insert: {
          id?: string
          caso_id: string
          numero_tratamiento?: string | null
          id_interno?: string | null
          tipo_ficha?: string | null
          ciclo?: string | null
          duracion?: string | null
          tipo_origen?: string | null
          primera_droga?: string | null
          cantidad_drogas?: number
          cie?: string | null
          diagnostico?: string | null
          indicacion_oncologica?: string | null
          fecha_ingreso?: string | null
          fecha_vencimiento?: string | null
          fecha_autorizacion?: string | null
          fecha_anulacion?: string | null
          fecha_primera_dispensa?: string | null
          fecha_ultima_dispensa?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          caso_id?: string
          numero_tratamiento?: string | null
          id_interno?: string | null
          tipo_ficha?: string | null
          ciclo?: string | null
          duracion?: string | null
          tipo_origen?: string | null
          primera_droga?: string | null
          cantidad_drogas?: number
          cie?: string | null
          diagnostico?: string | null
          indicacion_oncologica?: string | null
          fecha_ingreso?: string | null
          fecha_vencimiento?: string | null
          fecha_autorizacion?: string | null
          fecha_anulacion?: string | null
          fecha_primera_dispensa?: string | null
          fecha_ultima_dispensa?: string | null
          created_at?: string
        }
      }
      historial_gestion_andar: {
        Row: {
          id: string
          caso_id: string
          fecha: string
          usuario_id: string | null
          usuario_nombre: string
          accion: string
          codigo: string | null
          estado_anterior: string | null
          estado_nuevo: string | null
          asignado_anterior: string | null
          asignado_nuevo: string | null
          observaciones: string | null
          created_at: string
        }
        Insert: {
          id?: string
          caso_id: string
          fecha?: string
          usuario_id?: string | null
          usuario_nombre: string
          accion: string
          codigo?: string | null
          estado_anterior?: string | null
          estado_nuevo?: string | null
          asignado_anterior?: string | null
          asignado_nuevo?: string | null
          observaciones?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          caso_id?: string
          fecha?: string
          usuario_id?: string | null
          usuario_nombre?: string
          accion?: string
          codigo?: string | null
          estado_anterior?: string | null
          estado_nuevo?: string | null
          asignado_anterior?: string | null
          asignado_nuevo?: string | null
          observaciones?: string | null
          created_at?: string
        }
      }
      codigos_accion: {
        Row: {
          id: string
          codigo: string
          descripcion: string | null
          activo: boolean
          created_at: string
        }
        Insert: {
          id?: string
          codigo: string
          descripcion?: string | null
          activo?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          codigo?: string
          descripcion?: string | null
          activo?: boolean
          created_at?: string
        }
      }
    }
  }
}
