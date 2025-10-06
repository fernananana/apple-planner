import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { 
  Plus, 
  Repeat, 
  Calendar as CalendarIcon,
  Clock,
  Edit2,
  Trash2
} from 'lucide-react';
import { Tarea, Miembro, TipoRecurrencia, TareasPorDia } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface TasksSectionProps {
  tareas: TareasPorDia;
  onTareasChange: (tareas: TareasPorDia) => void;
  miembroActivo: Miembro;
}

const TasksSection = ({ tareas, onTareasChange, miembroActivo }: TasksSectionProps) => {
  const [nuevaTarea, setNuevaTarea] = useState({
    texto: '',
    miembro: miembroActivo,
    notas: '',
    recurrencia: 'puntual' as TipoRecurrencia,
    categoria: ''
  });
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const { toast } = useToast();

  const todasLasTareas: Tarea[] = Object.values(tareas).flat();
  const tareasRecurrentes = todasLasTareas.filter(t => t.recurrencia && t.recurrencia !== 'puntual');
  const tareasPuntuales = todasLasTareas.filter(t => !t.recurrencia || t.recurrencia === 'puntual');

  const crearTarea = () => {
    if (!nuevaTarea.texto.trim()) {
      toast({
        title: "Error",
        description: "El texto de la tarea es obligatorio",
        variant: "destructive"
      });
      return;
    }

    const tarea: Tarea = {
      id: Date.now().toString(),
      texto: nuevaTarea.texto,
      miembro: nuevaTarea.miembro as Miembro,
      notas: nuevaTarea.notas,
      completada: false,
      fechaCreacion: new Date().toISOString(),
      recurrencia: nuevaTarea.recurrencia,
      categoria: nuevaTarea.categoria || undefined
    };

    // Agregar la tarea al día seleccionado
    const diaSeleccionado = selectedDate.getDate();
    const tareasDia = tareas[diaSeleccionado] || [];
    const nuevasTareas = { ...tareas, [diaSeleccionado]: [...tareasDia, tarea] };
    
    onTareasChange(nuevasTareas);
    
    setNuevaTarea({
      texto: '',
      miembro: miembroActivo,
      notas: '',
      recurrencia: 'puntual',
      categoria: ''
    });
    setMostrarFormulario(false);
    setSelectedDate(new Date());

    toast({
      title: "Tarea creada",
      description: `Tarea asignada a ${tarea.miembro} para el ${format(selectedDate, 'dd/MM/yyyy')}`
    });
  };

  const eliminarTarea = (tareaId: string) => {
    const nuevasTareas = { ...tareas };
    Object.keys(nuevasTareas).forEach(dia => {
      nuevasTareas[parseInt(dia)] = nuevasTareas[parseInt(dia)].filter(t => t.id !== tareaId);
      if (nuevasTareas[parseInt(dia)].length === 0) {
        delete nuevasTareas[parseInt(dia)];
      }
    });
    onTareasChange(nuevasTareas);
    
    toast({
      title: "Tarea eliminada",
      description: "La tarea ha sido eliminada correctamente"
    });
  };

  const getMiembroIcon = (miembro: Miembro) => {
    switch (miembro) {
      case 'mama': return '👩';
      case 'papa': return '👨';
      case 'ambos': return '👨‍👩';
    }
  };

  const getMiembroColor = (miembro: Miembro) => {
    switch (miembro) {
      case 'mama': return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200';
      case 'papa': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'ambos': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
    }
  };

  const getRecurrenciaIcon = (recurrencia?: TipoRecurrencia) => {
    if (!recurrencia || recurrencia === 'puntual') return <CalendarIcon className="w-4 h-4" />;
    return <Repeat className="w-4 h-4" />;
  };

  const getRecurrenciaText = (recurrencia?: TipoRecurrencia) => {
    switch (recurrencia) {
      case 'diaria': return 'Diaria';
      case 'semanal': return 'Semanal';
      case 'mensual': return 'Mensual';
      default: return 'Puntual';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Gestión de Tareas</h1>
        <Button onClick={() => setMostrarFormulario(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Nueva Tarea
        </Button>
      </div>

      {/* Formulario de Nueva Tarea */}
      {mostrarFormulario && (
        <Card>
          <CardHeader>
            <CardTitle>Crear Nueva Tarea</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="texto">Descripción de la tarea *</Label>
                <Input
                  id="texto"
                  value={nuevaTarea.texto}
                  onChange={(e) => setNuevaTarea(prev => ({ ...prev, texto: e.target.value }))}
                  placeholder="Ej: Lavar los platos"
                />
              </div>
              
              <div>
                <Label htmlFor="miembro">Asignado a</Label>
                <Select value={nuevaTarea.miembro} onValueChange={(value) => 
                  setNuevaTarea(prev => ({ ...prev, miembro: value as Miembro }))
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mama">👩 Mamá</SelectItem>
                    <SelectItem value="papa">👨 Papá</SelectItem>
                    <SelectItem value="ambos">👨‍👩 Ambos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="recurrencia">Frecuencia</Label>
                <Select value={nuevaTarea.recurrencia} onValueChange={(value) => 
                  setNuevaTarea(prev => ({ ...prev, recurrencia: value as TipoRecurrencia }))
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="puntual">Puntual</SelectItem>
                    <SelectItem value="diaria">Diaria</SelectItem>
                    <SelectItem value="semanal">Semanal</SelectItem>
                    <SelectItem value="mensual">Mensual</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="categoria">Categoría</Label>
                <Input
                  id="categoria"
                  value={nuevaTarea.categoria}
                  onChange={(e) => setNuevaTarea(prev => ({ ...prev, categoria: e.target.value }))}
                  placeholder="Ej: Cocina, Limpieza, etc."
                />
              </div>

              <div>
                <Label>Fecha de la tarea</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !selectedDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "dd/MM/yyyy") : <span>Seleccionar fecha</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => date && setSelectedDate(date)}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div>
              <Label htmlFor="notas">Notas adicionales</Label>
              <Textarea
                id="notas"
                value={nuevaTarea.notas}
                onChange={(e) => setNuevaTarea(prev => ({ ...prev, notas: e.target.value }))}
                placeholder="Notas opcionales sobre la tarea..."
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={crearTarea}>
                Crear Tarea
              </Button>
              <Button variant="outline" onClick={() => setMostrarFormulario(false)}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tareas Recurrentes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Repeat className="w-5 h-5" />
            Tareas Recurrentes ({tareasRecurrentes.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {tareasRecurrentes.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No hay tareas recurrentes configuradas
            </p>
          ) : (
            <div className="space-y-3">
              {tareasRecurrentes.map((tarea) => (
                <div key={tarea.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium">{tarea.texto}</h3>
                      <Badge variant="outline" className="flex items-center gap-1">
                        {getRecurrenciaIcon(tarea.recurrencia)}
                        {getRecurrenciaText(tarea.recurrencia)}
                      </Badge>
                    </div>
                    {tarea.notas && (
                      <p className="text-sm text-muted-foreground mb-2">{tarea.notas}</p>
                    )}
                    <Badge className={getMiembroColor(tarea.miembro)}>
                      {getMiembroIcon(tarea.miembro)} {tarea.miembro}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => eliminarTarea(tarea.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tareas Puntuales */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Tareas Puntuales ({tareasPuntuales.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {tareasPuntuales.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No hay tareas puntuales
            </p>
          ) : (
            <div className="space-y-3">
              {tareasPuntuales.map((tarea) => (
                <div key={tarea.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium">{tarea.texto}</h3>
                      {tarea.completada && (
                        <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          Completada
                        </Badge>
                      )}
                    </div>
                    {tarea.notas && (
                      <p className="text-sm text-muted-foreground mb-2">{tarea.notas}</p>
                    )}
                    <div className="flex items-center gap-2">
                      <Badge className={getMiembroColor(tarea.miembro)}>
                        {getMiembroIcon(tarea.miembro)} {tarea.miembro}
                      </Badge>
                      {tarea.categoria && (
                        <Badge variant="outline">{tarea.categoria}</Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => eliminarTarea(tarea.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TasksSection;