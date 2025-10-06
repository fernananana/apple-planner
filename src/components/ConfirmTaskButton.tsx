import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';
import { Miembro } from '@/types';

interface ConfirmTaskButtonProps {
  isConfirmed: boolean;
  confirmadaPor?: Miembro;
  currentMiembro: Miembro;
  taskMiembro: Miembro;
  onConfirm: () => void;
}

const ConfirmTaskButton = ({ 
  isConfirmed, 
  confirmadaPor, 
  currentMiembro, 
  taskMiembro,
  onConfirm 
}: ConfirmTaskButtonProps) => {
  // Solo mostrar el botón si la tarea no está confirmada o si fue confirmada por otro miembro
  const canConfirm = !isConfirmed || (confirmadaPor && confirmadaPor !== currentMiembro);
  
  // No mostrar si la tarea es para "ambos" o si es del mismo miembro activo
  if (taskMiembro === 'ambos' || taskMiembro === currentMiembro) {
    return null;
  }

  return (
    <Button
      size="sm"
      variant="ghost"
      className={`h-5 w-5 p-0 ${isConfirmed ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
      onClick={(e) => {
        e.stopPropagation();
        onConfirm();
      }}
      title={isConfirmed ? `Confirmada por ${confirmadaPor}` : 'Confirmar tarea'}
    >
      <CheckCircle2 
        className={`w-3 h-3 ${isConfirmed ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}
      />
    </Button>
  );
};

export default ConfirmTaskButton;
