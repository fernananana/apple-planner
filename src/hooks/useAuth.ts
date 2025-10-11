import { useState, useEffect, useCallback } from 'react';
import { getAuth, saveAuth } from '@/lib/database';
import { useToast } from './use-toast';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Cargar estado de autenticación
  const cargarAuth = useCallback(async () => {
    try {
      setLoading(true);
      const auth = await getAuth();
      setIsAuthenticated(auth);
    } catch (err) {
      console.error('Error al cargar autenticación:', err);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, []);

  // Login
  const login = useCallback(async (username: string, password: string) => {
    // Simulación de autenticación (reemplazar con lógica real)
    return new Promise<boolean>((resolve) => {
      setTimeout(async () => {
        if (username === 'familia' && password === 'familia123') {
          await saveAuth(true);
          setIsAuthenticated(true);
          
          toast({
            title: 'Bienvenido',
            description: 'Has iniciado sesión correctamente'
          });
          resolve(true);
        } else {
          toast({
            title: 'Error',
            description: 'Usuario o contraseña incorrectos',
            variant: 'destructive'
          });
          resolve(false);
        }
      }, 1000);
    });
  }, [toast]);

  // Logout
  const logout = useCallback(async () => {
    await saveAuth(false);
    setIsAuthenticated(false);
    
    toast({
      title: 'Sesión cerrada',
      description: 'Has cerrado sesión correctamente'
    });
  }, [toast]);

  // Cargar al montar
  useEffect(() => {
    cargarAuth();
  }, [cargarAuth]);

  return {
    isAuthenticated,
    loading,
    login,
    logout
  };
};
