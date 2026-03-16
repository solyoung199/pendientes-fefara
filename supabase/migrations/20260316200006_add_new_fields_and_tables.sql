/*
  # Add new fields and tables for SGIT enhancements

  ## Changes
  
  1. New columns in casos table
    - `afiliado_con_cud` (text): Affiliate with CUD information
    - `tipo_beneficio` (text): Benefit type (Beneficio de Excepción, Onco y Especiales)
  
  2. New table: drogas_tratamiento
    - `id` (uuid, primary key)
    - `caso_id` (uuid, foreign key to casos)
    - `numero_tratamiento` (text): Treatment number
    - `id_interno` (text): Internal ID
    - `tipo_ficha` (text): Record type
    - `ciclo` (text): Cycle
    - `duracion` (text): Duration
    - `tipo_origen` (text): Origin type
    - `primera_droga` (text): First drug
    - `cantidad_drogas` (integer): Number of drugs
    - `cie` (text): CIE code
    - `diagnostico` (text): Diagnosis
    - `indicacion_oncologica` (text): Oncological indication
    - `fecha_ingreso` (date): Entry date
    - `fecha_vencimiento` (date): Expiration date
    - `fecha_autorizacion` (date): Authorization date
    - `fecha_anulacion` (date): Cancellation date
    - `fecha_primera_dispensa` (date): First dispensation date
    - `fecha_ultima_dispensa` (date): Last dispensation date
    - `created_at` (timestamptz)

  3. New table: historial_gestion_andar
    - `id` (uuid, primary key)
    - `caso_id` (uuid, foreign key to casos)
    - `fecha` (timestamptz): Action date
    - `usuario_id` (uuid, foreign key to usuarios)
    - `usuario_nombre` (text): User name
    - `accion` (text): Action type
    - `codigo` (text): Action code
    - `estado_anterior` (text): Previous state
    - `estado_nuevo` (text): New state
    - `asignado_anterior` (text): Previous assigned user
    - `asignado_nuevo` (text): New assigned user
    - `observaciones` (text): Observations
    - `created_at` (timestamptz)

  4. New table: codigos_accion
    - `id` (uuid, primary key)
    - `codigo` (text, unique): Action code
    - `descripcion` (text): Description
    - `activo` (boolean): Active status
    - `created_at` (timestamptz)

  5. Security
    - Enable RLS on all new tables
    - Add policies for public read access (temporary for MVP)
*/

-- Add new columns to casos table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'casos' AND column_name = 'afiliado_con_cud'
  ) THEN
    ALTER TABLE casos ADD COLUMN afiliado_con_cud text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'casos' AND column_name = 'tipo_beneficio'
  ) THEN
    ALTER TABLE casos ADD COLUMN tipo_beneficio text;
  END IF;
END $$;

-- Create drogas_tratamiento table
CREATE TABLE IF NOT EXISTS drogas_tratamiento (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  caso_id uuid REFERENCES casos(id) ON DELETE CASCADE NOT NULL,
  numero_tratamiento text,
  id_interno text,
  tipo_ficha text,
  ciclo text,
  duracion text,
  tipo_origen text,
  primera_droga text,
  cantidad_drogas integer DEFAULT 0,
  cie text,
  diagnostico text,
  indicacion_oncologica text,
  fecha_ingreso date,
  fecha_vencimiento date,
  fecha_autorizacion date,
  fecha_anulacion date,
  fecha_primera_dispensa date,
  fecha_ultima_dispensa date,
  created_at timestamptz DEFAULT now()
);

-- Create historial_gestion_andar table
CREATE TABLE IF NOT EXISTS historial_gestion_andar (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  caso_id uuid REFERENCES casos(id) ON DELETE CASCADE NOT NULL,
  fecha timestamptz DEFAULT now(),
  usuario_id uuid REFERENCES usuarios(id),
  usuario_nombre text NOT NULL,
  accion text NOT NULL,
  codigo text,
  estado_anterior text,
  estado_nuevo text,
  asignado_anterior text,
  asignado_nuevo text,
  observaciones text,
  created_at timestamptz DEFAULT now()
);

-- Create codigos_accion table
CREATE TABLE IF NOT EXISTS codigos_accion (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo text UNIQUE NOT NULL,
  descripcion text,
  activo boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE drogas_tratamiento ENABLE ROW LEVEL SECURITY;
ALTER TABLE historial_gestion_andar ENABLE ROW LEVEL SECURITY;
ALTER TABLE codigos_accion ENABLE ROW LEVEL SECURITY;

-- Create policies for drogas_tratamiento
CREATE POLICY "Allow public read access to drogas_tratamiento"
  ON drogas_tratamiento
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert access to drogas_tratamiento"
  ON drogas_tratamiento
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update access to drogas_tratamiento"
  ON drogas_tratamiento
  FOR UPDATE
  TO public
  USING (true);

CREATE POLICY "Allow public delete access to drogas_tratamiento"
  ON drogas_tratamiento
  FOR DELETE
  TO public
  USING (true);

-- Create policies for historial_gestion_andar
CREATE POLICY "Allow public read access to historial_gestion_andar"
  ON historial_gestion_andar
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert access to historial_gestion_andar"
  ON historial_gestion_andar
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update access to historial_gestion_andar"
  ON historial_gestion_andar
  FOR UPDATE
  TO public
  USING (true);

CREATE POLICY "Allow public delete access to historial_gestion_andar"
  ON historial_gestion_andar
  FOR DELETE
  TO public
  USING (true);

-- Create policies for codigos_accion
CREATE POLICY "Allow public read access to codigos_accion"
  ON codigos_accion
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert access to codigos_accion"
  ON codigos_accion
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update access to codigos_accion"
  ON codigos_accion
  FOR UPDATE
  TO public
  USING (true);

CREATE POLICY "Allow public delete access to codigos_accion"
  ON codigos_accion
  FOR DELETE
  TO public
  USING (true);

-- Insert sample action codes
INSERT INTO codigos_accion (codigo, descripcion, activo) VALUES
  ('COD001', 'Documentación incompleta', true),
  ('COD002', 'Pendiente de autorización médica', true),
  ('COD003', 'En proceso de revisión', true),
  ('COD004', 'Contacto exitoso con afiliado', true),
  ('COD005', 'Sin respuesta del afiliado', true),
  ('COD006', 'Derivado a área médica', true),
  ('COD007', 'Derivado a auditoría', true),
  ('COD008', 'Caso resuelto satisfactoriamente', true),
  ('COD009', 'Requiere información adicional', true),
  ('COD010', 'Ampliación de tratamiento', true)
ON CONFLICT (codigo) DO NOTHING;