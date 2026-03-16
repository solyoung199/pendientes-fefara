import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type Usuario = Database['public']['Tables']['usuarios']['Row'];

interface AuthContextType {
  usuario: Usuario | null;
  loading: boolean;
  setUsuarioActual: (usuarioId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarUsuarioActual();
  }, []);

  const cargarUsuarioActual = async () => {
    const usuarioIdGuardado = localStorage.getItem('usuario_actual_id');

    if (usuarioIdGuardado) {
      const { data } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', usuarioIdGuardado)
        .maybeSingle();

      if (data) {
        setUsuario(data);
      }
    }

    setLoading(false);
  };

  const setUsuarioActual = async (usuarioId: string) => {
    const { data } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', usuarioId)
      .maybeSingle();

    if (data) {
      setUsuario(data);
      localStorage.setItem('usuario_actual_id', usuarioId);
    }
  };

  return (
    <AuthContext.Provider value={{ usuario, loading, setUsuarioActual }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
}
