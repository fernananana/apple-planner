import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Grid3X3, Calendar as CalendarIcon, Eye } from 'lucide-react';
import { Tarea } from '@/types';
import { useStore } from '@/store/useStore';
import { CalendarHeader } from './calendar/CalendarHeader';
import { CalendarGrid } from './calendar/CalendarGrid';
import SuggestedTasksPanel from './SuggestedTasksPanel';
import NotesModal from './NotesModal';
import DayModal from './DayModal';
import EditTaskModal from './EditTaskModal';
import { useToast } from '@/hooks/use-toast';

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [modalTarea, setModalTarea] = useState<Tarea | null>(null);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [editingTask, setEditingTask] = useState<Tarea | null>(null);
  const { toast } = useToast();
  
  const { tareas, setTareas, activeView, setActiveView } = useStore();

  const handlePreviousMonth = useCallback(() => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (activeView === 'month') {
        newDate.setMonth(prev.getMonth() - 1);
      } else if (activeView === 'week') {
        newDate.setDate(prev.getDate() - 7);
      } else {
        newDate.setDate(prev.getDate() - 1);
      }
      return newDate;
    });
  }, [activeView]);

  const handleNextMonth = useCallback(() => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (activeView === 'month') {
        newDate.setMonth(prev.getMonth() + 1);
      } else if (activeView === 'week') {
        newDate.setDate(prev.getDate() + 7);
      } else {
        newDate.setDate(prev.getDate() + 1);
      }
      return newDate;
    });
  }, [activeView]);

  const handleDayClick = useCallback((date: Date) => {
    setSelectedDay(date);
  }, []);

  const handleDrop = useCallback((fecha: string, tareaId: string) => {
    const updatedTareas = tareas.map(tarea =>
      tarea.id === tareaId ? { ...tarea, fecha } : tarea
    );
    setTareas(updatedTareas);

    toast({
      title: "Tarea movida",
      description: "La tarea se ha movido correctamente",
    });
  }, [tareas, setTareas, toast]);

  const handleEditTask = useCallback((tarea: Tarea) => {
    setEditingTask(tarea);
  }, []);

  const handleUpdateTask = useCallback((updatedTask: Tarea) => {
    const updatedTareas = tareas.map(tarea =>
      tarea.id === updatedTask.id ? updatedTask : tarea
    );
    setTareas(updatedTareas);
    setEditingTask(null);
  }, [tareas, setTareas]);

  const getViewIcon = () => {
    switch (activeView) {
      case 'day': return <Calendar className="w-4 h-4" />;
      case 'week': return <Grid3X3 className="w-4 h-4" />;
      default: return <Eye className="w-4 h-4" />;
    }
  };

  const getViewLabel = () => {
    switch (activeView) {
      case 'day': return 'Día';
      case 'week': return 'Semana';
      default: return 'Mes';
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">
      {/* Panel izquierdo - Calendario */}
      <div className="flex-1">
        <Card className="shadow-apple h-full">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Calendario Familiar</CardTitle>
              
              {/* View Controls */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveView(activeView === 'month' ? 'week' : activeView === 'week' ? 'day' : 'month')}
                  className="gap-2"
                >
                  {getViewIcon()}
                  {getViewLabel()}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <CalendarHeader 
              currentDate={currentDate}
              onPreviousMonth={handlePreviousMonth}
              onNextMonth={handleNextMonth}
            />
            
            <CalendarGrid 
              currentDate={currentDate}
              onDayClick={handleDayClick}
              onTaskDrop={handleDrop}
            />
          </CardContent>
        </Card>
      </div>

      {/* Panel derecho - Tareas sugeridas */}
      <div className="w-full lg:w-80">
        <SuggestedTasksPanel />
      </div>

      {/* Modales */}
      {modalTarea && (
        <NotesModal
          tarea={modalTarea}
          onClose={() => setModalTarea(null)}
        />
      )}

      {selectedDay && (
        <DayModal
          date={selectedDay}
          onClose={() => setSelectedDay(null)}
          onEditTask={handleEditTask}
        />
      )}

      {editingTask && (
        <EditTaskModal
          tarea={editingTask}
          onClose={() => setEditingTask(null)}
          onSave={handleUpdateTask}
        />
      )}
    </div>
  );
};

export default Calendar;