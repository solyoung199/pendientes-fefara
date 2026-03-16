import { useState } from 'react';
import { BarChart3, ClipboardList } from 'lucide-react';
import MisCasos from './components/MisCasos';
import DetalleCaso from './components/DetalleCaso';
import ReporteSemanal from './components/ReporteSemanal';
import SelectorUsuario from './components/SelectorUsuario';
import { AuthProvider } from './contexts/AuthContext';

type Vista = 'casos' | 'detalle' | 'reporte';

function AppContent() {
  const [vistaActual, setVistaActual] = useState<Vista>('casos');
  const [casoSeleccionado, setCasoSeleccionado] = useState<string | null>(null);
  const [puedeGestionarCaso, setPuedeGestionarCaso] = useState<boolean>(true);

  const handleSelectCaso = (casoId: string, puedeGestionar: boolean) => {
    setCasoSeleccionado(casoId);
    setPuedeGestionarCaso(puedeGestionar);
    setVistaActual('detalle');
  };

  const handleVolver = () => {
    setCasoSeleccionado(null);
    setVistaActual('casos');
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
                onClick={() => setVistaActual('casos')}
                className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  vistaActual === 'casos' || vistaActual === 'detalle'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <ClipboardList className="h-5 w-5 mr-2" />
                Casos
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
        {vistaActual === 'casos' && (
          <MisCasos onSelectCaso={handleSelectCaso} />
        )}
        {vistaActual === 'detalle' && casoSeleccionado && (
          <DetalleCaso casoId={casoSeleccionado} onVolver={handleVolver} puedeGestionar={puedeGestionarCaso} />
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
