import { useState, useEffect } from 'react';
import { loadAuth, saveAuth } from '@/lib/storage';
import Login from '@/components/Login';
import Calendar from '@/components/Calendar';

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Cargar estado de autenticación al iniciar
    const authState = loadAuth();
    setIsAuthenticated(authState);
  }, []);

  const handleLoginSuccess = () => {
    saveAuth(true);
    setIsAuthenticated(true);
  };

  // Mostrar loading mientras verifica autenticación
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">👨‍👩‍👧‍👦</div>
          <p className="text-muted-foreground">Cargando calendario familiar...</p>
        </div>
      </div>
    );
  }

  // Mostrar login si no está autenticado
  if (!isAuthenticated) {
    return <Login onSuccess={handleLoginSuccess} />;
  }

  // Mostrar aplicación principal si está autenticado
  return <Calendar />;
};

export default Index;
