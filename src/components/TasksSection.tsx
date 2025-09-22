import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Repeat, 
  Calendar as CalendarIcon,
  Clock,
  Edit2,
  Trash2,
  Search
} from 'lucide-react';
import { Tarea, Miembro, TipoRecurrencia } from '@/types';
import { useStore } from '@/store/useStore';
import { useToast } from '@/hooks/use-toast';
import { generarId } from '@/lib/calendar-utils';

const TasksSection = () => {
  const { tareas, setTareas, miembroActivo } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [nuevaTarea, setNuevaTarea] = useState({
    texto: '',
    miembro: miembroActivo,
    notas: '',
    recurrencia: 'puntual' as TipoRecurrencia,
    categoria: ''
  });
  
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const { toast } = useToast();

  // Filter tasks based on search term
  const filteredTareas = tareas.filter(tarea => 
    tarea.texto.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tarea.categoria?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tarea.notas.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const tareasRecurrentes = filteredTareas.filter(t => t.recurrencia && t.recurrencia !== 'puntual');
  const tareasPuntuales = filteredTareas.filter(t => !t.recurrencia || t.recurrencia === 'puntual');

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
      id: generarId(),
      texto: nuevaTarea.texto,
      miembro: nuevaTarea.miembro as Miembro,
      notas: nuevaTarea.notas,
      completada: false,
      fechaCreacion: new Date().toISOString(),
      recurrencia: nuevaTarea.recurrencia,
      categoria: nuevaTarea.categoria || undefined,
      fecha: new Date().toISOString().split('T')[0] // Add required fecha field
    };
    
    setTareas([...tareas, tarea]);
    
    setNuevaTarea({
      texto: '',
      miembro: miembroActivo,
      notas: '',
      recurrencia: 'puntual',
      categoria: ''
    });

    setMostrarFormulario(false);

    toast({
      title: "Tarea creada",
      description: "La nueva tarea se ha añadido correctamente"
    });
  };

  const eliminarTarea = (tareaId: string) => {
    const updatedTareas = tareas.filter(t => t.id !== tareaId);
    setTareas(updatedTareas);
    
    toast({
      title: "Tarea eliminada",
      description: "La tarea se ha eliminado correctamente"
    });
  };

  const toggleCompletada = (tareaId: string) => {
    const updatedTareas = tareas.map(tarea => 
      tarea.id === tareaId 
        ? { 
            ...tarea, 
            completada: !tarea.completada,
            fechaCompletada: !tarea.completada ? new Date().toISOString() : undefined
          }
        : tarea
    );
    setTareas(updatedTareas);
    
    const tarea = tareas.find(t => t.id === tareaId);
    toast({
      title: tarea?.completada ? "Tarea pendiente" : "Tarea completada",
      description: tarea?.completada 
        ? "La tarea se ha marcado como pendiente" 
        : "¡Bien hecho! Tarea completada"
    });
  };

  const getMiembroIcon = (miembro: Miembro) => {
    switch (miembro) {
      case 'mama': return '👩';
      case 'papa': return '👨';
      case 'viggo': return '🧒';
      case 'ambos': return '👨‍👩';
    }
  };

  const getRecurrenciaIcon = (recurrencia?: TipoRecurrencia) => {
    switch (recurrencia) {
      case 'diaria': return <Repeat className="w-3 h-3 text-green-500" />;
      case 'semanal': return <CalendarIcon className="w-3 h-3 text-blue-500" />;
      case 'mensual': return <Clock className="w-3 h-3 text-purple-500" />;
      default: return null;
    }
  };

  const TaskCard = ({ tarea }: { tarea: Tarea }) => (
    <Card className={`transition-all hover-lift ${tarea.completada ? 'opacity-60' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleCompletada(tarea.id)}
                className={`p-1 h-6 w-6 rounded-full ${
                  tarea.completada 
                    ? 'bg-green-500 text-white hover:bg-green-600' 
                    : 'border-2 border-muted-foreground hover:border-primary'
                }`}
              >
                {tarea.completada && '✓'}
              </Button>
              <h3 className={`font-medium text-sm ${tarea.completada ? 'line-through' : ''}`}>
                {tarea.texto}
              </h3>
            </div>
            
            {tarea.notas && (
              <p className="text-xs text-muted-foreground mb-2">{tarea.notas}</p>
            )}
            
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="text-xs">
                {getMiembroIcon(tarea.miembro)} {tarea.miembro}
              </Badge>
              
              {tarea.categoria && (
                <Badge variant="secondary" className="text-xs">
                  {tarea.categoria}
                </Badge>
              )}
              
              {tarea.recurrencia && tarea.recurrencia !== 'puntual' && (
                <Badge variant="outline" className="text-xs flex items-center gap-1">
                  {getRecurrenciaIcon(tarea.recurrencia)}
                  {tarea.recurrencia}
                </Badge>
              )}
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => eliminarTarea(tarea.id)}
            className="p-1 h-6 w-6 text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Gestión de Tareas</h1>
          <p className="text-muted-foreground">Organiza y administra todas las tareas familiares</p>
        </div>
        <Button onClick={() => setMostrarFormulario(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Nueva Tarea
        </Button>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              type="search"
              placeholder="Buscar tareas por nombre, categoría o notas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Crear Nueva Tarea */}
      {mostrarFormulario && (
        <Card>
          <CardHeader>
            <CardTitle>Nueva Tarea</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="texto">Descripción de la tarea</Label>
              <Input
                id="texto"
                value={nuevaTarea.texto}
                onChange={(e) => setNuevaTarea(prev => ({ ...prev, texto: e.target.value }))}
                placeholder="¿Qué hay que hacer?"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="miembro">Asignado a</Label>
                <Select 
                  value={nuevaTarea.miembro} 
                  onValueChange={(value) => setNuevaTarea(prev => ({ ...prev, miembro: value as Miembro }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar miembro" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mama">👩 Mamá</SelectItem>
                    <SelectItem value="papa">👨 Papá</SelectItem>
                    <SelectItem value="viggo">🧒 Viggo</SelectItem>
                    <SelectItem value="ambos">👨‍👩 Ambos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="recurrencia">Tipo de recurrencia</Label>
                <Select 
                  value={nuevaTarea.recurrencia} 
                  onValueChange={(value) => setNuevaTarea(prev => ({ ...prev, recurrencia: value as TipoRecurrencia }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar recurrencia" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="puntual">Puntual</SelectItem>
                    <SelectItem value="diaria">Diaria</SelectItem>
                    <SelectItem value="semanal">Semanal</SelectItem>
                    <SelectItem value="mensual">Mensual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="categoria">Categoría</Label>
              <Input
                id="categoria"
                value={nuevaTarea.categoria}
                onChange={(e) => setNuevaTarea(prev => ({ ...prev, categoria: e.target.value }))}
                placeholder="Ej: Cocina, Limpieza, Niños..."
              />
            </div>

            <div>
              <Label htmlFor="notas">Notas adicionales</Label>
              <Textarea
                id="notas"
                value={nuevaTarea.notas}
                onChange={(e) => setNuevaTarea(prev => ({ ...prev, notas: e.target.value }))}
                placeholder="Detalles, instrucciones especiales..."
                className="resize-none"
                rows={3}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={crearTarea} className="flex-1">
                <Plus className="w-4 h-4 mr-2" />
                Crear Tarea
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setMostrarFormulario(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de Tareas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tareas Puntuales */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Tareas Puntuales ({tareasPuntuales.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {tareasPuntuales.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No hay tareas puntuales
                </p>
              ) : (
                tareasPuntuales.map((tarea) => (
                  <TaskCard key={tarea.id} tarea={tarea} />
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tareas Recurrentes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Repeat className="w-5 h-5" />
              Tareas Recurrentes ({tareasRecurrentes.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {tareasRecurrentes.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No hay tareas recurrentes
                </p>
              ) : (
                tareasRecurrentes.map((tarea) => (
                  <TaskCard key={tarea.id} tarea={tarea} />
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TasksSection;