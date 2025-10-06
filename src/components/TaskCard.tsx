import { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { X, FileText, Edit2, Check, Archive } from 'lucide-react';
import { Tarea } from '@/types';
import { z } from 'zod';

const taskTextSchema = z.string()
  .trim()
  .min(1, { message: "El texto no puede estar vacío" })
  .max(200, { message: "El texto no puede exceder 200 caracteres" });

interface TaskCardProps {
  tarea: Tarea;
  onUpdate: (updates: Partial<Tarea>) => void;
  onDelete: () => void;
  onArchive?: () => void;
  onEdit: () => void;
  isDraggable?: boolean;
  sourceDay?: number;
}

const TaskCard = ({ 
  tarea, 
  onUpdate, 
  onDelete,
  onArchive,
  onEdit,
  isDraggable = true,
  sourceDay
}: TaskCardProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(tarea.texto);
  const [error, setError] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleDragStart = useCallback((e: React.DragEvent) => {
    if (!isDraggable) return;
    
    setIsDragging(true);
    const dragData = {
      type: 'task',
      tarea: tarea,
      sourceDay: sourceDay // El día específico de donde viene
    };
    console.log('Starting drag from task:', dragData); // Debug log
    e.dataTransfer.setData('text/plain', JSON.stringify(dragData));
    e.dataTransfer.effectAllowed = 'move';
  }, [tarea, isDraggable, sourceDay]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  const toggleCompletada = useCallback(() => {
    onUpdate({ completada: !tarea.completada });
  }, [tarea.completada, onUpdate]);

  const startEditing = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
    setEditText(tarea.texto);
    setError('');
  }, [tarea.texto]);

  const saveEdit = useCallback(() => {
    try {
      const validated = taskTextSchema.parse(editText);
      onUpdate({ texto: validated });
      setIsEditing(false);
      setError('');
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
      }
    }
  }, [editText, onUpdate]);

  const cancelEdit = useCallback(() => {
    setIsEditing(false);
    setEditText(tarea.texto);
    setError('');
  }, [tarea.texto]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveEdit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancelEdit();
    }
  }, [saveEdit, cancelEdit]);

  const getMemberStyle = () => {
    if (tarea.completada) return 'task-completed';
    switch (tarea.miembro) {
      case 'mama': return 'task-mama';
      case 'papa': return 'task-papa';
      case 'viggo': return 'bg-yellow-50 border-yellow-300 text-yellow-900 dark:bg-yellow-950 dark:border-yellow-700 dark:text-yellow-100';
      default: return 'bg-purple-50 border-purple-300 text-purple-900 dark:bg-purple-950 dark:border-purple-700 dark:text-purple-100';
    }
  };

  const getMemberIcon = () => {
    switch (tarea.miembro) {
      case 'mama': return '👩';
      case 'papa': return '👨';
      case 'viggo': return '👶';
      case 'ambos': return '👨‍👩';
    }
  };

  const handleTextClick = useCallback((e: React.MouseEvent) => {
    if (!isEditing) {
      e.stopPropagation();
      startEditing(e);
    }
  }, [isEditing, startEditing]);

  return (
    <div
      className={`
        relative group p-2 rounded-lg border text-xs
        transition-all duration-200
        ${getMemberStyle()}
        ${isDragging ? 'dragging' : ''}
        ${tarea.confirmada ? 'ring-2 ring-green-500 ring-opacity-50' : ''}
      `}
      draggable={isDraggable && !isEditing}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex items-start gap-2">
        <Checkbox
          checked={tarea.completada}
          onCheckedChange={toggleCompletada}
          className="mt-0.5"
          onClick={(e) => e.stopPropagation()}
        />
        
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="space-y-1">
              <Input
                ref={inputRef}
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={saveEdit}
                className="h-7 text-xs"
                maxLength={200}
                onClick={(e) => e.stopPropagation()}
              />
              {error && (
                <p className="text-xs text-destructive">{error}</p>
              )}
            </div>
          ) : (
            <>
              <p 
                className={`font-medium leading-tight cursor-text ${tarea.completada ? 'line-through' : ''}`}
                onClick={handleTextClick}
              >
                {tarea.texto}
              </p>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-xs opacity-75">
                  {getMemberIcon()}
                </span>
                {tarea.notas && (
                  <FileText className="w-3 h-3 opacity-75" />
                )}
                {tarea.categoria && (
                  <span className="text-xs opacity-60 ml-1">• {tarea.categoria}</span>
                )}
                {tarea.confirmada && (
                  <span className="text-xs text-green-600 dark:text-green-400 ml-1" title={`Confirmada por ${tarea.confirmadaPor}`}>
                    ✓ Confirmada
                  </span>
                )}
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-1">
          {!isEditing && (
            <Button
              size="sm"
              variant="ghost"
              className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100"
              onClick={startEditing}
              title="Editar texto"
            >
              <Edit2 className="w-3 h-3" />
            </Button>
          )}
          
          {isEditing ? (
            <Button
              size="sm"
              variant="ghost"
              className="h-5 w-5 p-0"
              onClick={(e) => {
                e.stopPropagation();
                saveEdit();
              }}
              title="Guardar"
            >
              <Check className="w-3 h-3 text-green-600" />
            </Button>
          ) : (
            <>
              {onArchive && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 hover:bg-orange-500 hover:text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    onArchive();
                  }}
                  title="Archivar (mantiene estadísticas)"
                >
                  <Archive className="w-3 h-3" />
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 hover:bg-destructive hover:text-destructive-foreground"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                title="Eliminar permanentemente"
              >
                <X className="w-3 h-3" />
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;