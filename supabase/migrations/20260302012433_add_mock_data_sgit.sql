/*
  # Agregar Mock Data Completo para SGIT MVP
  
  ## Descripción
  Inserta datos de ejemplo realistas para demostrar funcionalidad del sistema.
  Incluye 12 casos con variedad de estados FEFARA y ANDAR, timeline de eventos,
  y acciones internas (llamados y correos).
  
  ## Datos Agregados
  
  ### Casos (12 registros)
  - Variedad de estados FEFARA: Observado, Rechazado, Derivado, Autorizado parcial, Autorizado
  - Variedad de estados ANDAR: Pendiente, En gestión, Esperando respuesta, Resuelto, Cerrado
  - Campos adicionales: número de tratamiento, matrícula médico, comentario interno
  
  ### Timeline FEFARA (5-8 eventos por caso)
  - Eventos cronológicos simulando flujo real de trámites
  
  ### Acciones Internas (múltiples por caso)
  - Llamados con diferentes resultados
  - Correos con diferentes estados
  - Números de contacto variados
  
  ## Notas
  - Los datos son ficticios pero realistas
  - Fechas distribuidas en los últimos 2 meses
  - Asignaciones variadas entre usuarios
*/

-- Agregar columnas adicionales a la tabla casos
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'casos' AND column_name = 'numero_tratamiento'
  ) THEN
    ALTER TABLE casos ADD COLUMN numero_tratamiento text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'casos' AND column_name = 'medico_matricula'
  ) THEN
    ALTER TABLE casos ADD COLUMN medico_matricula text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'casos' AND column_name = 'comentario_interno'
  ) THEN
    ALTER TABLE casos ADD COLUMN comentario_interno text;
  END IF;
END $$;

-- Insertar casos de ejemplo adicionales
DO $$
DECLARE
  usuario1_id uuid;
  usuario2_id uuid;
  usuario3_id uuid;
