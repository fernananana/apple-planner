import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, X } from 'lucide-react';
import { Miembro, Categorias } from '@/types';

interface SuggestedTasksPanelProps {
  sugeridas: Categorias;
  onSugeridasChange: (sugeridas: Categorias) => void;
  miembroActivo: Miembro;
}

const SuggestedTasksPanel = ({ 
  sugeridas, 
  onSugeridasChange, 
  miembroActivo 
}: SuggestedTasksPanelProps) => {
  const [nuevaTarea, setNuevaTarea] = useState('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string>('');

  const addSugerida = useCallback(() => {
    if (!nuevaTarea.trim() || !categoriaSeleccionada) return;

    const updated = { ...sugeridas };
    if (!updated[categoriaSeleccionada]) {
      updated[categoriaSeleccionada] = [];
    }
    updated[categoriaSeleccionada].push(nuevaTarea.trim());
    onSugeridasChange(updated);
    setNuevaTarea('');
  }, [nuevaTarea, categoriaSeleccionada, sugeridas, onSugeridasChange]);

  const removeSugerida = useCallback((categoria: string, index: number) => {
    const updated = { ...sugeridas };
    updated[categoria].splice(index, 1);
    if (updated[categoria].length === 0) {
      delete updated[categoria];
    }
    onSugeridasChange(updated);
  }, [sugeridas, onSugeridasChange]);

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
        {/* Formulario para añadir nuevas sugeridas */}
        <div className="space-y-2">
          <select
            value={categoriaSeleccionada}
            onChange={(e) => setCategoriaSeleccionada(e.target.value)}
            className="w-full p-2 border rounded-lg text-sm"
          >
            <option value="">Seleccionar categoría</option>
            {Object.keys(sugeridas).map((categoria) => (
              <option key={categoria} value={categoria}>
                {categoria}
              </option>
            ))}
          </select>
          
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
              disabled={!nuevaTarea.trim() || !categoriaSeleccionada}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Lista de categorías y tareas */}
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {Object.entries(sugeridas).map(([categoria, tareas]) => (
            <div key={categoria} className="space-y-2">
              <h4 className="font-medium text-sm text-foreground">
                {categoria}
              </h4>
              
              <div className="space-y-1">
                {tareas.map((tarea, index) => (
                  <div
                    key={`${categoria}-${index}`}
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
                      onClick={() => removeSugerida(categoria, index)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Indicador del miembro activo */}
        <div className="mt-4 p-3 rounded-lg bg-muted">
          <p className="text-xs text-muted-foreground text-center">
            Las tareas se asignarán a:{' '}
            <span className={`font-medium ${miembroActivo === 'mama' ? 'text-[hsl(var(--mama-primary))]' : 'text-[hsl(var(--papa-primary))]'}`}>
              {miembroActivo === 'mama' ? '👩 Mamá' : '👨 Papá'}
            </span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SuggestedTasksPanel;