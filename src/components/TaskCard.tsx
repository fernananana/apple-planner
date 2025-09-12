import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { X, FileText } from 'lucide-react';
import { Tarea } from '@/types';

interface TaskCardProps {
  tarea: Tarea;
  onUpdate: (updates: Partial<Tarea>) => void;
  onDelete: () => void;
  onEdit: () => void;
  isDraggable?: boolean;
}

const TaskCard = ({ 
  tarea, 
  onUpdate, 
  onDelete, 
  onEdit,
  isDraggable = true 
}: TaskCardProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = useCallback((e: React.DragEvent) => {
    if (!isDraggable) return;
    
    setIsDragging(true);
    e.dataTransfer.setData('text/plain', JSON.stringify({
      type: 'task',
      tarea: tarea
    }));
    e.dataTransfer.effectAllowed = 'move';
  }, [tarea, isDraggable]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  const toggleCompletada = useCallback(() => {
    onUpdate({ completada: !tarea.completada });
  }, [tarea.completada, onUpdate]);

  const getMemberStyle = () => {
    if (tarea.completada) return 'task-completed';
    return tarea.miembro === 'mama' ? 'task-mama' : 'task-papa';
  };

  return (
    <div
      className={`
        relative group p-2 rounded-lg border text-xs cursor-pointer
        transition-all duration-200 hover-lift
        ${getMemberStyle()}
        ${isDragging ? 'dragging' : ''}
      `}
      draggable={isDraggable}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={onEdit}
    >
      <div className="flex items-start gap-2">
        <Checkbox
          checked={tarea.completada}
          onCheckedChange={toggleCompletada}
          className="mt-0.5"
          onClick={(e) => e.stopPropagation()}
        />
        
        <div className="flex-1 min-w-0">
          <p className={`font-medium leading-tight ${tarea.completada ? 'line-through' : ''}`}>
            {tarea.texto}
          </p>
          <div className="flex items-center gap-1 mt-1">
            <span className="text-xs opacity-75">
              {tarea.miembro === 'mama' ? '👩' : '👨'}
            </span>
            {tarea.notas && (
              <FileText className="w-3 h-3 opacity-75" />
            )}
          </div>
        </div>

        <Button
          size="sm"
          variant="ghost"
          className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 hover:bg-destructive hover:text-destructive-foreground"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <X className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
};

export default TaskCard;