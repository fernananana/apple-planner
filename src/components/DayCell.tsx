import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { Miembro, Tarea } from '@/types';
import { generarId } from '@/lib/calendar-utils';
import TaskCard from './TaskCard';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface DayCellProps {
  day: number;
  month: number;
  year: number;
  tareas: Tarea[];
  miembroActivo: Miembro;
  onTareasChange: (tareas: Tarea[]) => void;
  onEditTarea: (tarea: Tarea) => void;
  onBorrarDia: () => void;
  onMoverTarea?: (tareaId: string, diaOrigen: number) => void;
  isToday: boolean;
}

const DayCell = ({
  day,
  month,
  year,
  tareas,
  miembroActivo,
  onTareasChange,
  onEditTarea,
  onBorrarDia,
  onMoverTarea,
  isToday
}: DayCellProps) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const addTarea = useCallback(() => {
    const nuevaTarea: Tarea = {
      id: generarId(),
      texto: `Nueva tarea`,
      miembro: miembroActivo,
      notas: '',
      completada: false
    };
    onTareasChange([...tareas, nuevaTarea]);
  }, [tareas, miembroActivo, onTareasChange]);

  const updateTarea = useCallback((tareaId: string, updates: Partial<Tarea>) => {
    const updatedTareas = tareas.map(tarea =>
      tarea.id === tareaId ? { ...tarea, ...updates } : tarea
    );
    onTareasChange(updatedTareas);
  }, [tareas, onTareasChange]);

  const deleteTarea = useCallback((tareaId: string) => {
    const updatedTareas = tareas.filter(tarea => tarea.id !== tareaId);
    onTareasChange(updatedTareas);
  }, [tareas, onTareasChange]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const data = e.dataTransfer.getData('text/plain');
    try {
      const dropData = JSON.parse(data);
      
      if (dropData.type === 'suggested') {
        // Crear nueva tarea desde sugerida
        const nuevaTarea: Tarea = {
          id: generarId(),
          texto: dropData.texto,
          miembro: miembroActivo,
          notas: '',
          completada: false
        };
        onTareasChange([...tareas, nuevaTarea]);
      } else if (dropData.type === 'task') {
        // Mover tarea existente
        const tareaExistente = dropData.tarea as Tarea;
        const tareaYaExiste = tareas.some(t => t.id === tareaExistente.id);
        
        if (!tareaYaExiste && dropData.sourceDay !== day) {
          // Añadir la tarea a este día
          onTareasChange([...tareas, tareaExistente]);
          // Llamar la función para remover del día origen
          if (onMoverTarea && dropData.sourceDay !== undefined) {
            onMoverTarea(tareaExistente.id, dropData.sourceDay);
          }
        }
      }
    } catch (error) {
      console.error('Error al procesar drop:', error);
    }
  }, [tareas, miembroActivo, onTareasChange]);

  return (
    <div 
      className={`
        h-32 border rounded-lg p-2 bg-card transition-all duration-200
        ${isToday ? 'ring-2 ring-primary/50 bg-primary/5' : ''}
        ${isDragOver ? 'drag-over' : ''}
        ${tareas.length === 0 ? 'min-h-[128px]' : ''}
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Número del día y controles */}
      <div className="flex items-center justify-between mb-1">
        <span className={`text-sm font-medium ${isToday ? 'text-primary font-bold' : 'text-foreground'}`}>
          {day}
        </span>
        
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0 hover:bg-primary/10"
            onClick={addTarea}
          >
            <Plus className="w-3 h-3" />
          </Button>
          
          {tareas.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0 hover:bg-destructive/10 text-destructive"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Borrar todas las tareas del día {day}?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción eliminará todas las tareas de este día. No se puede deshacer.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={onBorrarDia} className="bg-destructive">
                    Borrar día
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      {/* Lista de tareas */}
      <div className="space-y-1 overflow-y-auto max-h-20">
        {tareas.map((tarea) => (
          <TaskCard
            key={tarea.id}
            tarea={tarea}
            onUpdate={(updates) => updateTarea(tarea.id, updates)}
            onDelete={() => deleteTarea(tarea.id)}
            onEdit={() => onEditTarea(tarea)}
            sourceDay={day}
          />
        ))}
      </div>

      {/* Indicador de zona de drop */}
      {isDragOver && (
        <div className="absolute inset-0 border-2 border-dashed border-primary bg-primary/10 rounded-lg flex items-center justify-center">
          <span className="text-primary font-medium">Soltar aquí</span>
        </div>
      )}
    </div>
  );
};

export default DayCell;