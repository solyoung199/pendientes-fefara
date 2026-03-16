import { useState, useEffect } from 'react';
import { Search, FileText, Download } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';
import * as XLSX from 'xlsx';

type Caso = Database['public']['Tables']['casos']['Row'];
type Usuario = Database['public']['Tables']['usuarios']['Row'];
type Accion = Database['public']['Tables']['acciones']['Row'];

interface ListadoCasosProps {
  onSelectCaso: (casoId: string) => void;
}

export default function ListadoCasos({ onSelectCaso }: ListadoCasosProps) {
  const [casos, setCasos] = useState<Caso[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [acciones, setAcciones] = useState<Accion[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstadoFefara, setFiltroEstadoFefara] = useState('');
  const [filtroEstadoAndar, setFiltroEstadoAndar] = useState('');
  const [filtroTipoIncidente, setFiltroTipoIncidente] = useState('');
  const [filtroAsignadoA, setFiltroAsignadoA] = useState('');
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);

    try {
      const [casosResult, usuariosResult, accionesResult] = await Promise.all([
        supabase.from('casos').select('*').order('fecha_ingreso', { ascending: false }),
        supabase.from('usuarios').select('*').eq('activo', true),
        supabase.from('acciones').select('*').order('fecha', { ascending: false })
      ]);

      if (casosResult.error) {
        console.error('Error cargando casos:', casosResult.error);
      }
      if (usuariosResult.error) {
        console.error('Error cargando usuarios:', usuariosResult.error);
      }
      if (accionesResult.error) {
        console.error('Error cargando acciones:', accionesResult.error);
      }

      if (casosResult.data) setCasos(casosResult.data);
      if (usuariosResult.data) setUsuarios(usuariosResult.data);
      if (accionesResult.data) setAcciones(accionesResult.data);
    } catch (error) {
      console.error('Error en cargarDatos:', error);
    } finally {
      setLoading(false);
    }
  };

  const obtenerNombreUsuario = (usuarioId: string | null) => {
    if (!usuarioId) return '-';
    const usuario = usuarios.find(u => u.id === usuarioId);
    return usuario?.nombre || '-';
  };

  const obtenerUltimaAccion = (casoId: string) => {
    const accionesCaso = acciones.filter(a => a.caso_id === casoId);
    if (accionesCaso.length === 0) return 'Sin acciones';

    const ultima = accionesCaso[0];
    const fecha = new Date(ultima.fecha).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' });
    return `${ultima.tipo} - ${fecha}`;
  };

  const obtenerUltimaAccionDetalle = (casoId: string) => {
    const accionesCaso = acciones.filter(a => a.caso_id === casoId);
    if (accionesCaso.length === 0) return { tipo: '-', resultado: '-', fecha: '-' };

    const ultima = accionesCaso[0];
    return {
      tipo: ultima.tipo,
      resultado: ultima.resultado,
      fecha: new Date(ultima.fecha).toLocaleDateString('es-AR')
    };
  };

  const exportarExcel = () => {
    const datosExcel = casosFiltrados.map(caso => {
      const ultimaAccion = obtenerUltimaAccionDetalle(caso.id);
      return {
        'Trámite #': caso.numero_tramite,
        'Tratamiento #': caso.numero_tratamiento || '-',
        'Afiliado': caso.afiliado_nombre,
        'CUIL': caso.afiliado_cuil,
        'Tipo Incidente': caso.tipo_incidente || '-',
        'Estado FEFARA': caso.estado_fefara,
        'Motivo FEFARA': caso.motivo || '-',
        'Estado ANDAR': caso.estado_andar,
        'Asignado a': obtenerNombreUsuario(caso.asignado_a),
        'Última acción interna': `${ultimaAccion.tipo} - ${ultimaAccion.resultado}`,
        'Fecha última acción': ultimaAccion.fecha,
        'Fecha ingreso': formatearFecha(caso.fecha_ingreso),
        'Fecha vencimiento próxima': caso.fecha_vencimiento ? formatearFecha(caso.fecha_vencimiento) : '-'
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(datosExcel);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Casos');

    const fechaHoy = new Date().toISOString().split('T')[0];
    XLSX.writeFile(workbook, `SGIT_Casos_${fechaHoy}.xlsx`);
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-AR');
  };

  const casosFiltrados = casos.filter(caso => {
    const matchEstadoFefara = !filtroEstadoFefara || caso.estado_fefara === filtroEstadoFefara;
    const matchEstadoAndar = !filtroEstadoAndar || caso.estado_andar === filtroEstadoAndar;
    const matchTipoIncidente = !filtroTipoIncidente ||
      (filtroTipoIncidente === 'sin_tipo' ? !caso.tipo_incidente : caso.tipo_incidente === filtroTipoIncidente);
    const matchAsignadoA = !filtroAsignadoA ||
      (filtroAsignadoA === 'sin_asignar' ? !caso.asignado_a : caso.asignado_a === filtroAsignadoA);
    const matchBusqueda = !busqueda ||
      caso.afiliado_nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      caso.afiliado_cuil.includes(busqueda);

    return matchEstadoFefara && matchEstadoAndar && matchTipoIncidente && matchAsignadoA && matchBusqueda;
  });

  const estadosFefara = Array.from(new Set(casos.map(c => c.estado_fefara))).sort();
  const estadosAndar = Array.from(new Set(casos.map(c => c.estado_andar))).sort();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-600">Cargando casos...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">Listado de Casos</h1>
          <p className="text-gray-600">Sistema de Gestión Integral de Tratamientos</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-end justify-between gap-8">
            <div className="flex items-end gap-4 flex-1 flex-wrap">
              <div className="min-w-[180px]">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Asignado a
                </label>
                <select
                  value={filtroAsignadoA}
                  onChange={(e) => setFiltroAsignadoA(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todos</option>
                  <option value="sin_asignar">Sin asignar</option>
                  {usuarios.map(user => (
                    <option key={user.id} value={user.id}>{user.nombre}</option>
                  ))}
                </select>
              </div>

              <div className="min-w-[180px]">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado FEFARA
                </label>
                <select
                  value={filtroEstadoFefara}
                  onChange={(e) => setFiltroEstadoFefara(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todos</option>
                  {estadosFefara.map(estado => (
                    <option key={estado} value={estado}>{estado}</option>
                  ))}
                </select>
              </div>

              <div className="min-w-[180px]">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado ANDAR
                </label>
                <select
                  value={filtroEstadoAndar}
                  onChange={(e) => setFiltroEstadoAndar(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todos</option>
                  {estadosAndar.map(estado => (
                    <option key={estado} value={estado}>{estado}</option>
                  ))}
                </select>
              </div>

              <div className="min-w-[160px]">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo Incidente
                </label>
                <select
                  value={filtroTipoIncidente}
                  onChange={(e) => setFiltroTipoIncidente(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todos</option>
                  <option value="Amparo">Amparo</option>
                  <option value="CD">CD</option>
                  <option value="Medico">Medico</option>
                  <option value="sin_tipo">Sin tipo</option>
                </select>
              </div>

              <div className="min-w-[250px]">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Búsqueda
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    placeholder="CUIL o nombre"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>

            <div className="flex items-end border-l-2 border-gray-200 pl-8">
              <button
                onClick={exportarExcel}
                className="inline-flex items-center px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 shadow-md font-semibold whitespace-nowrap transition-colors"
              >
                <Download className="h-5 w-5 mr-2" />
                Exportar Excel
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Número de Trámite
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tratamiento #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Afiliado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo Incidente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado FEFARA
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado ANDAR
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha Ingreso
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Asignado a
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Última Acción
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {casosFiltrados.map((caso) => (
                  <tr key={caso.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {caso.numero_tramite}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {caso.numero_tratamiento || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{caso.afiliado_nombre}</div>
                      <div className="text-sm text-gray-500">{caso.afiliado_cuil}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {caso.tipo_incidente || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        caso.estado_fefara === 'Autorizado' ? 'bg-green-100 text-green-800' :
                        caso.estado_fefara === 'Observado' ? 'bg-yellow-100 text-yellow-800' :
                        caso.estado_fefara === 'Rechazado' ? 'bg-red-100 text-red-800' :
                        caso.estado_fefara === 'Derivado' ? 'bg-purple-100 text-purple-800' :
                        caso.estado_fefara === 'Autorizado parcial' ? 'bg-orange-100 text-orange-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {caso.estado_fefara}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        caso.estado_andar === 'Resuelto' || caso.estado_andar === 'Cerrado' ? 'bg-green-100 text-green-800' :
                        caso.estado_andar === 'En gestión' ? 'bg-blue-100 text-blue-800' :
                        caso.estado_andar === 'Esperando respuesta' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {caso.estado_andar}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatearFecha(caso.fecha_ingreso)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {obtenerNombreUsuario(caso.asignado_a)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {obtenerUltimaAccion(caso.id)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button
                        onClick={() => onSelectCaso(caso.id)}
                        className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center"
                      >
                        <FileText className="h-4 w-4 mr-1" />
                        Ver
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {casosFiltrados.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No se encontraron casos con los filtros aplicados
            </div>
          )}
        </div>

        <div className="mt-4 text-sm text-gray-600">
          Mostrando {casosFiltrados.length} de {casos.length} casos
        </div>
      </div>
    </div>
  );
}
