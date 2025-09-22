import { Button } from '@/components/ui/button';
import { useStore } from '@/store/useStore';

export const MemberSelector = () => {
  const { miembroActivo, setMiembroActivo } = useStore((state) => ({
    miembroActivo: state.miembroActivo,
    setMiembroActivo: state.setMiembroActivo,
  }));

  const miembros = [
    { id: 'mama' as const, label: 'Mamá', className: 'btn-mama' },
    { id: 'papa' as const, label: 'Papá', className: 'btn-papa' },
    { id: 'viggo' as const, label: 'Viggo', className: 'bg-green-500 hover:bg-green-600 text-white' },
    { id: 'ambos' as const, label: 'Ambos', className: 'btn-ambos' },
  ];

  return (
    <div className="mb-4">
      <h3 className="text-sm font-medium mb-2">Miembro Activo:</h3>
      <div className="grid grid-cols-2 gap-2">
        {miembros.map((miembro) => (
          <Button
            key={miembro.id}
            variant={miembroActivo === miembro.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setMiembroActivo(miembro.id)}
            className={miembroActivo === miembro.id ? miembro.className : ''}
          >
            {miembro.label}
          </Button>
        ))}
      </div>
    </div>
  );
};