BEGIN
  SELECT id INTO usuario1_id FROM usuarios WHERE email = 'maria.gonzalez@andar.org' LIMIT 1;
  SELECT id INTO usuario2_id FROM usuarios WHERE email = 'juan.perez@andar.org' LIMIT 1;
  SELECT id INTO usuario3_id FROM usuarios WHERE email = 'ana.martinez@andar.org' LIMIT 1;
  
  -- Limpiar datos existentes para evitar duplicados
  DELETE FROM acciones;
  DELETE FROM timeline_fefara;
  DELETE FROM casos;
  
  -- Insertar 12 casos con variedad de estados
  INSERT INTO casos (
    numero_tramite, numero_tratamiento, afiliado_nombre, afiliado_cuil, tratamiento, 
    diagnostico, medico, medico_matricula, estado_fefara, motivo, 
    fecha_ingreso, fecha_vencimiento, estado_andar, asignado_a, 
    decision_eliminar, comentario_interno, created_at
  ) VALUES
  -- Caso 1
  (
    'FEFARA-2024-001', 'T-2024-12456', 'Roberto Carlos Fernández', '20-12345678-9',
    'Terapia física rehabilitación', 'Lesión de rodilla derecha - Post operatorio',
    'Dr. Alberto Sánchez', 'MN 45678', 'Observado', 'Falta documentación médica actualizada',
    '2024-01-15', '2024-03-15', 'En gestión', usuario1_id,
    'No', 'Paciente colabora activamente. Pendiente informe kinesiológico.',
    '2024-01-15 09:30:00'
  ),
  -- Caso 2
  (
    'FEFARA-2024-002', 'T-2024-12457', 'Patricia Mónica López', '27-98765432-1',
    'Consulta cardiológica especializada', 'Hipertensión arterial - Control',
    'Dra. Carmen Ruiz', 'MN 23456', 'Autorizado', 'Control preventivo anual',
    '2024-01-20', '2024-04-20', 'Cerrado', usuario1_id,
    'No', 'Trámite completado sin observaciones.',
    '2024-01-20 10:15:00'
  ),
  -- Caso 3
  (
    'FEFARA-2024-003', 'T-2024-12458', 'Carlos Alberto Domínguez', '20-55443322-8',
    'Estudios de laboratorio completos', 'Diabetes tipo 2 - Seguimiento',
    'Dr. Miguel Torres', 'MN 67890', 'Derivado', 'Requiere evaluación en centro especializado',
    '2024-02-01', '2024-05-01', 'Esperando respuesta', usuario2_id,
    'Pendiente', 'Derivado a endocrinología. Aguardando turno.',
    '2024-02-01 11:00:00'
  ),
  -- Caso 4
  (
    'FEFARA-2024-004', 'T-2024-12459', 'María Soledad Gómez', '27-22334455-6',
    'Resonancia magnética de columna', 'Hernia discal L4-L5',
    'Dr. Fernando Paz', 'MN 34567', 'Autorizado parcial', 'Autorizado solo estudio sin contraste',
    '2024-01-25', '2024-03-25', 'Resuelto', usuario2_id,
    'No', 'Paciente acepta condiciones. Turno programado.',
    '2024-01-25 14:20:00'
  ),
  -- Caso 5
  (
    'FEFARA-2024-005', 'T-2024-12460', 'Jorge Luis Morales', '20-66778899-0',
    'Prótesis de cadera', 'Artrosis severa de cadera izquierda',
    'Dr. Raúl Gómez', 'MN 12345', 'Rechazado', 'No cumple criterios de cobertura vigentes',
    '2024-02-10', '2024-04-10', 'Cerrado', usuario3_id,
    'Sí', 'Paciente informado. No presenta apelación.',
    '2024-02-10 09:45:00'
  ),
  -- Caso 6
  (
    'FEFARA-2024-006', 'T-2024-12461', 'Ana Beatriz Rodríguez', '27-44556677-2',
    'Tratamiento odontológico integral', 'Periodontitis avanzada',
    'Dra. Silvia Méndez', 'MN 78901', 'Observado', 'Requiere presupuesto actualizado',
    '2024-02-05', '2024-04-05', 'En gestión', usuario1_id,
    'No', 'Solicitado nuevo presupuesto al profesional.',
    '2024-02-05 15:30:00'
  ),
  -- Caso 7
  (
    'FEFARA-2024-007', 'T-2024-12462', 'Diego Martín Acosta', '20-33221100-4',
    'Sesiones de psicología', 'Trastorno de ansiedad generalizada',
    'Lic. Laura Benítez', 'MN 56789', 'Autorizado', 'Aprobadas 12 sesiones',
    '2024-01-30', '2024-06-30', 'Resuelto', usuario2_id,
    'No', 'Autorización emitida. Paciente notificado.',
    '2024-01-30 10:00:00'
  ),
  -- Caso 8
  (
    'FEFARA-2024-008', 'T-2024-12463', 'Claudia Alejandra Vega', '27-88990011-7',
    'Mamografía bilateral con ecografía', 'Control preventivo',
    'Dra. Patricia Rojas', 'MN 45123', 'Autorizado parcial', 'Autorizada mamografía, ecografía requiere orden actualizada',
    '2024-02-12', '2024-03-12', 'Esperando respuesta', usuario3_id,
    'No', 'Aguardando nueva orden médica.',
    '2024-02-12 11:30:00'
  ),
  -- Caso 9
  (
    'FEFARA-2024-009', 'T-2024-12464', 'Gustavo Ariel Moreno', '20-11223344-5',
    'Cirugía de cataratas ojo derecho', 'Catarata senil',
    'Dr. Hernán López', 'MN 67123', 'Derivado', 'Derivado a oftalmología de mayor complejidad',
    '2024-02-08', '2024-04-08', 'En gestión', usuario1_id,
    'No', 'Centro especializado contactado.',
    '2024-02-08 16:00:00'
  ),
  -- Caso 10
  (
    'FEFARA-2024-010', 'T-2024-12465', 'Mónica Susana Ríos', '27-55667788-9',
    'Plantillas ortopédicas personalizadas', 'Pie plano bilateral',
    'Dr. Pablo Sosa', 'MN 89012', 'Rechazado', 'Prestación no incluida en PMO',
    '2024-02-15', '2024-03-15', 'Cerrado', usuario2_id,
    'Sí', 'Informado a afiliado. No corresponde cobertura.',
    '2024-02-15 12:00:00'
  ),
  -- Caso 11
  (
    'FEFARA-2024-011', 'T-2024-12466', 'Ricardo Daniel Castro', '20-99887766-3',
    'Electrocardiograma de esfuerzo', 'Antecedentes cardiovasculares',
    'Dr. Eduardo Fernández', 'MN 23890', 'Observado', 'Falta historia clínica completa',
    '2024-02-18', '2024-04-18', 'Pendiente', usuario3_id,
    'Pendiente', 'Primera contactación sin éxito.',
    '2024-02-18 09:00:00'
  ),
  -- Caso 12
  (
    'FEFARA-2024-012', 'T-2024-12467', 'Silvia Marcela Paz', '27-66554433-1',
    'Tomografía computada de abdomen', 'Dolor abdominal recurrente',
    'Dra. Gabriela Torres', 'MN 34678', 'Autorizado', 'Autorizado sin observaciones',
    '2024-02-20', '2024-05-20', 'Resuelto', usuario1_id,
    'No', 'Estudio realizado. Trámite cerrado.',
    '2024-02-20 13:30:00'
  );

