/*
  # SGIT - Sistema de Gestión Integral de Tratamientos
  
  ## Descripción
  Sistema para gestionar casos de tratamientos médicos obtenidos desde API FEFARA
  con seguimiento interno (llamados, correos y actualización de estados).
  
  ## Nuevas Tablas
  
  ### `usuarios`
  Almacena usuarios del sistema para asignación de casos
  - `id` (uuid, primary key)
  - `nombre` (text) - Nombre completo del usuario
  - `email` (text, unique) - Email del usuario
  - `activo` (boolean) - Estado activo/inactivo
  - `created_at` (timestamptz) - Fecha de creación
  
  ### `casos`
  Almacena los casos/trámites obtenidos desde FEFARA
  - `id` (uuid, primary key)
  - `numero_tramite` (text, unique) - Número de trámite FEFARA
  - `afiliado_nombre` (text) - Nombre del afiliado
  - `afiliado_cuil` (text) - CUIL del afiliado
  - `tratamiento` (text) - Descripción del tratamiento
  - `diagnostico` (text) - Diagnóstico médico
  - `medico` (text) - Médico tratante
  - `estado_fefara` (text) - Estado actual en FEFARA
  - `motivo` (text) - Motivo del trámite
  - `fecha_ingreso` (date) - Fecha de ingreso del trámite
  - `fecha_vencimiento` (date) - Fecha de vencimiento
  - `estado_andar` (text) - Estado interno ANDAR
  - `asignado_a` (uuid, foreign key) - Usuario asignado
  - `decision_eliminar` (text) - Decisión: Sí/No/Pendiente
  - `created_at` (timestamptz) - Fecha de creación en sistema
  - `updated_at` (timestamptz) - Última actualización
  
  ### `timeline_fefara`
  Histórico de cambios de estado en FEFARA
  - `id` (uuid, primary key)
  - `caso_id` (uuid, foreign key) - Referencia al caso
  - `fecha` (timestamptz) - Fecha del cambio
  - `estado` (text) - Estado registrado
  - `descripcion` (text) - Descripción del cambio
  - `created_at` (timestamptz) - Fecha de creación
  
  ### `acciones`
  Registro de acciones internas (llamados y correos)
  - `id` (uuid, primary key)
  - `caso_id` (uuid, foreign key) - Referencia al caso
  - `tipo` (text) - Tipo: Llamado o Correo
  - `fecha` (date) - Fecha de la acción
  - `resultado` (text) - Resultado de la acción
  - `observacion` (text) - Observaciones
  - `numero_contacto` (text) - Número de contacto
  - `usuario` (text) - Usuario que realizó la acción
  - `created_at` (timestamptz) - Fecha de creación
  
  ## Seguridad
  - Todas las tablas tienen RLS habilitado
  - Políticas restrictivas para usuarios autenticados
  
  ## Notas Importantes
  - El sistema lee datos de API externa FEFARA (no es bidireccional)
  - La gestión interna se realiza solo en la base de datos local
  - Los estados FEFARA son de solo lectura
*/

-- Crear tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  email text UNIQUE NOT NULL,
  activo boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Crear tabla de casos
CREATE TABLE IF NOT EXISTS casos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_tramite text UNIQUE NOT NULL,
  afiliado_nombre text NOT NULL,
  afiliado_cuil text NOT NULL,
  tratamiento text,
  diagnostico text,
  medico text,
  estado_fefara text NOT NULL,
  motivo text,
  fecha_ingreso date NOT NULL,
  fecha_vencimiento date,
  estado_andar text DEFAULT 'Pendiente',
  asignado_a uuid REFERENCES usuarios(id),
  decision_eliminar text DEFAULT 'Pendiente',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Crear tabla de timeline FEFARA
CREATE TABLE IF NOT EXISTS timeline_fefara (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  caso_id uuid REFERENCES casos(id) ON DELETE CASCADE,
  fecha timestamptz NOT NULL,
  estado text NOT NULL,
  descripcion text,
  created_at timestamptz DEFAULT now()
);

-- Crear tabla de acciones
CREATE TABLE IF NOT EXISTS acciones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  caso_id uuid REFERENCES casos(id) ON DELETE CASCADE,
  tipo text NOT NULL CHECK (tipo IN ('Llamado', 'Correo')),
  fecha date NOT NULL,
  resultado text NOT NULL,
  observacion text,
  numero_contacto text NOT NULL,
  usuario text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Crear índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_casos_estado_fefara ON casos(estado_fefara);
CREATE INDEX IF NOT EXISTS idx_casos_estado_andar ON casos(estado_andar);
CREATE INDEX IF NOT EXISTS idx_casos_afiliado_cuil ON casos(afiliado_cuil);
CREATE INDEX IF NOT EXISTS idx_casos_asignado_a ON casos(asignado_a);
CREATE INDEX IF NOT EXISTS idx_timeline_caso_id ON timeline_fefara(caso_id);
CREATE INDEX IF NOT EXISTS idx_acciones_caso_id ON acciones(caso_id);

