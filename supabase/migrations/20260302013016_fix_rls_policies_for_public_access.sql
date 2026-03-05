/*
  # Ajustar Políticas RLS para Acceso Público MVP
  
  ## Descripción
  Modifica las políticas RLS para permitir acceso público a los datos
  en modo MVP sin requerir autenticación.
  
  ## Cambios
  - Elimina políticas restrictivas existentes
  - Crea políticas públicas para SELECT, INSERT, UPDATE en todas las tablas
  - Permite acceso anónimo para demostración del MVP
  
  ## Notas
  - Esto es para MVP/demo
  - En producción se debe implementar autenticación real
*/

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Usuarios autenticados pueden ver usuarios" ON usuarios;
DROP POLICY IF EXISTS "Usuarios autenticados pueden insertar usuarios" ON usuarios;
DROP POLICY IF EXISTS "Usuarios autenticados pueden actualizar usuarios" ON usuarios;

DROP POLICY IF EXISTS "Usuarios autenticados pueden ver casos" ON casos;
DROP POLICY IF EXISTS "Usuarios autenticados pueden insertar casos" ON casos;
DROP POLICY IF EXISTS "Usuarios autenticados pueden actualizar casos" ON casos;
DROP POLICY IF EXISTS "Usuarios autenticados pueden eliminar casos" ON casos;

DROP POLICY IF EXISTS "Usuarios autenticados pueden ver timeline" ON timeline_fefara;
DROP POLICY IF EXISTS "Usuarios autenticados pueden insertar timeline" ON timeline_fefara;

DROP POLICY IF EXISTS "Usuarios autenticados pueden ver acciones" ON acciones;
DROP POLICY IF EXISTS "Usuarios autenticados pueden insertar acciones" ON acciones;
DROP POLICY IF EXISTS "Usuarios autenticados pueden actualizar acciones" ON acciones;

-- Crear políticas públicas para tabla usuarios
CREATE POLICY "Acceso público para ver usuarios"
  ON usuarios FOR SELECT
  USING (true);

CREATE POLICY "Acceso público para insertar usuarios"
  ON usuarios FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Acceso público para actualizar usuarios"
  ON usuarios FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Crear políticas públicas para tabla casos
CREATE POLICY "Acceso público para ver casos"
  ON casos FOR SELECT
  USING (true);

CREATE POLICY "Acceso público para insertar casos"
  ON casos FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Acceso público para actualizar casos"
  ON casos FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Acceso público para eliminar casos"
  ON casos FOR DELETE
  USING (true);

-- Crear políticas públicas para tabla timeline_fefara
CREATE POLICY "Acceso público para ver timeline"
  ON timeline_fefara FOR SELECT
  USING (true);

CREATE POLICY "Acceso público para insertar timeline"
  ON timeline_fefara FOR INSERT
  WITH CHECK (true);

-- Crear políticas públicas para tabla acciones
CREATE POLICY "Acceso público para ver acciones"
  ON acciones FOR SELECT
  USING (true);

CREATE POLICY "Acceso público para insertar acciones"
  ON acciones FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Acceso público para actualizar acciones"
  ON acciones FOR UPDATE
  USING (true)
  WITH CHECK (true);