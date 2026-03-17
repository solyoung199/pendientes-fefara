/*
  # Agregar campos detallados de medicamentos

  1. Cambios
    - Agrega campos de identificación (id_prescripcion, renglon, droga)
    - Agrega campos de presentación y forma farmacéutica
    - Agrega campos de dosis (dosis_prescripta, dosis_unitaria)
    - Agrega campos de cantidad y unidades
    - Agrega campos financieros (cobertura, precio_unitario, precio_total, monto_cobertura, copago)
    - Agrega campos de estado (estado, codigo_estado, motivo_rechazo, observacion)
    - Agrega campos de trazabilidad (prescripcion, dispensa, autorizacion, farmacia, cuit_farmacia, lote, serie, nro_trazabilidad)
    - Agrega campo de seguimiento (seguimiento_descripcion)
*/

-- Agregar nuevas columnas a la tabla drogas_tratamiento
DO $$
BEGIN
  -- Campos de identificación
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'drogas_tratamiento' AND column_name = 'id_prescripcion') THEN
    ALTER TABLE drogas_tratamiento ADD COLUMN id_prescripcion text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'drogas_tratamiento' AND column_name = 'renglon') THEN
    ALTER TABLE drogas_tratamiento ADD COLUMN renglon text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'drogas_tratamiento' AND column_name = 'droga') THEN
    ALTER TABLE drogas_tratamiento ADD COLUMN droga text;
  END IF;

  -- Campos de presentación
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'drogas_tratamiento' AND column_name = 'presentacion') THEN
    ALTER TABLE drogas_tratamiento ADD COLUMN presentacion text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'drogas_tratamiento' AND column_name = 'forma_farmaceutica') THEN
    ALTER TABLE drogas_tratamiento ADD COLUMN forma_farmaceutica text;
  END IF;

  -- Campos de dosis
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'drogas_tratamiento' AND column_name = 'dosis_prescripta') THEN
    ALTER TABLE drogas_tratamiento ADD COLUMN dosis_prescripta text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'drogas_tratamiento' AND column_name = 'dosis_unitaria') THEN
    ALTER TABLE drogas_tratamiento ADD COLUMN dosis_unitaria text;
  END IF;

  -- Campos de cantidad
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'drogas_tratamiento' AND column_name = 'cantidad') THEN
    ALTER TABLE drogas_tratamiento ADD COLUMN cantidad text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'drogas_tratamiento' AND column_name = 'unidades') THEN
    ALTER TABLE drogas_tratamiento ADD COLUMN unidades text;
  END IF;

  -- Campos financieros
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'drogas_tratamiento' AND column_name = 'cobertura') THEN
    ALTER TABLE drogas_tratamiento ADD COLUMN cobertura text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'drogas_tratamiento' AND column_name = 'precio_unitario') THEN
    ALTER TABLE drogas_tratamiento ADD COLUMN precio_unitario text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'drogas_tratamiento' AND column_name = 'precio_total') THEN
    ALTER TABLE drogas_tratamiento ADD COLUMN precio_total text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'drogas_tratamiento' AND column_name = 'monto_cobertura') THEN
    ALTER TABLE drogas_tratamiento ADD COLUMN monto_cobertura text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'drogas_tratamiento' AND column_name = 'copago') THEN
    ALTER TABLE drogas_tratamiento ADD COLUMN copago text;
  END IF;

  -- Campos de estado
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'drogas_tratamiento' AND column_name = 'estado') THEN
    ALTER TABLE drogas_tratamiento ADD COLUMN estado text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'drogas_tratamiento' AND column_name = 'codigo_estado') THEN
    ALTER TABLE drogas_tratamiento ADD COLUMN codigo_estado text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'drogas_tratamiento' AND column_name = 'motivo_rechazo') THEN
    ALTER TABLE drogas_tratamiento ADD COLUMN motivo_rechazo text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'drogas_tratamiento' AND column_name = 'observacion') THEN
    ALTER TABLE drogas_tratamiento ADD COLUMN observacion text;
  END IF;

  -- Campos de trazabilidad
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'drogas_tratamiento' AND column_name = 'prescripcion') THEN
    ALTER TABLE drogas_tratamiento ADD COLUMN prescripcion text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'drogas_tratamiento' AND column_name = 'dispensa') THEN
    ALTER TABLE drogas_tratamiento ADD COLUMN dispensa text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'drogas_tratamiento' AND column_name = 'autorizacion') THEN
    ALTER TABLE drogas_tratamiento ADD COLUMN autorizacion text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'drogas_tratamiento' AND column_name = 'farmacia') THEN
    ALTER TABLE drogas_tratamiento ADD COLUMN farmacia text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'drogas_tratamiento' AND column_name = 'cuit_farmacia') THEN
    ALTER TABLE drogas_tratamiento ADD COLUMN cuit_farmacia text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'drogas_tratamiento' AND column_name = 'lote') THEN
    ALTER TABLE drogas_tratamiento ADD COLUMN lote text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'drogas_tratamiento' AND column_name = 'serie') THEN
    ALTER TABLE drogas_tratamiento ADD COLUMN serie text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'drogas_tratamiento' AND column_name = 'nro_trazabilidad') THEN
    ALTER TABLE drogas_tratamiento ADD COLUMN nro_trazabilidad text;
  END IF;

  -- Campo de seguimiento
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'drogas_tratamiento' AND column_name = 'seguimiento_descripcion') THEN
    ALTER TABLE drogas_tratamiento ADD COLUMN seguimiento_descripcion text;
  END IF;
END $$;
