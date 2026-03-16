import { useState, useEffect } from 'react';
import { ArrowLeft, Save, Lock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Database } from '../lib/database.types';

type Caso = Database['public']['Tables']['casos']['Row'];
type Timeline = Database['public']['Tables']['timeline_fefara']['Row'];
type Accion = Database['public']['Tables']['acciones']['Row'];
type Usuario = Database['public']['Tables']['usuarios']['Row'];
type DrogaTratamiento = Database['public']['Tables']['drogas_tratamiento']['Row'];
type HistorialGestion = Database['public']['Tables']['historial_gestion_andar']['Row'];
type CodigoAccion = Database['public']['Tables']['codigos_accion']['Row'];

interface DetalleCasoProps {
  casoId: string;
  onVolver: () => void;
  puedeGestionar?: boolean;
}

export default function DetalleCaso({ casoId, onVolver, puedeGestionar }: DetalleCasoProps) {
  const { usuario } = useAuth();
  const [caso, setCaso] = useState<Caso | null>(null);
  const [timeline, setTimeline] = useState<Timeline[]>([]);
  const [acciones, setAcciones] = useState<Accion[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [drogas, setDrogas] = useState<DrogaTratamiento[]>([]);
  const [historialGestion, setHistorialGestion] = useState<HistorialGestion[]>([]);
  const [codigosAccion, setCodigosAccion] = useState<CodigoAccion[]>([]);
  const [loading, setLoading] = useState(true);

  const puedeGestionarCaso = puedeGestionar !== undefined
    ? puedeGestionar
    : (caso?.asignado_a === usuario?.id);

  const [estadoAndar, setEstadoAndar] = useState('');
  const [asignadoA, setAsignadoA] = useState('');
  const [decisionEliminar, setDecisionEliminar] = useState('');
  const [comentarioInterno, setComentarioInterno] = useState('');

  const [tipoAccion, setTipoAccion] = useState<'Llamado' | 'Correo' | 'WhatsApp'>('Llamado');
  const [fechaAccion, setFechaAccion] = useState('');
  const [resultadoAccion, setResultadoAccion] = useState('');
  const [codigoAccion, setCodigoAccion] = useState('');
  const [codigoBusqueda, setCodigoBusqueda] = useState('');

  useEffect(() => {
    cargarDatos();
  }, [casoId]);

  const cargarDatos = async () => {
    setLoading(true);

    const [casoResult, timelineResult, accionesResult, usuariosResult, drogasResult, historialResult, codigosResult] = await Promise.all([
      supabase.from('casos').select('*').eq('id', casoId).maybeSingle(),
      supabase.from('timeline_fefara').select('*').eq('caso_id', casoId).order('fecha', { ascending: false }),
      supabase.from('acciones').select('*').eq('caso_id', casoId).order('fecha', { ascending: false }),
      supabase.from('usuarios').select('*').eq('activo', true),
      supabase.from('drogas_tratamiento').select('*').eq('caso_id', casoId),
      supabase.from('historial_gestion_andar').select('*').eq('caso_id', casoId).order('fecha', { ascending: false }),
      supabase.from('codigos_accion').select('*').eq('activo', true).order('codigo', { ascending: true })
    ]);

    if (casoResult.data) {
      setCaso(casoResult.data);
      setEstadoAndar(casoResult.data.estado_andar);
      setAsignadoA(casoResult.data.asignado_a || '');
      setDecisionEliminar(casoResult.data.decision_eliminar);
      setComentarioInterno(casoResult.data.comentario_interno || '');
    }
    if (timelineResult.data) setTimeline(timelineResult.data);
    if (accionesResult.data) setAcciones(accionesResult.data);
    if (usuariosResult.data) setUsuarios(usuariosResult.data);
    if (drogasResult.data) setDrogas(drogasResult.data);
    if (historialResult.data) setHistorialGestion(historialResult.data);
    if (codigosResult.data) setCodigosAccion(codigosResult.data);

    setLoading(false);
  };

  const guardarGestionInterna = async () => {
    if (!caso) return;

    if (!puedeGestionarCaso) {
      alert('No tienes permisos para gestionar este caso. Solo el usuario asignado puede realizar cambios.');
      return;
    }

    const estadoAnterior = caso.estado_andar;
    const asignadoAnterior = caso.asignado_a;

    const { error } = await supabase
      .from('casos')
      .update({
        estado_andar: estadoAndar,
        asignado_a: asignadoA || null,
        decision_eliminar: decisionEliminar,
        comentario_interno: comentarioInterno || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', caso.id);

    if (!error) {
      await supabase.from('historial_gestion_andar').insert({
        caso_id: caso.id,
        usuario_id: usuario?.id || null,
        usuario_nombre: usuario?.nombre || 'Sistema',
        accion: 'Actualización de gestión interna',
        estado_anterior: estadoAnterior,
        estado_nuevo: estadoAndar,
        asignado_anterior: asignadoAnterior,
        asignado_nuevo: asignadoA || null,
        observaciones: comentarioInterno || null
      });

      alert('Datos guardados correctamente');
      cargarDatos();
    } else {
      alert('Error al guardar: ' + error.message);
    }
  };

  const guardarAccion = async () => {
    if (!caso || !tipoAccion || !fechaAccion || !resultadoAccion || !codigoAccion) {
      alert('Por favor complete todos los campos obligatorios');
      return;
    }

    if (!puedeGestionarCaso) {
      alert('No tienes permisos para registrar acciones en este caso. Solo el usuario asignado puede realizar acciones.');
      return;
    }

    const { data, error } = await supabase
      .from('acciones')
      .insert({
        caso_id: caso.id,
        tipo: tipoAccion,
        fecha: fechaAccion,
        resultado: resultadoAccion,
        observacion: null,
        numero_contacto: null,
        usuario: usuario?.nombre || 'Usuario Sistema'
      })
      .select()
      .single();

    if (!error && data) {
      const numeroContactoGenerado = `CONT-${data.id.substring(0, 8).toUpperCase()}`;

      await supabase
        .from('acciones')
        .update({ numero_contacto: numeroContactoGenerado })
        .eq('id', data.id);

      await supabase.from('historial_gestion_andar').insert({
        caso_id: caso.id,
        usuario_id: usuario?.id || null,
        usuario_nombre: usuario?.nombre || 'Sistema',
        accion: `Registrar ${tipoAccion}`,
        codigo: codigoAccion,
        observaciones: `${resultadoAccion}`
      });

      alert('Acción registrada correctamente');
      setTipoAccion('Llamado');
      setFechaAccion('');
      setResultadoAccion('');
      setCodigoAccion('');
      setCodigoBusqueda('');
      cargarDatos();
    } else {
      alert('Error al guardar acción: ' + error.message);
    }
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-AR');
  };

  const formatearFechaHora = (fecha: string) => {
    return new Date(fecha).toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading || !caso) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-600">Cargando detalle...</div>
      </div>
    );
  }

  const resultadosLlamado = [
    'Contacto efectivo',
    'Sin respuesta',
    'Número incorrecto',
    'Se solicita documentación',
    'Rechaza gestión'
  ];

  const resultadosCorreo = [
    'Mail 1 enviado',
    'Mail 2 enviado',
    'Rebotado',
    'Pendiente de envío'
  ];

  const resultadosWhatsApp = [
    'Mensaje enviado',
    'Mensaje leído',
    'Sin respuesta',
    'Número incorrecto'
  ];

  const resultadosDisponibles = tipoAccion === 'Llamado' ? resultadosLlamado :
                                 tipoAccion === 'Correo' ? resultadosCorreo :
                                 resultadosWhatsApp;

  const codigosFiltrados = codigosAccion.filter(codigo =>
    codigo.codigo.toLowerCase().includes(codigoBusqueda.toLowerCase()) ||
    codigo.descripcion?.toLowerCase().includes(codigoBusqueda.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button
          onClick={onVolver}
          className="mb-6 inline-flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Volver al listado
        </button>

        <h1 className="text-3xl font-semibold text-gray-900 mb-8">
          Detalle del Caso
        </h1>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-3 border-b">
            Datos FEFARA
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500">Número de Trámite</label>
              <p className="mt-1 text-gray-900">{caso.numero_tramite}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Número de Tratamiento</label>
              <p className="mt-1 text-gray-900">{caso.numero_tratamiento || '-'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Afiliado</label>
              <p className="mt-1 text-gray-900">{caso.afiliado_nombre}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">CUIL</label>
              <p className="mt-1 text-gray-900">{caso.afiliado_cuil}</p>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-500">Diagnóstico / Tipo</label>
              <p className="mt-1 text-gray-900">{caso.diagnostico || '-'}</p>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-500">Tratamiento</label>
              <p className="mt-1 text-gray-900">{caso.tratamiento || '-'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Médico</label>
              <p className="mt-1 text-gray-900">{caso.medico || '-'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Matrícula</label>
              <p className="mt-1 text-gray-900">{caso.medico_matricula || '-'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Estado FEFARA Actual</label>
              <p className="mt-1">
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                  caso.estado_fefara === 'Autorizado' ? 'bg-green-100 text-green-800' :
                  caso.estado_fefara === 'Observado' ? 'bg-yellow-100 text-yellow-800' :
                  caso.estado_fefara === 'Rechazado' ? 'bg-red-100 text-red-800' :
                  caso.estado_fefara === 'Derivado' ? 'bg-purple-100 text-purple-800' :
                  caso.estado_fefara === 'Autorizado parcial' ? 'bg-orange-100 text-orange-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {caso.estado_fefara}
                </span>
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Motivo</label>
              <p className="mt-1 text-gray-900">{caso.motivo || '-'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Fecha Ingreso</label>
              <p className="mt-1 text-gray-900">{formatearFecha(caso.fecha_ingreso)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Fecha Vencimiento Próxima</label>
              <p className="mt-1 text-gray-900">{caso.fecha_vencimiento ? formatearFecha(caso.fecha_vencimiento) : '-'}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-3 border-b">
            Drogas del tratamiento
          </h2>
          {drogas.length === 0 ? (
            <p className="text-gray-500">No hay drogas registradas para este tratamiento</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">N° Tratamiento</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">ID Interno</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tipo Ficha</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Ciclo</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Duración</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tipo Origen</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Primera Droga</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Cant. Drogas</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">CIE</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Diagnóstico</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Indicación Oncológica</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Ingreso</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Vencimiento</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Autorización</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Anulación</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Primera Dispensa</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Última Dispensa</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {drogas.map((droga) => (
                    <tr key={droga.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 text-sm text-gray-900">{droga.numero_tratamiento || '-'}</td>
                      <td className="px-3 py-2 text-sm text-gray-900">{droga.id_interno || '-'}</td>
                      <td className="px-3 py-2 text-sm text-gray-900">{droga.tipo_ficha || '-'}</td>
                      <td className="px-3 py-2 text-sm text-gray-900">{droga.ciclo || '-'}</td>
                      <td className="px-3 py-2 text-sm text-gray-900">{droga.duracion || '-'}</td>
                      <td className="px-3 py-2 text-sm text-gray-900">{droga.tipo_origen || '-'}</td>
                      <td className="px-3 py-2 text-sm text-gray-900">{droga.primera_droga || '-'}</td>
                      <td className="px-3 py-2 text-sm text-gray-900 text-center">{droga.cantidad_drogas}</td>
                      <td className="px-3 py-2 text-sm text-gray-900">{droga.cie || '-'}</td>
                      <td className="px-3 py-2 text-sm text-gray-900">{droga.diagnostico || '-'}</td>
                      <td className="px-3 py-2 text-sm text-gray-900">{droga.indicacion_oncologica || '-'}</td>
                      <td className="px-3 py-2 text-sm text-gray-900">{droga.fecha_ingreso ? formatearFecha(droga.fecha_ingreso) : '-'}</td>
                      <td className="px-3 py-2 text-sm text-gray-900">{droga.fecha_vencimiento ? formatearFecha(droga.fecha_vencimiento) : '-'}</td>
                      <td className="px-3 py-2 text-sm text-gray-900">{droga.fecha_autorizacion ? formatearFecha(droga.fecha_autorizacion) : '-'}</td>
                      <td className="px-3 py-2 text-sm text-gray-900">{droga.fecha_anulacion ? formatearFecha(droga.fecha_anulacion) : '-'}</td>
                      <td className="px-3 py-2 text-sm text-gray-900">{droga.fecha_primera_dispensa ? formatearFecha(droga.fecha_primera_dispensa) : '-'}</td>
                      <td className="px-3 py-2 text-sm text-gray-900">{droga.fecha_ultima_dispensa ? formatearFecha(droga.fecha_ultima_dispensa) : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-3 border-b">
            Línea de Tiempo FEFARA
          </h2>
          {timeline.length === 0 ? (
            <p className="text-gray-500">No hay registros en la línea de tiempo</p>
          ) : (
            <div className="space-y-3">
              {timeline.map((item) => (
                <div key={item.id} className="flex gap-4 py-2">
                  <div className="flex-shrink-0 w-32">
                    <span className="text-sm font-medium text-gray-900">
                      {formatearFechaHora(item.fecha)}
                    </span>
                  </div>
                  <div className="flex-shrink-0">
                    <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800">
                      {item.estado}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-700">{item.descripcion || '-'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4 pb-3 border-b">
            <h2 className="text-xl font-semibold text-gray-900">
              Gestión Interna ANDAR
            </h2>
            {!puedeGestionarCaso && (
              <div className="flex items-center gap-2 text-amber-700 bg-amber-50 px-3 py-1.5 rounded-md">
                <Lock className="h-4 w-4" />
                <span className="text-sm font-medium">Solo disponible para el usuario asignado</span>
              </div>
            )}
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Estado ANDAR</label>
              <select
                value={estadoAndar}
                onChange={(e) => setEstadoAndar(e.target.value)}
                disabled={!puedeGestionarCaso}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500"
              >
                <option value="Pendiente">Pendiente</option>
                <option value="En gestión">En gestión</option>
                <option value="Esperando respuesta">Esperando respuesta</option>
                <option value="Resuelto">Resuelto</option>
                <option value="Cerrado">Cerrado</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Asignado a</label>
              <select
                value={asignadoA}
                onChange={(e) => setAsignadoA(e.target.value)}
                disabled={!puedeGestionarCaso}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500"
              >
                <option value="">Sin asignar</option>
                {usuarios.map((usuario) => (
                  <option key={usuario.id} value={usuario.id}>{usuario.nombre}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                CORRESPONDE ANULAR
              </label>
              <div className="flex gap-6">
                <label className={`inline-flex items-center ${puedeGestionarCaso ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}>
                  <input
                    type="radio"
                    value="Sí"
                    checked={decisionEliminar === 'Sí'}
                    onChange={(e) => setDecisionEliminar(e.target.value)}
                    disabled={!puedeGestionarCaso}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 disabled:cursor-not-allowed"
                  />
                  <span className="ml-2 text-gray-700">Sí</span>
                </label>
                <label className={`inline-flex items-center ${puedeGestionarCaso ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}>
                  <input
                    type="radio"
                    value="No"
                    checked={decisionEliminar === 'No'}
                    onChange={(e) => setDecisionEliminar(e.target.value)}
                    disabled={!puedeGestionarCaso}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 disabled:cursor-not-allowed"
                  />
                  <span className="ml-2 text-gray-700">No</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comentario Interno (opcional)
              </label>
              <textarea
                value={comentarioInterno}
                onChange={(e) => setComentarioInterno(e.target.value)}
                disabled={!puedeGestionarCaso}
                rows={3}
                placeholder="Notas internas sobre el caso..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500"
              />
            </div>

            <button
              onClick={guardarGestionInterna}
              disabled={!puedeGestionarCaso}
              className="mt-2 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:hover:bg-gray-400"
            >
              <Save className="h-4 w-4 mr-2" />
              Guardar Cambios
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4 pb-3 border-b">
            <h2 className="text-xl font-semibold text-gray-900">
              Registrar Acción
            </h2>
            {!puedeGestionarCaso && (
              <div className="flex items-center gap-2 text-amber-700 bg-amber-50 px-3 py-1.5 rounded-md">
                <Lock className="h-4 w-4" />
                <span className="text-sm font-medium">Solo disponible para el usuario asignado</span>
              </div>
            )}
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Acción
                </label>
                <select
                  value={tipoAccion}
                  onChange={(e) => {
                    setTipoAccion(e.target.value as 'Llamado' | 'Correo' | 'WhatsApp');
                    setResultadoAccion('');
                  }}
                  disabled={!puedeGestionarCaso}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500"
                >
                  <option value="Llamado">Llamado</option>
                  <option value="Correo">Correo</option>
                  <option value="WhatsApp">WhatsApp</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha
                </label>
                <input
                  type="date"
                  value={fechaAccion}
                  onChange={(e) => setFechaAccion(e.target.value)}
                  disabled={!puedeGestionarCaso}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Resultado
                </label>
                <select
                  value={resultadoAccion}
                  onChange={(e) => setResultadoAccion(e.target.value)}
                  disabled={!puedeGestionarCaso}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500"
                >
                  <option value="">Seleccionar resultado</option>
                  {resultadosDisponibles.map(resultado => (
                    <option key={resultado} value={resultado}>{resultado}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cod. (Código de acción)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={codigoBusqueda}
                  onChange={(e) => setCodigoBusqueda(e.target.value)}
                  disabled={!puedeGestionarCaso}
                  placeholder="Buscar código..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500"
                />
                {codigoBusqueda && codigosFiltrados.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                    {codigosFiltrados.map((codigo) => (
                      <div
                        key={codigo.id}
                        onClick={() => {
                          setCodigoAccion(codigo.codigo);
                          setCodigoBusqueda(codigo.codigo);
                        }}
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                      >
                        <div className="font-medium text-sm text-gray-900">{codigo.codigo}</div>
                        <div className="text-xs text-gray-500">{codigo.descripcion}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {codigoAccion && (
                <div className="mt-2 text-sm text-gray-600">
                  Código seleccionado: <span className="font-medium">{codigoAccion}</span>
                </div>
              )}
            </div>

            <button
              onClick={guardarAccion}
              disabled={!puedeGestionarCaso}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:hover:bg-gray-400"
            >
              <Save className="h-4 w-4 mr-2" />
              Guardar Acción
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-3 border-b">
            Historial de gestión interna ANDAR
          </h2>
          {historialGestion.length === 0 ? (
            <p className="text-gray-500">No hay registros de gestión interna</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuario</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acción</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Código</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Observaciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {historialGestion.map((registro) => (
                    <tr key={registro.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {formatearFechaHora(registro.fecha)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{registro.usuario_nombre}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{registro.accion}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{registro.codigo || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {registro.estado_anterior && registro.estado_nuevo && (
                          <div>
                            <span className="text-red-600">{registro.estado_anterior}</span>
                            {' → '}
                            <span className="text-green-600">{registro.estado_nuevo}</span>
                          </div>
                        )}
                        {!registro.estado_anterior && !registro.estado_nuevo && '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {registro.observaciones || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-3 border-b">
            Historial de Acciones Internas
          </h2>
          {acciones.length === 0 ? (
            <p className="text-gray-500">No hay acciones registradas</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Tipo
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Fecha
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Resultado
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Usuario
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Número Contacto
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Observación
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {acciones.map((accion) => (
                    <tr key={accion.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          accion.tipo === 'Llamado' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {accion.tipo}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {formatearFecha(accion.fecha)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{accion.resultado}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{accion.usuario}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {accion.numero_contacto}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {accion.observacion ? (
                          accion.observacion.length > 50
                            ? accion.observacion.substring(0, 50) + '...'
                            : accion.observacion
                        ) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
