import { useEffect, useState } from 'react';
import { User } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Database } from '../lib/database.types';

type Usuario = Database['public']['Tables']['usuarios']['Row'];

export default function SelectorUsuario() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const { usuario, setUsuarioActual } = useAuth();

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    const { data } = await supabase
      .from('usuarios')
      .select('*')
      .order('nombre');

    if (data) {
      setUsuarios(data);
      if (!usuario && data.length > 0) {
        setUsuarioActual(data[0].id);
      }
    }
  };

  return (
    <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
      <User className="w-5 h-5 text-gray-600" />
      <select
        value={usuario?.id || ''}
        onChange={(e) => setUsuarioActual(e.target.value)}
        className="px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
      >
        {usuarios.map(u => (
          <option key={u.id} value={u.id}>
            {u.nombre} ({u.rol})
          </option>
        ))}
      </select>
    </div>
  );
}
