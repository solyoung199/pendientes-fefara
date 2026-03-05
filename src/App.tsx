import { useState } from 'react';
import { FileText, BarChart3, ClipboardList } from 'lucide-react';
import ListadoCasos from './components/ListadoCasos';
import DetalleCaso from './components/DetalleCaso';
import ReporteSemanal from './components/ReporteSemanal';

type Vista = 'listado' | 'detalle' | 'reporte';

function App() {
  const [vistaActual, setVistaActual] = useState<Vista>('listado');
  const [casoSeleccionado, setCasoSeleccionado] = useState<string | null>(null);

  const handleSelectCaso = (casoId: string) => {
    setCasoSeleccionado(casoId);
    setVistaActual('detalle');
  };

  const handleVolver = () => {
    setCasoSeleccionado(null);
    setVistaActual('listado');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">SGIT</h1>
              <span className="ml-3 text-sm text-gray-500">Sistema de Gestión Integral de Tratamientos</span>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => setVistaActual('listado')}
                className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  vistaActual === 'listado' || vistaActual === 'detalle'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <ClipboardList className="h-5 w-5 mr-2" />
                Casos
              </button>
              <button
                onClick={() => setVistaActual('reporte')}
                className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  vistaActual === 'reporte'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-50'
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
        {vistaActual === 'listado' && (
          <ListadoCasos onSelectCaso={handleSelectCaso} />
        )}
        {vistaActual === 'detalle' && casoSeleccionado && (
          <DetalleCaso casoId={casoSeleccionado} onVolver={handleVolver} />
        )}
        {vistaActual === 'reporte' && (
          <ReporteSemanal />
        )}
      </main>
    </div>
  );
}

export default App;
