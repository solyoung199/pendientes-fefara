/*
  # Agregar campo de rol a la tabla usuarios

  1. Changes
    - Agrega columna `rol` a la tabla `usuarios` con tres valores posibles:
      - 'Owner': Rol de administrador con permisos completos
      - 'Gestor': Rol de gestor con permisos de asignación y gestión
      - 'Operario': Rol básico sin permisos de asignación
    - Por defecto, los usuarios existentes se asignan como 'Gestor'
  
  2. Security
    - No se modifican las políticas RLS existentes
*/

-- Agregar la columna rol a la tabla usuarios
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'usuarios' AND column_name = 'rol'
  ) THEN
    ALTER TABLE usuarios ADD COLUMN rol text NOT NULL DEFAULT 'Gestor';
    
    -- Agregar constraint para validar los valores permitidos
    ALTER TABLE usuarios ADD CONSTRAINT usuarios_rol_check 
      CHECK (rol IN ('Owner', 'Gestor', 'Operario'));
  END IF;
END $$;