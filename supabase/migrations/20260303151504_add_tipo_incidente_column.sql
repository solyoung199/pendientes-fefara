/*
  # Agregar columna tipo_incidente

  1. Cambios
    - Agregar columna `tipo_incidente` a la tabla `casos`
      - Tipo: text (nullable)
      - Valores posibles: 'Amparo', 'CD', 'Medico', u otros valores
      - Permite NULL (campo opcional)
  
  2. Notas
    - La columna puede estar vacía o contener valores como 'Amparo', 'CD', 'Medico'
    - No se aplica constraint CHECK para permitir flexibilidad en los tipos de incidente
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' 
    AND table_name = 'casos' 
    AND column_name = 'tipo_incidente'
  ) THEN
    ALTER TABLE public.casos ADD COLUMN tipo_incidente text;
  END IF;
END $$;