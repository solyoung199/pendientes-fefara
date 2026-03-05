/*
  # Actualizar datos mock con tipo incidente

  1. Cambios
    - Actualizar casos existentes con valores de ejemplo para tipo_incidente
    - Algunos casos tendrán: 'Amparo', 'CD', 'Medico'
    - Otros casos se dejarán con NULL (campo vacío)
  
  2. Notas
    - Se actualizan solo algunos registros para demostrar el uso del campo
    - Los valores son ejemplos representativos
*/

UPDATE public.casos
SET tipo_incidente = 'Amparo'
WHERE numero_tramite = 'FEFARA-2024-012';

UPDATE public.casos
SET tipo_incidente = 'CD'
WHERE numero_tramite = 'FEFARA-2024-013';

UPDATE public.casos
SET tipo_incidente = 'Medico'
WHERE numero_tramite = 'FEFARA-2024-014';