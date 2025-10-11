import { useState, useEffect, useCallback } from 'react';
import { Categorias } from '@/types';
import { getSugeridas, updateSugeridas, saveSugerida, deleteSugerida } from '@/lib/database';
import { SUGERIDAS_INICIALES } from '@/lib/storage';
import { useToast } from './use-toast';

export const useSugeridas = () => {
  const [sugeridas, setSugeridas] = useState<Categorias>({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Cargar sugeridas
  const cargarSugeridas = useCallback(async () => {
    try {
      setLoading(true);
      const sugeridasCargadas = await getSugeridas();
      
      // Si no hay sugeridas, inicializar con las predeterminadas
      if (Object.keys(sugeridasCargadas).length === 0) {
        await updateSugeridas(SUGERIDAS_INICIALES);
        setSugeridas(SUGERIDAS_INICIALES);
      } else {
        setSugeridas(sugeridasCargadas);
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Error al cargar tareas sugeridas',
        variant: 'destructive'
      });
      setSugeridas(SUGERIDAS_INICIALES);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Actualizar sugeridas
  const actualizarSugeridas = useCallback(async (nuevasSugeridas: Categorias) => {
    try {
      await updateSugeridas(nuevasSugeridas);
      setSugeridas(nuevasSugeridas);
      
      toast({
        title: 'Actualizado',
        description: 'Tareas sugeridas actualizadas'
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'No se pudieron actualizar las tareas sugeridas',
        variant: 'destructive'
      });
    }
  }, [toast]);

  // Agregar sugerida
  const agregarSugerida = useCallback(async (categoria: string, texto: string) => {
    try {
      await saveSugerida(categoria, texto);
      await cargarSugeridas();
      
      toast({
        title: 'Agregada',
        description: 'Tarea sugerida agregada correctamente'
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'No se pudo agregar la tarea sugerida',
        variant: 'destructive'
      });
    }
  }, [cargarSugeridas, toast]);

  // Eliminar sugerida
  const eliminarSugerida = useCallback(async (categoria: string, texto: string) => {
    try {
      await deleteSugerida(categoria, texto);
      await cargarSugeridas();
      
      toast({
        title: 'Eliminada',
        description: 'Tarea sugerida eliminada'
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'No se pudo eliminar la tarea sugerida',
        variant: 'destructive'
      });
    }
  }, [cargarSugeridas, toast]);

  // Cargar al montar
  useEffect(() => {
    cargarSugeridas();
  }, [cargarSugeridas]);

  return {
    sugeridas,
    loading,
    actualizarSugeridas,
    agregarSugerida,
    eliminarSugerida,
    recargar: cargarSugeridas
  };
};
