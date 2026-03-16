import { useState, useEffect } from 'react';
import { Search, FileText, Download, Lock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Database } from '../lib/database.types';
import * as XLSX from 'xlsx';

type Caso = Database['public']['Tables']['casos']['Row'];
type Usuario = Database['public']['Tables']['usuarios']['Row'];
type Accion = Database['public']['Tables']['acciones']['Row'];

interface MisCasosProps {
  onSelectCaso: (casoId: string, puedeGestionar: boolean) => void;
  filtroInicial?: 'mis_casos' | 'todos';
}

export default function MisCasos({ onSelectCaso, filtroInicial = 'todos' }: MisCasosProps) {
  const { usuario } = useAuth();
  const [casos, setCasos] = useState<Caso[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [acciones, setAcciones] = useState<Accion[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroAsignacion, setFiltroAsignacion] = useState<'mis_casos' | 'todos'>(filtroInicial);
  const [filtroAsignadoA, setFiltroAsignadoA] = useState('');
  const [filtroEstadoAndar, setFiltroEstadoAndar] = useState('');
  const [filtroEstadoFefara, setFiltroEstadoFefara] = useState('');
  const [filtroTipoIncidente, setFiltroTipoIncidente] = useState('');
  const [busquedaGlobal, setBusquedaGlobal] = useState('');

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
    const user = usuarios.find(u => u.id === usuarioId);
    return user?.nombre || '-';
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

  const puedeGestionar = (caso: Caso): boolean => {
    return usuario?.id === caso.asignado_a;
  };

  const estadosAndar = Array.from(new Set(casos.map(c => c.estado_andar))).sort();
  const estadosFefara = Array.from(new Set(casos.map(c => c.estado_fefara))).sort();

  let casosFiltrados = casos;

  if (filtroAsignacion === 'mis_casos' && usuario) {
    casosFiltrados = casosFiltrados.filter(c => c.asignado_a === usuario.id);
  }

  if (filtroAsignadoA) {
    if (filtroAsignadoA === 'sin_asignar') {
      casosFiltrados = casosFiltrados.filter(c => !c.asignado_a);
    } else if (filtroAsignadoA === 'todos') {
      // No filtrar
    } else {
      casosFiltrados = casosFiltrados.filter(c => c.asignado_a === filtroAsignadoA);
    }
  }

  if (filtroEstadoAndar) {
    casosFiltrados = casosFiltrados.filter(c => c.estado_andar === filtroEstadoAndar);
  }

  if (filtroEstadoFefara) {
    casosFiltrados = casosFiltrados.filter(c => c.estado_fefara === filtroEstadoFefara);
  }

  if (filtroTipoIncidente) {
    if (filtroTipoIncidente === 'sin_tipo') {
      casosFiltrados = casosFiltrados.filter(c => !c.tipo_incidente);
    } else {
      casosFiltrados = casosFiltrados.filter(c => c.tipo_incidente === filtroTipoIncidente);
    }
  }

  if (busquedaGlobal) {
    const busquedaLower = busquedaGlobal.toLowerCase();
    casosFiltrados = casosFiltrados.filter(caso =>
      caso.numero_tramite.toLowerCase().includes(busquedaLower) ||
      caso.numero_tratamiento?.toLowerCase().includes(busquedaLower) ||
      caso.afiliado_nombre.toLowerCase().includes(busquedaLower) ||
      caso.afiliado_cuil.toLowerCase().includes(busquedaLower) ||
      caso.afiliado_con_cud?.toLowerCase().includes(busquedaLower) ||
      caso.tipo_beneficio?.toLowerCase().includes(busquedaLower) ||
      caso.tratamiento?.toLowerCase().includes(busquedaLower) ||
      caso.diagnostico?.toLowerCase().includes(busquedaLower)
    );
  }

  const exportarExcel = () => {
    const datosExcel = casosFiltrados.map(caso => {
      const ultimaAccion = obtenerUltimaAccionDetalle(caso.id);
      const esMiCaso = puedeGestionar(caso);
      return {
        'Trámite #': caso.numero_tramite,
        'Tratamiento #': caso.numero_tratamiento || '-',
        'Afiliado': caso.afiliado_nombre,
        'CUIL': caso.afiliado_cuil,
        'Tipo Incidente': caso.tipo_incidente || '-',
        'Estado FEFARA': caso.estado_fefara,
        'Estado ANDAR': caso.estado_andar,
        'Asignado a': obtenerNombreUsuario(caso.asignado_a),
        'Puedo gestionar': esMiCaso ? 'Sí' : 'No',
        'Última acción': `${ultimaAccion.tipo} - ${ultimaAccion.resultado}`,
        'Fecha última acción': ultimaAccion.fecha,
        'Fecha ingreso': new Date(caso.fecha_ingreso).toLocaleDateString('es-AR'),
        'Fecha vencimiento': new Date(caso.fecha_vencimiento).toLocaleDateString('es-AR')
      };
    });

    const ws = XLSX.utils.json_to_sheet(datosExcel);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Mis Casos');
    XLSX.writeFile(wb, `mis_casos_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

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
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">Gestión de casos</h1>
          <p className="text-gray-600">
            Visualiza todos los casos del sistema. Solo puedes gestionar y realizar acciones en los casos asignados a ti.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buscador global
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por N° trámite, N° tratamiento, afiliado, afiliado con CUD, tipo de beneficio..."
                value={busquedaGlobal}
                onChange={(e) => setBusquedaGlobal(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vista
              </label>
              <select
                value={filtroAsignacion}
                onChange={(e) => setFiltroAsignacion(e.target.value as 'mis_casos' | 'todos')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="todos">Todos los casos</option>
                <option value="mis_casos">Mis casos</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Asignado a
              </label>
              <select
                value={filtroAsignadoA}
                onChange={(e) => setFiltroAsignadoA(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="todos">Todos</option>
                <option value="sin_asignar">Sin asignar</option>
                {usuarios.map(user => (
                  <option key={user.id} value={user.id}>{user.nombre}</option>
                ))}
              </select>
            </div>

            <div>
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

            <div>
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

            <div>
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
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={exportarExcel}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Exportar a Excel
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm mb-4 p-4">
          <div className="text-sm text-gray-600">
            Mostrando <span className="font-semibold text-gray-900">{casosFiltrados.length}</span> casos
            {filtroAsignacion === 'mis_casos' && usuario && (
              <span className="ml-2 text-blue-600 font-medium">
                (asignados a {usuario.nombre})
              </span>
            )}
            {filtroAsignacion === 'todos' && (
              <span className="ml-2 text-gray-500">
                del sistema
              </span>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trámite
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Afiliado
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Afiliado con CUD
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo de beneficio
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado FEFARA
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado ANDAR
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Asignado a
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Última acción
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {casosFiltrados.map((caso) => {
                  const esMiCaso = puedeGestionar(caso);
                  return (
                    <tr key={caso.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {caso.numero_tramite}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        <div>{caso.afiliado_nombre}</div>
                        <div className="text-xs text-gray-500">{caso.afiliado_cuil}</div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">
                        {caso.afiliado_con_cud || '-'}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">
                        {caso.tipo_beneficio || '-'}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                        {caso.tipo_incidente || '-'}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          caso.estado_fefara === 'Autorizado' ? 'bg-green-100 text-green-800' :
                          caso.estado_fefara === 'Rechazado' ? 'bg-red-100 text-red-800' :
                          caso.estado_fefara === 'Observado' ? 'bg-yellow-100 text-yellow-800' :
                          caso.estado_fefara === 'Derivado' ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {caso.estado_fefara}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          caso.estado_andar === 'Cerrado' ? 'bg-green-100 text-green-800' :
                          caso.estado_andar === 'Resuelto' ? 'bg-blue-100 text-blue-800' :
                          caso.estado_andar === 'En gestión' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {caso.estado_andar}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-2">
                          {obtenerNombreUsuario(caso.asignado_a)}
                          {esMiCaso && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                              Yo
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">
                        {obtenerUltimaAccion(caso.id)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => onSelectCaso(caso.id, esMiCaso)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                          <FileText className="w-4 h-4" />
                          Ver detalle
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {casosFiltrados.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No se encontraron casos con los filtros seleccionados
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
