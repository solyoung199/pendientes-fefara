import { useState } from 'react';
import { FileText, BarChart3, ClipboardList, CircleUser as UserCircle } from 'lucide-react';
import ListadoCasos from './components/ListadoCasos';
import MisCasos from './components/MisCasos';
import DetalleCaso from './components/DetalleCaso';
import ReporteSemanal from './components/ReporteSemanal';
import SelectorUsuario from './components/SelectorUsuario';
import { AuthProvider } from './contexts/AuthContext';

type Vista = 'listado' | 'mis_casos' | 'detalle' | 'detalle_mis_casos' | 'reporte';

function AppContent() {
  const [vistaActual, setVistaActual] = useState<Vista>('mis_casos');
  const [casoSeleccionado, setCasoSeleccionado] = useState<string | null>(null);
  const [puedeGestionarCaso, setPuedeGestionarCaso] = useState<boolean>(true);

  const handleSelectCasoListado = (casoId: string) => {
    setCasoSeleccionado(casoId);
    setPuedeGestionarCaso(true);
    setVistaActual('detalle');
  };

  const handleSelectCasoMisCasos = (casoId: string, puedeGestionar: boolean) => {
    setCasoSeleccionado(casoId);
    setPuedeGestionarCaso(puedeGestionar);
    setVistaActual('detalle_mis_casos');
  };

  const handleVolverListado = () => {
    setCasoSeleccionado(null);
    setVistaActual('listado');
  };

  const handleVolverMisCasos = () => {
    setCasoSeleccionado(null);
    setVistaActual('mis_casos');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-6">
              <div>
                <h1 className="text-xl font-semibold text-gray-900">SGIT</h1>
                <span className="text-xs text-gray-500">Sistema de Gestión Integral de Tratamientos</span>
              </div>
              <SelectorUsuario />
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setVistaActual('mis_casos')}
                className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  vistaActual === 'mis_casos' || vistaActual === 'detalle_mis_casos'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <UserCircle className="h-5 w-5 mr-2" />
                Mis casos
              </button>
              <button
                onClick={() => setVistaActual('listado')}
                className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  vistaActual === 'listado' || vistaActual === 'detalle'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <ClipboardList className="h-5 w-5 mr-2" />
                Todos los casos
              </button>
              <button
                onClick={() => setVistaActual('reporte')}
                className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  vistaActual === 'reporte'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <BarChart3 className="h-5 w-5 mr-2" />
                Reporte Semanal
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main>
        {vistaActual === 'mis_casos' && (
          <MisCasos onSelectCaso={handleSelectCasoMisCasos} />
        )}
        {vistaActual === 'listado' && (
          <ListadoCasos onSelectCaso={handleSelectCasoListado} />
        )}
        {vistaActual === 'detalle' && casoSeleccionado && (
          <DetalleCaso casoId={casoSeleccionado} onVolver={handleVolverListado} />
        )}
        {vistaActual === 'detalle_mis_casos' && casoSeleccionado && (
          <DetalleCaso casoId={casoSeleccionado} onVolver={handleVolverMisCasos} puedeGestionar={puedeGestionarCaso} />
        )}
        {vistaActual === 'reporte' && (
          <ReporteSemanal />
        )}
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