END $$;

-- Insertar timeline FEFARA para cada caso
DO $$
DECLARE
  caso_id uuid;
BEGIN
  -- Timeline Caso 1
  SELECT id INTO caso_id FROM casos WHERE numero_tramite = 'FEFARA-2024-001';
  IF caso_id IS NOT NULL THEN
    INSERT INTO timeline_fefara (caso_id, fecha, estado, descripcion) VALUES
    (caso_id, '2024-01-15 09:30:00', 'Ingresado', 'Trámite ingresado al sistema FEFARA'),
    (caso_id, '2024-01-16 14:00:00', 'En Revisión', 'Documentación en análisis por auditoría médica'),
    (caso_id, '2024-01-18 10:30:00', 'Observado', 'Falta informe kinesiológico actualizado'),
    (caso_id, '2024-01-22 11:00:00', 'Observado', 'Se reiteró solicitud de documentación'),
    (caso_id, '2024-01-25 15:30:00', 'En Revisión', 'Documentación parcial recibida');
  END IF;

  -- Timeline Caso 2
  SELECT id INTO caso_id FROM casos WHERE numero_tramite = 'FEFARA-2024-002';
  IF caso_id IS NOT NULL THEN
    INSERT INTO timeline_fefara (caso_id, fecha, estado, descripcion) VALUES
    (caso_id, '2024-01-20 10:15:00', 'Ingresado', 'Trámite ingresado al sistema'),
    (caso_id, '2024-01-22 09:00:00', 'En Revisión', 'Revisión médica iniciada'),
    (caso_id, '2024-01-23 16:00:00', 'Autorizado', 'Aprobado sin observaciones'),
    (caso_id, '2024-01-24 10:00:00', 'Cerrado', 'Consulta realizada - Trámite finalizado');
  END IF;

  -- Timeline Caso 3
  SELECT id INTO caso_id FROM casos WHERE numero_tramite = 'FEFARA-2024-003';
  IF caso_id IS NOT NULL THEN
    INSERT INTO timeline_fefara (caso_id, fecha, estado, descripcion) VALUES
    (caso_id, '2024-02-01 11:00:00', 'Ingresado', 'Solicitud recibida'),
    (caso_id, '2024-02-02 14:30:00', 'En Revisión', 'Evaluación de complejidad'),
    (caso_id, '2024-02-05 09:00:00', 'Derivado', 'Requiere centro de mayor complejidad'),
    (caso_id, '2024-02-08 10:30:00', 'Derivado', 'Gestión de derivación en proceso'),
    (caso_id, '2024-02-12 11:00:00', 'Derivado', 'Aguardando confirmación de turno');
  END IF;

  -- Timeline Caso 4
  SELECT id INTO caso_id FROM casos WHERE numero_tramite = 'FEFARA-2024-004';
  IF caso_id IS NOT NULL THEN
    INSERT INTO timeline_fefara (caso_id, fecha, estado, descripcion) VALUES
    (caso_id, '2024-01-25 14:20:00', 'Ingresado', 'Solicitud de RMN recibida'),
    (caso_id, '2024-01-26 10:00:00', 'En Revisión', 'Análisis de orden médica'),
    (caso_id, '2024-01-29 15:00:00', 'Observado', 'Requiere justificación para contraste'),
    (caso_id, '2024-01-31 09:30:00', 'Autorizado parcial', 'Autorizado estudio sin contraste'),
    (caso_id, '2024-02-02 11:00:00', 'Autorizado parcial', 'Paciente notificado de autorización parcial');
  END IF;

  -- Timeline Caso 5
  SELECT id INTO caso_id FROM casos WHERE numero_tramite = 'FEFARA-2024-005';
  IF caso_id IS NOT NULL THEN
    INSERT INTO timeline_fefara (caso_id, fecha, estado, descripcion) VALUES
    (caso_id, '2024-02-10 09:45:00', 'Ingresado', 'Solicitud de prótesis recibida'),
    (caso_id, '2024-02-11 14:00:00', 'En Revisión', 'Evaluación de criterios de cobertura'),
    (caso_id, '2024-02-13 10:00:00', 'Observado', 'No cumple antigüedad mínima'),
    (caso_id, '2024-02-15 11:30:00', 'Rechazado', 'No cumple requisitos PMO vigente'),
    (caso_id, '2024-02-16 09:00:00', 'Rechazado', 'Notificación enviada al afiliado');
  END IF;

  -- Timeline Caso 6
  SELECT id INTO caso_id FROM casos WHERE numero_tramite = 'FEFARA-2024-006';
  IF caso_id IS NOT NULL THEN
    INSERT INTO timeline_fefara (caso_id, fecha, estado, descripcion) VALUES
    (caso_id, '2024-02-05 15:30:00', 'Ingresado', 'Solicitud odontológica ingresada'),
    (caso_id, '2024-02-06 10:00:00', 'En Revisión', 'Revisión de presupuesto'),
    (caso_id, '2024-02-08 14:00:00', 'Observado', 'Presupuesto desactualizado'),
    (caso_id, '2024-02-10 09:30:00', 'Observado', 'Aguardando actualización de profesional');
  END IF;

  -- Timeline Caso 7
  SELECT id INTO caso_id FROM casos WHERE numero_tramite = 'FEFARA-2024-007';
  IF caso_id IS NOT NULL THEN
    INSERT INTO timeline_fefara (caso_id, fecha, estado, descripcion) VALUES
    (caso_id, '2024-01-30 10:00:00', 'Ingresado', 'Solicitud de sesiones psicológicas'),
    (caso_id, '2024-01-31 11:00:00', 'En Revisión', 'Evaluación de diagnóstico'),
    (caso_id, '2024-02-01 15:00:00', 'Autorizado', 'Aprobadas 12 sesiones'),
    (caso_id, '2024-02-02 09:00:00', 'Autorizado', 'Autorización notificada');
  END IF;

  -- Timeline Caso 8
  SELECT id INTO caso_id FROM casos WHERE numero_tramite = 'FEFARA-2024-008';
  IF caso_id IS NOT NULL THEN
    INSERT INTO timeline_fefara (caso_id, fecha, estado, descripcion) VALUES
    (caso_id, '2024-02-12 11:30:00', 'Ingresado', 'Solicitud de estudios mamarios'),
    (caso_id, '2024-02-13 10:00:00', 'En Revisión', 'Análisis de orden médica'),
    (caso_id, '2024-02-14 14:30:00', 'Observado', 'Orden de ecografía desactualizada'),
    (caso_id, '2024-02-15 09:00:00', 'Autorizado parcial', 'Autorizada solo mamografía'),
    (caso_id, '2024-02-16 10:00:00', 'Autorizado parcial', 'Aguardando orden actualizada para eco');
  END IF;

  -- Timeline Caso 9
  SELECT id INTO caso_id FROM casos WHERE numero_tramite = 'FEFARA-2024-009';
  IF caso_id IS NOT NULL THEN
    INSERT INTO timeline_fefara (caso_id, fecha, estado, descripcion) VALUES
    (caso_id, '2024-02-08 16:00:00', 'Ingresado', 'Solicitud de cirugía de cataratas'),
    (caso_id, '2024-02-09 11:00:00', 'En Revisión', 'Evaluación de complejidad quirúrgica'),
    (caso_id, '2024-02-12 14:00:00', 'Derivado', 'Requiere centro oftalmológico especializado'),
    (caso_id, '2024-02-14 10:30:00', 'Derivado', 'Contacto con centros de referencia'),
    (caso_id, '2024-02-16 15:00:00', 'Derivado', 'Aguardando disponibilidad de turnos');
  END IF;

  -- Timeline Caso 10
  SELECT id INTO caso_id FROM casos WHERE numero_tramite = 'FEFARA-2024-010';
  IF caso_id IS NOT NULL THEN
    INSERT INTO timeline_fefara (caso_id, fecha, estado, descripcion) VALUES
    (caso_id, '2024-02-15 12:00:00', 'Ingresado', 'Solicitud de plantillas ortopédicas'),
    (caso_id, '2024-02-16 09:30:00', 'En Revisión', 'Análisis de cobertura PMO'),
    (caso_id, '2024-02-17 14:00:00', 'Rechazado', 'Prestación no incluida en PMO'),
    (caso_id, '2024-02-18 10:00:00', 'Rechazado', 'Notificación enviada');
  END IF;

  -- Timeline Caso 11
  SELECT id INTO caso_id FROM casos WHERE numero_tramite = 'FEFARA-2024-011';
  IF caso_id IS NOT NULL THEN
    INSERT INTO timeline_fefara (caso_id, fecha, estado, descripcion) VALUES
    (caso_id, '2024-02-18 09:00:00', 'Ingresado', 'Solicitud de ergometría'),
    (caso_id, '2024-02-19 11:00:00', 'En Revisión', 'Revisión de antecedentes'),
    (caso_id, '2024-02-20 15:30:00', 'Observado', 'Falta historia clínica completa'),
    (caso_id, '2024-02-22 10:00:00', 'Observado', 'Reiteración de documentación pendiente');
  END IF;

  -- Timeline Caso 12
  SELECT id INTO caso_id FROM casos WHERE numero_tramite = 'FEFARA-2024-012';
  IF caso_id IS NOT NULL THEN
    INSERT INTO timeline_fefara (caso_id, fecha, estado, descripcion) VALUES
    (caso_id, '2024-02-20 13:30:00', 'Ingresado', 'Solicitud de TAC abdominal'),
    (caso_id, '2024-02-21 10:00:00', 'En Revisión', 'Análisis de indicación médica'),
    (caso_id, '2024-02-22 14:00:00', 'Autorizado', 'Aprobado sin observaciones'),
    (caso_id, '2024-02-23 09:00:00', 'Autorizado', 'Estudio realizado'),
    (caso_id, '2024-02-24 11:00:00', 'Cerrado', 'Trámite finalizado');
  END IF;
