/*
  # Actualizar más casos con tipo incidente

  1. Cambios
    - Actualizar múltiples casos con valores variados de tipo_incidente
    - Agregar: 'Amparo', 'CD', 'Medico'
    - Dejar algunos casos con NULL (sin tipo)
  
  2. Notas
    - Se distribuyen los tipos de forma variada para demostración
    - Algunos casos permanecen sin tipo_incidente
*/

UPDATE public.casos SET tipo_incidente = 'Medico' WHERE numero_tramite = 'FEFARA-2024-001';
UPDATE public.casos SET tipo_incidente = 'CD' WHERE numero_tramite = 'FEFARA-2024-002';
UPDATE public.casos SET tipo_incidente = 'Amparo' WHERE numero_tramite = 'FEFARA-2024-003';
UPDATE public.casos SET tipo_incidente = 'Medico' WHERE numero_tramite = 'FEFARA-2024-004';
UPDATE public.casos SET tipo_incidente = NULL WHERE numero_tramite = 'FEFARA-2024-005';
UPDATE public.casos SET tipo_incidente = 'CD' WHERE numero_tramite = 'FEFARA-2024-006';
UPDATE public.casos SET tipo_incidente = 'Amparo' WHERE numero_tramite = 'FEFARA-2024-007';
UPDATE public.casos SET tipo_incidente = 'Medico' WHERE numero_tramite = 'FEFARA-2024-008';
UPDATE public.casos SET tipo_incidente = NULL WHERE numero_tramite = 'FEFARA-2024-009';
UPDATE public.casos SET tipo_incidente = 'CD' WHERE numero_tramite = 'FEFARA-2024-010';
UPDATE public.casos SET tipo_incidente = 'Amparo' WHERE numero_tramite = 'FEFARA-2024-011';
UPDATE public.casos SET tipo_incidente = NULL WHERE numero_tramite = 'FEFARA-2024-012';