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
  onDayClick: () => void;
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
  onDayClick,
  isToday
}: DayCellProps) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const addTarea = useCallback((e: React.MouseEvent) => {
    e.stopPropagation(); // Evitar que se dispare onDayClick
    const fechaStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const nuevaTarea: Tarea = {
      id: generarId(),
      texto: `Nueva tarea`,
      miembro: miembroActivo,
      notas: '',
      completada: false,
      fechaCreacion: new Date().toISOString(),
      fecha: fechaStr
    };
    onTareasChange([...tareas, nuevaTarea]);
  }, [tareas, miembroActivo, onTareasChange, year, month, day]);

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
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Solo quitar el estado de drag over si realmente salimos del contenedor principal
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setIsDragOver(false);
    }
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    
    const data = e.dataTransfer.getData('text/plain');
    console.log('Drop data received:', data); // Debug log
    
    if (!data) {
      console.warn('No drag data received');
      return;
    }
    
    try {
      const dropData = JSON.parse(data);
      console.log('Parsed drop data:', dropData); // Debug log
      
      if (dropData.type === 'suggested') {
        // Crear nueva tarea desde sugerida
        const fechaStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const nuevaTarea: Tarea = {
          id: generarId(),
          texto: dropData.texto,
          miembro: miembroActivo,
          notas: '',
          completada: false,
          fechaCreacion: new Date().toISOString(),
          fecha: fechaStr
        };
        console.log('Creating new task from suggested:', nuevaTarea); // Debug log
        onTareasChange([...tareas, nuevaTarea]);
      } else if (dropData.type === 'task') {
        // Mover tarea existente
        const tareaExistente = dropData.tarea as Tarea;
        const tareaYaExiste = tareas.some(t => t.id === tareaExistente.id);
        
        console.log('Moving task:', {
          taskId: tareaExistente.id,
          sourceDay: dropData.sourceDay,
          targetDay: day,
          taskExists: tareaYaExiste
        }); // Debug log
        
        if (!tareaYaExiste && dropData.sourceDay !== day) {
          // Actualizar la fecha de la tarea
          const fechaStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const tareaActualizada = { ...tareaExistente, fecha: fechaStr };
          
          // Añadir la tarea a este día con la nueva fecha
          onTareasChange([...tareas, tareaActualizada]);
          // Llamar la función para remover del día origen
          if (onMoverTarea && dropData.sourceDay !== undefined) {
            onMoverTarea(tareaExistente.id, dropData.sourceDay);
          }
        }
      }
    } catch (error) {
      console.error('Error al procesar drop:', error);
    }
  }, [tareas, miembroActivo, onTareasChange, onMoverTarea, day]);

  return (
    <div 
      className={`
        relative min-h-[100px] sm:h-32 border rounded-lg p-2 bg-card transition-all duration-200
        ${isToday ? 'ring-2 ring-primary/50 bg-primary/5' : ''}
        ${isDragOver ? 'ring-2 ring-primary border-primary bg-primary/20' : ''}
        flex flex-col
      `}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Número del día y controles */}
      <div className="flex items-center justify-between mb-2 flex-shrink-0">
        <button 
          className={`text-sm sm:text-base font-medium hover:underline cursor-pointer ${isToday ? 'text-primary font-bold' : 'text-foreground'}`}
          onClick={onDayClick}
        >
          {day}
        </button>
        
        <div className="flex gap-1 items-center">
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 sm:h-6 sm:w-6 p-0 hover:bg-primary/10 flex-shrink-0"
            onClick={addTarea}
            aria-label="Añadir tarea"
          >
            <Plus className="w-4 h-4 sm:w-3 sm:h-3" />
          </Button>
          
          {tareas.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 sm:h-6 sm:w-6 p-0 hover:bg-destructive/10 text-destructive flex-shrink-0"
                  aria-label="Borrar todas las tareas"
                >
                  <Trash2 className="w-4 h-4 sm:w-3 sm:h-3" />
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
      <div className="space-y-1 overflow-y-auto flex-1">
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
        <div className="absolute inset-0 border-2 border-dashed border-primary bg-primary/10 rounded-lg flex items-center justify-center pointer-events-none">
          <span className="text-primary font-medium text-sm sm:text-base">Soltar aquí</span>
        </div>
      )}
    </div>
  );
};

export default DayCell;