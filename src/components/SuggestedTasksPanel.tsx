import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, X } from 'lucide-react';
import { TareaSugerida } from '@/types';
import { useStore } from '@/store/useStore';
import { MemberSelector } from './calendar/MemberSelector';

const SuggestedTasksPanel = () => {
  const { sugeridas, setSugeridas, miembroActivo } = useStore((state) => ({
    sugeridas: state.sugeridas,
    setSugeridas: state.setSugeridas,
    miembroActivo: state.miembroActivo,
  }));
  const [nuevaTarea, setNuevaTarea] = useState('');

  const addSugerida = useCallback(() => {
    if (!nuevaTarea.trim()) return;
    setSugeridas([...sugeridas, nuevaTarea.trim()]);
    setNuevaTarea('');
  }, [nuevaTarea, sugeridas, setSugeridas]);

  const removeSugerida = useCallback((index: number) => {
    const updated = sugeridas.filter((_, i) => i !== index);
    setSugeridas(updated);
  }, [sugeridas, setSugeridas]);

  const handleDragStart = useCallback((e: React.DragEvent, texto: string) => {
    const dragData = {
      type: 'suggested',
      texto: texto
    };
    console.log('Starting drag from suggested tasks:', dragData); // Debug log
    e.dataTransfer.setData('text/plain', JSON.stringify(dragData));
    e.dataTransfer.effectAllowed = 'copy';
  }, []);

  return (
    <Card className="shadow-apple h-fit">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          Tareas Sugeridas
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Arrastra las tareas al calendario
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <MemberSelector />
        
        {/* Formulario para añadir nuevas sugeridas */}
        <div className="flex gap-2">
          <Input
            placeholder="Nueva tarea sugerida..."
            value={nuevaTarea}
            onChange={(e) => setNuevaTarea(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addSugerida()}
            className="text-sm"
          />
          <Button
            size="sm"
            onClick={addSugerida}
            disabled={!nuevaTarea.trim()}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Lista de tareas */}
        <div className="space-y-1 max-h-96 overflow-y-auto">
          {sugeridas.map((tarea, index) => (
            <div
              key={index}
              className={`
                group flex items-center justify-between p-2 rounded-lg 
                border cursor-grab active:cursor-grabbing text-xs
                hover-lift transition-all duration-200
                ${miembroActivo === 'mama' ? 'task-mama' : 'task-papa'}
              `}
              draggable
              onDragStart={(e) => handleDragStart(e, tarea)}
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="text-xs">
                  {miembroActivo === 'mama' ? '👩' : '👨'}
                </span>
                <span className="truncate">
                  {tarea}
                </span>
              </div>
              
              <Button
                size="sm"
                variant="ghost"
                className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => removeSugerida(index)}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>

        {/* Indicador del miembro activo */}
        <div className="mt-4 p-3 rounded-lg bg-muted">
          <p className="text-xs text-muted-foreground text-center">
            Las tareas se asignarán a:{' '}
            <span className={`font-medium ${miembroActivo === 'mama' ? 'text-[hsl(var(--mama-primary))]' : 'text-[hsl(var(--papa-primary))]'}`}>
              {miembroActivo === 'mama' ? '👩 Mamá' : miembroActivo === 'papa' ? '👨 Papá' : miembroActivo === 'viggo' ? '👶 Viggo' : '👨‍👩 Ambos'}
            </span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SuggestedTasksPanel;