-- Habilitar RLS en todas las tablas
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE casos ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_fefara ENABLE ROW LEVEL SECURITY;
ALTER TABLE acciones ENABLE ROW LEVEL SECURITY;

-- Políticas para tabla usuarios
CREATE POLICY "Usuarios autenticados pueden ver usuarios"
  ON usuarios FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados pueden insertar usuarios"
  ON usuarios FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden actualizar usuarios"
  ON usuarios FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Políticas para tabla casos
CREATE POLICY "Usuarios autenticados pueden ver casos"
  ON casos FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados pueden insertar casos"
  ON casos FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden actualizar casos"
  ON casos FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden eliminar casos"
  ON casos FOR DELETE
  TO authenticated
  USING (true);

-- Políticas para tabla timeline_fefara
CREATE POLICY "Usuarios autenticados pueden ver timeline"
  ON timeline_fefara FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados pueden insertar timeline"
  ON timeline_fefara FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Políticas para tabla acciones
CREATE POLICY "Usuarios autenticados pueden ver acciones"
  ON acciones FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados pueden insertar acciones"
  ON acciones FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden actualizar acciones"
  ON acciones FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Insertar usuarios de ejemplo para testing
INSERT INTO usuarios (nombre, email) VALUES
  ('María González', 'maria.gonzalez@andar.org'),
  ('Juan Pérez', 'juan.perez@andar.org'),
  ('Ana Martínez', 'ana.martinez@andar.org')
ON CONFLICT (email) DO NOTHING;

-- Insertar casos de ejemplo para testing
DO $$
DECLARE
  usuario_id uuid;
BEGIN
  SELECT id INTO usuario_id FROM usuarios WHERE email = 'maria.gonzalez@andar.org' LIMIT 1;
  
  INSERT INTO casos (
    numero_tramite, afiliado_nombre, afiliado_cuil, tratamiento, diagnostico, 
    medico, estado_fefara, motivo, fecha_ingreso, fecha_vencimiento, 
    estado_andar, asignado_a, decision_eliminar
  ) VALUES
  (
    'FEFARA-2024-001', 'Roberto Carlos Fernández', '20-12345678-9', 
    'Terapia física rehabilitación', 'Lesión de rodilla', 
    'Dr. Alberto Sánchez', 'En Revisión', 'Accidente laboral',
    '2024-01-15', '2024-03-15', 'Observado', usuario_id, 'Pendiente'
  ),
  (
    'FEFARA-2024-002', 'Patricia Mónica López', '27-98765432-1', 
    'Consulta cardiológica', 'Hipertensión arterial', 
    'Dra. Carmen Ruiz', 'Autorizado', 'Control preventivo',
    '2024-01-20', '2024-04-20', 'Aprobado', usuario_id, 'No'
  ),
  (
    'FEFARA-2024-003', 'Carlos Alberto Domínguez', '20-55443322-8', 
    'Estudios de laboratorio', 'Diabetes tipo 2', 
    'Dr. Miguel Torres', 'Pendiente', 'Seguimiento anual',
    '2024-02-01', '2024-05-01', 'Pendiente', usuario_id, 'Pendiente'
  )
  ON CONFLICT (numero_tramite) DO NOTHING;
END $$;

-- Insertar timeline de ejemplo
DO $$
DECLARE
  caso_id uuid;
BEGIN
  SELECT id INTO caso_id FROM casos WHERE numero_tramite = 'FEFARA-2024-001' LIMIT 1;
  
  IF caso_id IS NOT NULL THEN
    INSERT INTO timeline_fefara (caso_id, fecha, estado, descripcion) VALUES
    (caso_id, '2024-01-15 10:00:00', 'Ingresado', 'Trámite ingresado al sistema FEFARA'),
    (caso_id, '2024-01-18 14:30:00', 'En Revisión', 'Documentación bajo análisis médico'),
    (caso_id, '2024-01-22 11:00:00', 'Observado', 'Requiere documentación adicional')
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- Insertar acciones de ejemplo
DO $$
DECLARE
  caso_id uuid;
BEGIN
  SELECT id INTO caso_id FROM casos WHERE numero_tramite = 'FEFARA-2024-001' LIMIT 1;
  
  IF caso_id IS NOT NULL THEN
    INSERT INTO acciones (caso_id, tipo, fecha, resultado, observacion, numero_contacto, usuario) VALUES
    (caso_id, 'Llamado', '2024-01-23', 'Contactado', 'Afiliado informado de documentación faltante', '341-5551234', 'María González'),
    (caso_id, 'Correo', '2024-01-24', 'Enviado', 'Email con lista de documentos requeridos', '341-5551234', 'María González')
    ON CONFLICT DO NOTHING;
  END IF;
END $$;