import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Trash2, Eye, Grid3X3, Calendar as CalendarIcon } from 'lucide-react';
import { Miembro, Tarea, TareasPorDia, Categorias } from '@/types';
import { saveTareas, loadTareas, loadSugeridas, saveSugeridas } from '@/lib/storage';
import { DIAS_SEMANA, MESES, getPrimerDiaMes, getDiasEnMes, esHoy } from '@/lib/calendar-utils';
import DayCell from './DayCell';
import SuggestedTasksPanel from './SuggestedTasksPanel';
import NotesModal from './NotesModal';
import DayModal from './DayModal';
import EditTaskModal from './EditTaskModal';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface CalendarProps {
  tareas: TareasPorDia;
  sugeridas: Categorias;
  miembroActivo: Miembro;
  onTareasChange: (tareas: TareasPorDia) => void;
  onSugeridasChange: (sugeridas: Categorias) => void;
  onMiembroChange: (miembro: Miembro) => void;
}

const Calendar = ({ 
  tareas, 
  sugeridas, 
  miembroActivo, 
  onTareasChange, 
  onSugeridasChange, 
  onMiembroChange 
}: CalendarProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [modalTarea, setModalTarea] = useState<Tarea | null>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [vista, setVista] = useState<'diaria' | 'semanal' | 'mensual'>('mensual');
  const [editingTask, setEditingTask] = useState<Tarea | null>(null);
  const { toast } = useToast();


  const navigateMonth = useCallback((direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(prev => prev - 1);
      } else {
        setCurrentMonth(prev => prev - 1);
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(prev => prev + 1);
      } else {
        setCurrentMonth(prev => prev + 1);
      }
    }
  }, [currentMonth]);

  const updateTareas = useCallback((newTareas: TareasPorDia) => {
    onTareasChange(newTareas);
  }, [onTareasChange]);

  const updateSugeridas = useCallback((newSugeridas: Categorias) => {
    onSugeridasChange(newSugeridas);
  }, [onSugeridasChange]);

  // Función para remover una tarea de un día específico después de moverla
  const removerTareaDeDia = useCallback((tareaId: string, diaOrigen: number) => {
    const updated = { ...tareas };
    
    if (updated[diaOrigen]) {
      const tareaIndex = updated[diaOrigen].findIndex(t => t.id === tareaId);
      if (tareaIndex !== -1) {
        updated[diaOrigen].splice(tareaIndex, 1);
        
        // Si el día origen queda vacío, eliminarlo
        if (updated[diaOrigen].length === 0) {
          delete updated[diaOrigen];
        }
        
        updateTareas(updated);
      }
    }
  }, [tareas, updateTareas]);

  const borrarDia = useCallback((day: number) => {
    const newTareas = { ...tareas };
    delete newTareas[day];
    updateTareas(newTareas);
    toast({
      title: "Día archivado",
      description: `Todas las tareas del día ${day} han sido archivadas`
    });
  }, [tareas, updateTareas, toast]);

  const borrarMes = useCallback(() => {
    const newTareas = { ...tareas };
    // Archivar todas las tareas del mes actual
    Object.keys(newTareas).forEach(day => {
      const dayNum = parseInt(day);
      if (newTareas[dayNum]) {
        newTareas[dayNum] = newTareas[dayNum].map(tarea => ({
          ...tarea,
          archivada: true
        }));
      }
    });
    updateTareas(newTareas);
    toast({
      title: "Mes archivado",
      description: `Todas las tareas de ${MESES[currentMonth]} han sido archivadas. Las estadísticas se mantienen.`
    });
  }, [tareas, updateTareas, toast, currentMonth]);

  // Filtrar tareas archivadas para la vista
  const tareasVisibles = Object.keys(tareas).reduce((acc, day) => {
    const dayNum = parseInt(day);
    const tareasDia = tareas[dayNum].filter(t => !t.archivada);
    if (tareasDia.length > 0) {
      acc[dayNum] = tareasDia;
    }
    return acc;
  }, {} as TareasPorDia);

  // Generar días del calendario
  const primerDia = getPrimerDiaMes(currentYear, currentMonth);
  const diasEnMes = getDiasEnMes(currentYear, currentMonth);
  const dias = Array.from({ length: diasEnMes }, (_, i) => i + 1);
  const espaciosVacios = Array.from({ length: primerDia }, (_, i) => i);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Calendario</h1>
          <p className="text-muted-foreground">{MESES[currentMonth]} {currentYear}</p>
        </div>
        
        {/* Controles de Vista */}
        <div className="flex items-center gap-2">
          <Button
            variant={vista === 'diaria' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setVista('diaria')}
            className="gap-2"
          >
            <Eye className="w-4 h-4" />
            Día
          </Button>
          <Button
            variant={vista === 'semanal' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setVista('semanal')}
            className="gap-2"
          >
            <Grid3X3 className="w-4 h-4" />
            Semana
          </Button>
          <Button
            variant={vista === 'mensual' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setVista('mensual')}
            className="gap-2"
          >
            <CalendarIcon className="w-4 h-4" />
            Mes
          </Button>
        </div>
      </div>

      <Card className="shadow-apple">
        <CardHeader>
            
            {/* Navegación del mes */}
            <div className="flex items-center justify-between">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigateMonth('prev')}
                className="gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                Anterior
              </Button>
              
              <h2 className="text-xl font-medium">
                {MESES[currentMonth]} {currentYear}
              </h2>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigateMonth('next')}
                className="gap-1"
              >
                Siguiente
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Selector de miembro activo */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">Miembro activo:</span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className={miembroActivo === 'mama' ? 'btn-mama' : ''}
                  variant={miembroActivo === 'mama' ? 'default' : 'outline'}
                  onClick={() => onMiembroChange('mama')}
                >
                  👩 Mamá
                </Button>
                <Button
                  size="sm"
                  className={miembroActivo === 'papa' ? 'btn-papa' : ''}
                  variant={miembroActivo === 'papa' ? 'default' : 'outline'}
                  onClick={() => onMiembroChange('papa')}
                >
                  👨 Papá
                </Button>
                <Button
                  size="sm"
                  className={miembroActivo === 'ambos' ? 'btn-ambos' : ''}
                  variant={miembroActivo === 'ambos' ? 'default' : 'outline'}
                  onClick={() => onMiembroChange('ambos')}
                >
                  👨‍👩 Ambos
                </Button>
              </div>
            </div>

            {/* Botones de borrado */}
            <div className="flex gap-2">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2 text-destructive">
                    <Trash2 className="w-4 h-4" />
                    Archivar todo el mes
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Archivar todas las tareas del mes?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta acción ocultará todas las tareas de {MESES[currentMonth]} {currentYear} de la vista, 
                      pero se mantendrán en las estadísticas para análisis histórico.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={borrarMes} className="bg-destructive">
                      Archivar mes
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardHeader>
        </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendario principal */}
        <div className="lg:col-span-3">
          <Card className="shadow-apple">
            <CardContent className="p-6">
              {vista === 'mensual' && (
                <>
                  {/* Cabeceras de días */}
                  <div className="grid grid-cols-7 gap-1 mb-4">
                    {DIAS_SEMANA.map((dia) => (
                      <div 
                        key={dia} 
                        className="h-10 flex items-center justify-center font-medium text-muted-foreground"
                      >
                        {dia}
                      </div>
                    ))}
                  </div>

                  {/* Días del calendario */}
                  <div className="grid grid-cols-7 gap-1">
                    {/* Espacios vacíos al inicio */}
                    {espaciosVacios.map((_, index) => (
                      <div key={`empty-${index}`} className="h-32"></div>
                    ))}
                    
                     {/* Días del mes */}
                     {dias.map((day) => (
                       <DayCell
                         key={day}
                         day={day}
                         month={currentMonth}
                         year={currentYear}
                         tareas={tareasVisibles[day] || []}
                         miembroActivo={miembroActivo}
                          onTareasChange={(newTareas) => {
                            const updated = { ...tareas };
                            if (newTareas.length === 0) {
                              delete updated[day];
                            } else {
                              updated[day] = newTareas;
                            }
                            updateTareas(updated);
                          }}
                         onMoverTarea={(tareaId, diaOrigen) => removerTareaDeDia(tareaId, diaOrigen)}
                        onEditTarea={setEditingTask}
                        onBorrarDia={() => borrarDia(day)}
                        onDayClick={() => setSelectedDay(day)}
                        isToday={esHoy(day, currentMonth, currentYear)}
                      />
                    ))}
                  </div>
                </>
              )}

              {vista === 'semanal' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Vista Semanal</h3>
                  <div className="grid grid-cols-7 gap-4">
                    {DIAS_SEMANA.map((dia, index) => {
                      const dayOfWeek = new Date().getDay();
                      const startOfWeek = new Date();
                      startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek + index);
                      const dayNum = startOfWeek.getDate();
                      
                      return (
                          <div key={dia} className="space-y-2">
                            <h4 className="font-medium text-center">{dia}</h4>
                            <div className="min-h-40 p-2 border rounded-lg bg-muted/20">
                              <div className="text-center font-semibold mb-2">{dayNum}</div>
                              {(tareasVisibles[dayNum] || []).map((tarea) => (
                                <div key={tarea.id} className="p-1 mb-1 text-xs bg-primary/10 rounded">
                                  {tarea.texto}
                                </div>
                              ))}
                            </div>
                          </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {vista === 'diaria' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Vista Diaria - {new Date().getDate()} de {MESES[currentMonth]}</h3>
                  <div className="space-y-2">
                    {(tareasVisibles[new Date().getDate()] || []).map((tarea) => (
                      <div key={tarea.id} className="p-4 border rounded-lg bg-card">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{tarea.texto}</span>
                          <span className="text-sm text-muted-foreground">
                            {tarea.miembro === 'mama' ? '👩 Mamá' : tarea.miembro === 'papa' ? '👨 Papá' : '👨‍👩 Ambos'}
                          </span>
                        </div>
                        {tarea.notas && (
                          <p className="text-sm text-muted-foreground mt-2">{tarea.notas}</p>
                        )}
                      </div>
                    ))}
                    {!(tareasVisibles[new Date().getDate()] || []).length && (
                      <p className="text-center text-muted-foreground py-8">
                        No hay tareas para hoy
                      </p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Panel de tareas sugeridas */}
        <div className="lg:col-span-1">
          <SuggestedTasksPanel
            sugeridas={sugeridas}
            onSugeridasChange={updateSugeridas}
            miembroActivo={miembroActivo}
          />
        </div>
      </div>

      {/* Modal de notas */}
      {modalTarea && (
        <NotesModal
          tarea={modalTarea}
          onSave={(updatedTarea) => {
            const day = Object.keys(tareas).find(key => 
              tareas[parseInt(key)]?.some(t => t.id === updatedTarea.id)
            );
            if (day) {
              const dayNum = parseInt(day);
              const updatedTareas = tareas[dayNum].map(t => 
                t.id === updatedTarea.id ? updatedTarea : t
              );
              const newTareas = { ...tareas, [dayNum]: updatedTareas };
              updateTareas(newTareas);
            }
            setModalTarea(null);
          }}
          onClose={() => setModalTarea(null)}
        />
      )}

      {/* Modal de día completo */}
      {selectedDay && (
        <DayModal
          day={selectedDay}
          month={currentMonth}
          year={currentYear}
          tareas={tareasVisibles[selectedDay] || []}
          miembroActivo={miembroActivo}
          isOpen={!!selectedDay}
          onClose={() => setSelectedDay(null)}
          onTareasChange={(newTareas) => {
            const updated = { ...tareas };
            if (newTareas.length === 0) {
              delete updated[selectedDay];
            } else {
              updated[selectedDay] = newTareas;
            }
            updateTareas(updated);
          }}
          onEditTarea={setEditingTask}
          onBorrarDia={() => borrarDia(selectedDay)}
        />
      )}

      {/* Modal de edición de tarea */}
      {editingTask && (
        <EditTaskModal
          tarea={editingTask}
          isOpen={!!editingTask}
          onClose={() => setEditingTask(null)}
          onSave={(updatedTarea) => {
            const day = Object.keys(tareas).find(key => 
              tareas[parseInt(key)]?.some(t => t.id === updatedTarea.id)
            );
            if (day) {
              const dayNum = parseInt(day);
              const updatedTareas = tareas[dayNum].map(t => 
                t.id === updatedTarea.id ? updatedTarea : t
              );
              const newTareas = { ...tareas, [dayNum]: updatedTareas };
              updateTareas(newTareas);
            }
            setEditingTask(null);
          }}
        />
      )}
    </div>
  );
};

export default Calendar;