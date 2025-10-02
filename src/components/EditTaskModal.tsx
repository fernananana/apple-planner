import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tarea, Miembro, TipoRecurrencia } from '@/types';

interface EditTaskModalProps {
  tarea: Tarea;
  isOpen: boolean;
  onClose: () => void;
  onSave: (tarea: Tarea) => void;
}

const EditTaskModal = ({ tarea, isOpen, onClose, onSave }: EditTaskModalProps) => {
  const [texto, setTexto] = useState(tarea.texto);
  const [miembro, setMiembro] = useState<Miembro>(tarea.miembro);
  const [notas, setNotas] = useState(tarea.notas);
  const [recurrencia, setRecurrencia] = useState<TipoRecurrencia>(tarea.recurrencia || 'puntual');
  const [categoria, setCategoria] = useState(tarea.categoria || '');

  const handleSave = () => {
    const updatedTarea: Tarea = {
      ...tarea,
      texto,
      miembro,
      notas,
      recurrencia,
      categoria
    };
    onSave(updatedTarea);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-card">
        <DialogHeader>
          <DialogTitle>Editar Tarea</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="texto">Descripción de la tarea</Label>
            <Input
              id="texto"
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder="Describe la tarea..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="miembro">Asignado a</Label>
            <Select value={miembro} onValueChange={(value: Miembro) => setMiembro(value)}>
              <SelectTrigger className="bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border border-border">
                <SelectItem value="mama">👩 Mamá</SelectItem>
                <SelectItem value="papa">👨 Papá</SelectItem>
                <SelectItem value="ambos">👨‍👩 Ambos</SelectItem>
                <SelectItem value="viggo">👶 Viggo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="recurrencia">Tipo de tarea</Label>
            <Select value={recurrencia} onValueChange={(value: TipoRecurrencia) => setRecurrencia(value)}>
              <SelectTrigger className="bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border border-border">
                <SelectItem value="puntual">📅 Puntual</SelectItem>
                <SelectItem value="diaria">🔄 Diaria</SelectItem>
                <SelectItem value="semanal">📊 Semanal</SelectItem>
                <SelectItem value="mensual">📆 Mensual</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoria">Categoría</Label>
            <Input
              id="categoria"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              placeholder="Ej: Casa, Trabajo, Personal..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notas">Notas adicionales</Label>
            <Textarea
              id="notas"
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Añade detalles, instrucciones..."
              rows={3}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            Guardar Cambios
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditTaskModal;