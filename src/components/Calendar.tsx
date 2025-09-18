import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, LogOut, Trash2 } from 'lucide-react';
import { Miembro, Tarea, TareasPorDia, Categorias } from '@/types';
import { saveTareas, saveAuth, loadTareas, loadSugeridas, saveSugeridas } from '@/lib/storage';
import { DIAS_SEMANA, MESES, getPrimerDiaMes, getDiasEnMes, esHoy } from '@/lib/calendar-utils';
import DayCell from './DayCell';
import SuggestedTasksPanel from './SuggestedTasksPanel';
import NotesModal from './NotesModal';
import DayModal from './DayModal';
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

const Calendar = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [miembroActivo, setMiembroActivo] = useState<Miembro>('mama');
  const [tareas, setTareas] = useState<TareasPorDia>(loadTareas);
  const [sugeridas, setSugeridas] = useState<Categorias>(loadSugeridas);
  const [modalTarea, setModalTarea] = useState<Tarea | null>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const { toast } = useToast();

  // Auto-guardar cuando cambien las tareas o sugeridas
  useEffect(() => {
    saveTareas(tareas);
  }, [tareas]);

  useEffect(() => {
    saveSugeridas(sugeridas);
  }, [sugeridas]);

  const handleLogout = useCallback(() => {
    saveAuth(false);
    window.location.reload();
  }, []);

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
    setTareas(newTareas);
    saveTareas(newTareas);
  }, []);

  const updateSugeridas = useCallback((newSugeridas: Categorias) => {
    setSugeridas(newSugeridas);
    saveSugeridas(newSugeridas);
  }, []);

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
      title: "Día borrado",
      description: `Todas las tareas del día ${day} han sido eliminadas`
    });
  }, [tareas, updateTareas, toast]);

  const borrarTodo = useCallback(() => {
    updateTareas({});
    toast({
      title: "Todas las tareas borradas",
      description: `Calendario de ${MESES[currentMonth]} limpio`
    });
  }, [updateTareas, toast, currentMonth]);

  // Generar días del calendario
  const primerDia = getPrimerDiaMes(currentYear, currentMonth);
  const diasEnMes = getDiasEnMes(currentYear, currentMonth);
  const dias = Array.from({ length: diasEnMes }, (_, i) => i + 1);
  const espaciosVacios = Array.from({ length: primerDia }, (_, i) => i);

  return (
    <div className="min-h-screen bg-background p-4">
      {/* Header */}
      <div className="mb-6">
        <Card className="shadow-apple">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-semibold">
                Calendario Familiar 👨‍👩‍👧‍👦
              </CardTitle>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout}
                className="gap-2"
              >
                <LogOut className="w-4 h-4" />
                Cerrar sesión
              </Button>
            </div>
            
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
                  onClick={() => setMiembroActivo('mama')}
                >
                  👩 Mamá
                </Button>
                <Button
                  size="sm"
                  className={miembroActivo === 'papa' ? 'btn-papa' : ''}
                  variant={miembroActivo === 'papa' ? 'default' : 'outline'}
                  onClick={() => setMiembroActivo('papa')}
                >
                  👨 Papá
                </Button>
                <Button
                  size="sm"
                  className={miembroActivo === 'ambos' ? 'btn-ambos' : ''}
                  variant={miembroActivo === 'ambos' ? 'default' : 'outline'}
                  onClick={() => setMiembroActivo('ambos')}
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
                    Borrar todo el mes
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Borrar todas las tareas?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta acción eliminará todas las tareas de {MESES[currentMonth]} {currentYear}. 
                      Esta acción no se puede deshacer.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={borrarTodo} className="bg-destructive">
                      Borrar todo
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardHeader>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendario principal */}
        <div className="lg:col-span-3">
          <Card className="shadow-apple">
            <CardContent className="p-6">
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
                    tareas={tareas[day] || []}
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
                    onEditTarea={setModalTarea}
                    onBorrarDia={() => borrarDia(day)}
                    onDayClick={() => setSelectedDay(day)}
                    isToday={esHoy(day, currentMonth, currentYear)}
                  />
                ))}
              </div>
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
          tareas={tareas[selectedDay] || []}
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
          onEditTarea={setModalTarea}
          onBorrarDia={() => borrarDia(selectedDay)}
        />
      )}
    </div>
  );
};

export default Calendar;