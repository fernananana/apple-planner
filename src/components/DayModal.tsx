import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Trash2 } from 'lucide-react';
import { Miembro, Tarea } from '@/types';
import { generarId } from '@/lib/calendar-utils';
import TaskCard from './TaskCard';
import ConfirmTaskButton from './ConfirmTaskButton';
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

interface DayModalProps {
  day: number;
  month: number;
  year: number;
  tareas: Tarea[];
  miembroActivo: Miembro;
  isOpen: boolean;
  onClose: () => void;
  onTareasChange: (tareas: Tarea[]) => void;
  onEditTarea: (tarea: Tarea) => void;
  onBorrarDia: () => void;
}

const DayModal = ({
  day,
  month,
  year,
  tareas,
  miembroActivo,
  isOpen,
  onClose,
  onTareasChange,
  onEditTarea,
  onBorrarDia
}: DayModalProps) => {
  const addTarea = useCallback(() => {
    const nuevaTarea: Tarea = {
      id: generarId(),
      texto: `Nueva tarea`,
      miembro: miembroActivo,
      notas: '',
      completada: false,
      fechaCreacion: new Date().toISOString()
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

  const archiveTarea = useCallback((tareaId: string) => {
    const updatedTareas = tareas.map(tarea =>
      tarea.id === tareaId ? { ...tarea, archivada: true } : tarea
    );
    onTareasChange(updatedTareas);
  }, [tareas, onTareasChange]);

  const confirmTarea = useCallback((tareaId: string) => {
    const updatedTareas = tareas.map(tarea =>
      tarea.id === tareaId ? { 
        ...tarea, 
        confirmada: !tarea.confirmada,
        confirmadaPor: !tarea.confirmada ? miembroActivo : undefined
      } : tarea
    );
    onTareasChange(updatedTareas);
  }, [tareas, miembroActivo, onTareasChange]);

  const handleBorrarDia = () => {
    onBorrarDia();
    onClose();
  };

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="text-xl font-semibold">
              {day} de {monthNames[month]} {year}
            </span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="gap-2"
                onClick={addTarea}
              >
                <Plus className="w-4 h-4" />
                Agregar tarea
              </Button>
              
              {tareas.length > 0 && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-2 text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                      Borrar día
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
                      <AlertDialogAction onClick={handleBorrarDia} className="bg-destructive">
                        Borrar día
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="mt-6 overflow-y-auto max-h-[60vh] space-y-3">
          {tareas.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <p>No hay tareas para este día</p>
              <p className="text-sm mt-2">Haz clic en "Agregar tarea" para empezar</p>
            </div>
          ) : (
            tareas.map((tarea) => (
              <div key={tarea.id} className="p-3 border rounded-lg bg-card flex items-start gap-2">
                <div className="flex-1">
                  <TaskCard
                    tarea={tarea}
                    onUpdate={(updates) => updateTarea(tarea.id, updates)}
                    onDelete={() => deleteTarea(tarea.id)}
                    onArchive={() => archiveTarea(tarea.id)}
                    onEdit={() => onEditTarea(tarea)}
                    sourceDay={day}
                    isDraggable={false}
                  />
                </div>
                <ConfirmTaskButton
                  isConfirmed={!!tarea.confirmada}
                  confirmadaPor={tarea.confirmadaPor}
                  currentMiembro={miembroActivo}
                  taskMiembro={tarea.miembro}
                  onConfirm={() => confirmTarea(tarea.id)}
                />
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DayModal;