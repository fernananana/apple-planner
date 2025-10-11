import { useState, useEffect, useCallback } from 'react';
import { Tarea, TareasPorDia } from '@/types';
import { 
  getTareasPorDia, 
  saveTarea, 
  deleteTarea, 
  getTareasByMes,
  deleteAllTareas 
} from '@/lib/database';
import { useToast } from './use-toast';

export const useTareas = (mes?: number, año?: number) => {
  const [tareas, setTareas] = useState<TareasPorDia>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Cargar tareas
  const cargarTareas = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      let tareasCargadas: TareasPorDia;
      
      if (mes !== undefined && año !== undefined) {
        const tareasArray = await getTareasByMes(mes, año);
        tareasCargadas = {};
        
        tareasArray.forEach(tarea => {
          if (tarea.fecha) {
            const fecha = new Date(tarea.fecha);
            const dia = fecha.getDate();
            
            if (!tareasCargadas[dia]) {
              tareasCargadas[dia] = [];
            }
            tareasCargadas[dia].push(tarea);
          }
        });
      } else {
        tareasCargadas = await getTareasPorDia();
      }
      
      setTareas(tareasCargadas);
    } catch (err) {
      const errorMsg = 'Error al cargar las tareas';
      setError(errorMsg);
      toast({
        title: 'Error',
        description: errorMsg,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [mes, año, toast]);

  // Guardar tarea
  const guardarTarea = useCallback(async (tarea: Tarea) => {
    try {
      await saveTarea(tarea);
      await cargarTareas();
      
      toast({
        title: 'Tarea guardada',
        description: 'La tarea se ha guardado correctamente'
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'No se pudo guardar la tarea',
        variant: 'destructive'
      });
    }
  }, [cargarTareas, toast]);

  // Eliminar tarea
  const eliminarTarea = useCallback(async (id: string) => {
    try {
      await deleteTarea(id);
      await cargarTareas();
      
      toast({
        title: 'Tarea eliminada',
        description: 'La tarea se ha eliminado correctamente'
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'No se pudo eliminar la tarea',
        variant: 'destructive'
      });
    }
  }, [cargarTareas, toast]);

  // Actualizar tareas
  const actualizarTareas = useCallback(async (nuevasTareas: TareasPorDia) => {
    try {
      // Primero eliminar todas las tareas del mes actual
      await deleteAllTareas();
      
      // Luego guardar las nuevas
      for (const [dia, tareasDelDia] of Object.entries(nuevasTareas)) {
        for (const tarea of tareasDelDia) {
          await saveTarea(tarea);
        }
      }
      
      await cargarTareas();
    } catch (err) {
      toast({
        title: 'Error',
        description: 'No se pudieron actualizar las tareas',
        variant: 'destructive'
      });
    }
  }, [cargarTareas, toast]);

  // Cargar tareas al montar el componente
  useEffect(() => {
    cargarTareas();
  }, [cargarTareas]);

  return {
    tareas,
    loading,
    error,
    guardarTarea,
    eliminarTarea,
    actualizarTareas,
    recargar: cargarTareas
  };
};