END $$;

-- Insertar acciones internas para casos
DO $$
DECLARE
  caso_id uuid;
BEGIN
  -- Acciones Caso 1
  SELECT id INTO caso_id FROM casos WHERE numero_tramite = 'FEFARA-2024-001';
  IF caso_id IS NOT NULL THEN
    INSERT INTO acciones (caso_id, tipo, fecha, resultado, observacion, numero_contacto, usuario) VALUES
    (caso_id, 'Llamado', '2024-01-23', 'Contacto efectivo', 'Afiliado informado de documentación faltante. Compromete envío', '341-5551234', 'María González'),
    (caso_id, 'Correo', '2024-01-24', 'Mail 1 enviado', 'Enviado detalle de documentación requerida', '341-5551234', 'María González'),
    (caso_id, 'Llamado', '2024-01-26', 'Sin respuesta', 'No contesta. Dejado mensaje de voz', '341-5551234', 'María González');
  END IF;

  -- Acciones Caso 2
  SELECT id INTO caso_id FROM casos WHERE numero_tramite = 'FEFARA-2024-002';
  IF caso_id IS NOT NULL THEN
    INSERT INTO acciones (caso_id, tipo, fecha, resultado, observacion, numero_contacto, usuario) VALUES
    (caso_id, 'Llamado', '2024-01-23', 'Contacto efectivo', 'Consulta realizada. Afiliado conforme', '351-6667890', 'María González'),
    (caso_id, 'Correo', '2024-01-24', 'Mail 1 enviado', 'Enviada autorización y datos de prestador', '351-6667890', 'María González');
  END IF;

  -- Acciones Caso 3
  SELECT id INTO caso_id FROM casos WHERE numero_tramite = 'FEFARA-2024-003';
  IF caso_id IS NOT NULL THEN
    INSERT INTO acciones (caso_id, tipo, fecha, resultado, observacion, numero_contacto, usuario) VALUES
    (caso_id, 'Llamado', '2024-02-06', 'Contacto efectivo', 'Explicada situación de derivación. Aguarda turno', '341-7778899', 'Juan Pérez'),
    (caso_id, 'Correo', '2024-02-07', 'Mail 1 enviado', 'Datos de centro especializado enviados', '341-7778899', 'Juan Pérez'),
    (caso_id, 'Llamado', '2024-02-14', 'Sin respuesta', 'No responde. Reintentará mañana', '341-7778899', 'Juan Pérez');
  END IF;

  -- Acciones Caso 4
  SELECT id INTO caso_id FROM casos WHERE numero_tramite = 'FEFARA-2024-004';
  IF caso_id IS NOT NULL THEN
    INSERT INTO acciones (caso_id, tipo, fecha, resultado, observacion, numero_contacto, usuario) VALUES
    (caso_id, 'Llamado', '2024-02-01', 'Contacto efectivo', 'Explicada autorización parcial. Afiliado acepta', '343-4445566', 'Juan Pérez'),
    (caso_id, 'Correo', '2024-02-01', 'Mail 1 enviado', 'Autorización parcial enviada', '343-4445566', 'Juan Pérez'),
    (caso_id, 'Llamado', '2024-02-03', 'Contacto efectivo', 'Confirma turno programado', '343-4445566', 'Juan Pérez');
  END IF;

  -- Acciones Caso 5
  SELECT id INTO caso_id FROM casos WHERE numero_tramite = 'FEFARA-2024-005';
  IF caso_id IS NOT NULL THEN
    INSERT INTO acciones (caso_id, tipo, fecha, resultado, observacion, numero_contacto, usuario) VALUES
    (caso_id, 'Llamado', '2024-02-16', 'Contacto efectivo', 'Informado rechazo. No presenta disconformidad', '341-9998877', 'Ana Martínez'),
    (caso_id, 'Correo', '2024-02-16', 'Mail 1 enviado', 'Notificación de rechazo con fundamentos', '341-9998877', 'Ana Martínez');
  END IF;

  -- Acciones Caso 6
  SELECT id INTO caso_id FROM casos WHERE numero_tramite = 'FEFARA-2024-006';
  IF caso_id IS NOT NULL THEN
    INSERT INTO acciones (caso_id, tipo, fecha, resultado, observacion, numero_contacto, usuario) VALUES
    (caso_id, 'Llamado', '2024-02-09', 'Contacto efectivo', 'Solicitará presupuesto actualizado a odontóloga', '351-2223344', 'María González'),
    (caso_id, 'Correo', '2024-02-09', 'Mail 1 enviado', 'Detalle de observaciones enviado', '351-2223344', 'María González'),
    (caso_id, 'Llamado', '2024-02-13', 'Sin respuesta', 'Buzón lleno. No puede dejar mensaje', '351-2223344', 'María González');
  END IF;

  -- Acciones Caso 7
  SELECT id INTO caso_id FROM casos WHERE numero_tramite = 'FEFARA-2024-007';
  IF caso_id IS NOT NULL THEN
    INSERT INTO acciones (caso_id, tipo, fecha, resultado, observacion, numero_contacto, usuario) VALUES
    (caso_id, 'Llamado', '2024-02-02', 'Contacto efectivo', 'Afiliado agradece. Consultará horarios', '341-5554433', 'Juan Pérez'),
    (caso_id, 'Correo', '2024-02-02', 'Mail 1 enviado', 'Autorización y listado de profesionales enviado', '341-5554433', 'Juan Pérez');
  END IF;

  -- Acciones Caso 8
  SELECT id INTO caso_id FROM casos WHERE numero_tramite = 'FEFARA-2024-008';
  IF caso_id IS NOT NULL THEN
    INSERT INTO acciones (caso_id, tipo, fecha, resultado, observacion, numero_contacto, usuario) VALUES
    (caso_id, 'Llamado', '2024-02-16', 'Contacto efectivo', 'Explicada situación. Solicitará orden actualizada', '343-7776655', 'Ana Martínez'),
    (caso_id, 'Correo', '2024-02-16', 'Mail 1 enviado', 'Detalle de orden faltante enviado', '343-7776655', 'Ana Martínez');
  END IF;

  -- Acciones Caso 9
  SELECT id INTO caso_id FROM casos WHERE numero_tramite = 'FEFARA-2024-009';
  IF caso_id IS NOT NULL THEN
    INSERT INTO acciones (caso_id, tipo, fecha, resultado, observacion, numero_contacto, usuario) VALUES
    (caso_id, 'Llamado', '2024-02-13', 'Contacto efectivo', 'Informada derivación. Aguarda contacto de centro', '341-8889900', 'María González'),
    (caso_id, 'Correo', '2024-02-13', 'Mail 1 enviado', 'Información de derivación enviada', '341-8889900', 'María González'),
    (caso_id, 'Llamado', '2024-02-17', 'Sin respuesta', 'Teléfono fuera de área. Reintentará', '341-8889900', 'María González');
  END IF;

  -- Acciones Caso 10
  SELECT id INTO caso_id FROM casos WHERE numero_tramite = 'FEFARA-2024-010';
  IF caso_id IS NOT NULL THEN
    INSERT INTO acciones (caso_id, tipo, fecha, resultado, observacion, numero_contacto, usuario) VALUES
    (caso_id, 'Llamado', '2024-02-18', 'Contacto efectivo', 'Notificado rechazo. Comprende situación', '351-1112233', 'Juan Pérez'),
    (caso_id, 'Correo', '2024-02-18', 'Mail 1 enviado', 'Rechazo con fundamento legal enviado', '351-1112233', 'Juan Pérez');
  END IF;

  -- Acciones Caso 11
  SELECT id INTO caso_id FROM casos WHERE numero_tramite = 'FEFARA-2024-011';
  IF caso_id IS NOT NULL THEN
    INSERT INTO acciones (caso_id, tipo, fecha, resultado, observacion, numero_contacto, usuario) VALUES
    (caso_id, 'Llamado', '2024-02-21', 'Número incorrecto', 'El número no corresponde al afiliado', '341-0009988', 'Ana Martínez'),
    (caso_id, 'Correo', '2024-02-21', 'Pendiente de envío', 'Aguardando corrección de datos de contacto', '341-0009988', 'Ana Martínez');
  END IF;

  -- Acciones Caso 12
  SELECT id INTO caso_id FROM casos WHERE numero_tramite = 'FEFARA-2024-012';
  IF caso_id IS NOT NULL THEN
    INSERT INTO acciones (caso_id, tipo, fecha, resultado, observacion, numero_contacto, usuario) VALUES
    (caso_id, 'Llamado', '2024-02-23', 'Contacto efectivo', 'Estudio realizado. Afiliado conforme', '343-5556677', 'María González'),
    (caso_id, 'Correo', '2024-02-23', 'Mail 1 enviado', 'Confirmación de realización enviada', '343-5556677', 'María González');
  END IF;
END $$;