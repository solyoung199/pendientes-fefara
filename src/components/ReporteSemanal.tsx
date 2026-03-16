import { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';
import * as XLSX from 'xlsx';

type Caso = Database['public']['Tables']['casos']['Row'];
type Accion = Database['public']['Tables']['acciones']['Row'];

export default function ReporteSemanal() {
  const [casos, setCasos] = useState<Caso[]>([]);
  const [acciones, setAcciones] = useState<Accion[]>([]);
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [filtroCanal, setFiltroCanal] = useState<'todos' | 'WhatsApp' | 'Llamado' | 'Correo'>('todos');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const hoy = new Date();
    const hace7Dias = new Date(hoy);
    hace7Dias.setDate(hoy.getDate() - 7);

    setFechaInicio(hace7Dias.toISOString().split('T')[0]);
    setFechaFin(hoy.toISOString().split('T')[0]);

    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);

    const [casosResult, accionesResult] = await Promise.all([
      supabase.from('casos').select('*'),
      supabase.from('acciones').select('*')
    ]);

    if (casosResult.data) setCasos(casosResult.data);
    if (accionesResult.data) setAcciones(accionesResult.data);

    setLoading(false);
  };

  const filtrarPorFecha = () => {
    if (!fechaInicio || !fechaFin) return { casosFiltrados: casos, accionesFiltradas: acciones };

    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    fin.setHours(23, 59, 59);

    const casosFiltrados = casos.filter(caso => {
      const fechaCaso = new Date(caso.created_at);
      return fechaCaso >= inicio && fechaCaso <= fin;
    });

    const accionesFiltradas = acciones.filter(accion => {
      const fechaAccion = new Date(accion.fecha);
      return fechaAccion >= inicio && fechaAccion <= fin;
    });

    return { casosFiltrados, accionesFiltradas };
  };

  const calcularMetricas = () => {
    const { casosFiltrados, accionesFiltradas } = filtrarPorFecha();

    let accionesPorCanal = accionesFiltradas;
    if (filtroCanal !== 'todos') {
      accionesPorCanal = accionesFiltradas.filter(a => a.tipo === filtroCanal);
    }

    const totalObservados = casosFiltrados.filter(c => c.estado_fefara === 'Observado').length;
    const totalRechazados = casosFiltrados.filter(c => c.estado_fefara === 'Rechazado').length;
    const totalDerivados = casosFiltrados.filter(c => c.estado_fefara === 'Derivado').length;
    const totalAutorizadoParcial = casosFiltrados.filter(c => c.estado_fefara === 'Autorizado parcial').length;

    const llamadosRealizados = accionesFiltradas.filter(a => a.tipo === 'Llamado').length;
    const correosEnviados = accionesFiltradas.filter(a => a.tipo === 'Correo').length;
    const whatsappsEnviados = accionesFiltradas.filter(a => a.tipo === 'WhatsApp').length;

    const casosTotales = casos;
    const casosConLlamado = new Set(acciones.filter(a => a.tipo === 'Llamado').map(a => a.caso_id));
    const casosConCorreo = new Set(acciones.filter(a => a.tipo === 'Correo').map(a => a.caso_id));
    const casosConWhatsApp = new Set(acciones.filter(a => a.tipo === 'WhatsApp').map(a => a.caso_id));

    const pendientesLlamado = casosTotales.filter(c =>
      (c.estado_andar === 'Pendiente' || c.estado_andar === 'En gestión') &&
      !casosConLlamado.has(c.id)
    ).length;

    const pendientesCorreo = casosTotales.filter(c =>
      (c.estado_andar === 'Pendiente' || c.estado_andar === 'En gestión') &&
      !casosConCorreo.has(c.id)
    ).length;

    const pendientesWhatsApp = casosTotales.filter(c =>
      (c.estado_andar === 'Pendiente' || c.estado_andar === 'En gestión') &&
      !casosConWhatsApp.has(c.id)
    ).length;

    const totalCerrados = casosFiltrados.filter(c => c.estado_andar === 'Cerrado').length;

    const totalAmparo = casosFiltrados.filter(c => c.tipo_incidente === 'Amparo').length;
    const totalCD = casosFiltrados.filter(c => c.tipo_incidente === 'CD').length;
    const totalMedico = casosFiltrados.filter(c => c.tipo_incidente === 'Medico').length;
    const totalSinTipo = casosFiltrados.filter(c => !c.tipo_incidente).length;

    return {
      totalObservados,
      totalRechazados,
      totalDerivados,
      totalAutorizadoParcial,
      llamadosRealizados,
      pendientesLlamado,
      correosEnviados,
      pendientesCorreo,
      whatsappsEnviados,
      pendientesWhatsApp,
      totalCerrados,
      totalAmparo,
      totalCD,
      totalMedico,
      totalSinTipo,
      accionesPorCanal
    };
  };

  const exportarReporte = () => {
    const { accionesPorCanal } = metricas;

    const datosExcel = accionesPorCanal.map(accion => ({
      'Tipo': accion.tipo,
      'Fecha': new Date(accion.fecha).toLocaleDateString('es-AR'),
      'Resultado': accion.resultado,
      'Usuario': accion.usuario,
      'Número de Contacto': accion.numero_contacto,
      'Observación': accion.observacion || '-'
    }));

    const ws = XLSX.utils.json_to_sheet(datosExcel);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Reporte Acciones');

    const nombreArchivo = filtroCanal === 'todos'
      ? `reporte_acciones_${new Date().toISOString().split('T')[0]}.xlsx`
      : `reporte_${filtroCanal}_${new Date().toISOString().split('T')[0]}.xlsx`;

    XLSX.writeFile(wb, nombreArchivo);
  };

  const metricas = calcularMetricas();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-600">Cargando reporte...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">Reporte por período</h1>
          <p className="text-gray-600">
            Seleccioná un rango de fechas para visualizar métricas de estados FEFARA y acciones internas ANDAR.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Filtros del Reporte</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Inicio</label>
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Fin</label>
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Canal de Acción</label>
              <select
                value={filtroCanal}
                onChange={(e) => setFiltroCanal(e.target.value as 'todos' | 'WhatsApp' | 'Llamado' | 'Correo')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="todos">Todos los canales</option>
                <option value="WhatsApp">WhatsApp</option>
                <option value="Llamado">Llamado</option>
                <option value="Correo">Correo</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end">
            <button
              onClick={exportarReporte}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Exportar Reporte
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-yellow-500">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Total Observados</h3>
            <p className="text-4xl font-bold text-gray-900">{metricas.totalObservados}</p>
            <p className="text-xs text-gray-500 mt-1">Estado FEFARA</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-red-500">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Total Rechazados</h3>
            <p className="text-4xl font-bold text-gray-900">{metricas.totalRechazados}</p>
            <p className="text-xs text-gray-500 mt-1">Estado FEFARA</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-purple-500">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Total Derivados</h3>
            <p className="text-4xl font-bold text-gray-900">{metricas.totalDerivados}</p>
            <p className="text-xs text-gray-500 mt-1">Estado FEFARA</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-orange-500">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Total Autorizado Parcial</h3>
            <p className="text-4xl font-bold text-gray-900">{metricas.totalAutorizadoParcial}</p>
            <p className="text-xs text-gray-500 mt-1">Estado FEFARA</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Llamados Realizados</h3>
            <p className="text-4xl font-bold text-gray-900">{metricas.llamadosRealizados}</p>
            <p className="text-xs text-gray-500 mt-1">Acciones internas</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-gray-400">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Pendientes de Llamado</h3>
            <p className="text-4xl font-bold text-gray-900">{metricas.pendientesLlamado}</p>
            <p className="text-xs text-gray-500 mt-1">Casos sin contacto telefónico</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Correos Enviados</h3>
            <p className="text-4xl font-bold text-gray-900">{metricas.correosEnviados}</p>
            <p className="text-xs text-gray-500 mt-1">Acciones internas</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-gray-400">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Pendientes de Correo</h3>
            <p className="text-4xl font-bold text-gray-900">{metricas.pendientesCorreo}</p>
            <p className="text-xs text-gray-500 mt-1">Casos sin comunicación por email</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-teal-500">
            <h3 className="text-sm font-medium text-gray-600 mb-2">WhatsApp Enviados</h3>
            <p className="text-4xl font-bold text-gray-900">{metricas.whatsappsEnviados}</p>
            <p className="text-xs text-gray-500 mt-1">Acciones internas</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-gray-400">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Pendientes de WhatsApp</h3>
            <p className="text-4xl font-bold text-gray-900">{metricas.pendientesWhatsApp}</p>
            <p className="text-xs text-gray-500 mt-1">Casos sin comunicación por WhatsApp</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-600">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Casos Cerrados</h3>
            <p className="text-4xl font-bold text-gray-900">{metricas.totalCerrados}</p>
            <p className="text-xs text-gray-500 mt-1">Estado ANDAR</p>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Casos por Tipo de Incidente</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-teal-500">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Amparo</h3>
              <p className="text-4xl font-bold text-gray-900">{metricas.totalAmparo}</p>
              <p className="text-xs text-gray-500 mt-1">Tipo de incidente</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-cyan-500">
              <h3 className="text-sm font-medium text-gray-600 mb-2">CD</h3>
              <p className="text-4xl font-bold text-gray-900">{metricas.totalCD}</p>
              <p className="text-xs text-gray-500 mt-1">Tipo de incidente</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-sky-500">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Medico</h3>
              <p className="text-4xl font-bold text-gray-900">{metricas.totalMedico}</p>
              <p className="text-xs text-gray-500 mt-1">Tipo de incidente</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-gray-300">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Sin tipo</h3>
              <p className="text-4xl font-bold text-gray-900">{metricas.totalSinTipo}</p>
              <p className="text-xs text-gray-500 mt-1">Tipo de incidente</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
