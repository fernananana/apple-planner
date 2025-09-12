import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tarea } from '@/types';

interface NotesModalProps {
  tarea: Tarea;
  onSave: (tarea: Tarea) => void;
  onClose: () => void;
}

const NotesModal = ({ tarea, onSave, onClose }: NotesModalProps) => {
  const [texto, setTexto] = useState(tarea.texto);
  const [notas, setNotas] = useState(tarea.notas);

  const handleSave = useCallback(() => {
    onSave({
      ...tarea,
      texto: texto.trim(),
      notas: notas.trim()
    });
  }, [tarea, texto, notas, onSave]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSave();
    }
    if (e.key === 'Escape') {
      onClose();
    }
  }, [handleSave, onClose]);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {tarea.miembro === 'mama' ? '👩' : '👨'} Editar Tarea
          </DialogTitle>
          <DialogDescription>
            Modifica el título y las notas de la tarea
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4" onKeyDown={handleKeyDown}>
          <div className="space-y-2">
            <Label htmlFor="texto">Título de la tarea</Label>
            <Input
              id="texto"
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder="Nombre de la tarea..."
              className="w-full"
              autoFocus
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notas">Notas adicionales</Label>
            <Textarea
              id="notas"
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Añade notas, detalles o comentarios..."
              className="w-full min-h-[100px] resize-none"
            />
          </div>

          {/* Info sobre el miembro asignado */}
          <div className="p-3 rounded-lg bg-muted">
            <p className="text-sm text-muted-foreground">
              Asignada a:{' '}
              <span className={`font-medium ${tarea.miembro === 'mama' ? 'text-[hsl(var(--mama-primary))]' : 'text-[hsl(var(--papa-primary))]'}`}>
                {tarea.miembro === 'mama' ? '👩 Mamá' : '👨 Papá'}
              </span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Estado: {tarea.completada ? '✅ Completada' : '⏳ Pendiente'}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSave}
            disabled={!texto.trim()}
            className="gap-2"
          >
            💾 Guardar
          </Button>
        </DialogFooter>
        
        <div className="text-center text-xs text-muted-foreground">
          <p>💡 Tip: Cmd+Enter para guardar, Escape para cancelar</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NotesModal;