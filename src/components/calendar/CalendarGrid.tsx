import DayCell from '@/components/DayCell';
import { useStore } from '@/store/useStore';

interface CalendarGridProps {
  currentDate: Date;
  onDayClick: (date: Date) => void;
  onTaskDrop: (fecha: string, tareaId: string) => void;
}

export const CalendarGrid = ({ currentDate, onDayClick, onTaskDrop }: CalendarGridProps) => {
  const { tareas, activeView } = useStore((state) => ({
    tareas: state.tareas,
    activeView: state.activeView,
  }));

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const currentDay = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      days.push(new Date(currentDay));
      currentDay.setDate(currentDay.getDate() + 1);
    }
    
    return days;
  };

  const getWeekDays = (date: Date) => {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const getDayView = (date: Date) => {
    return [date];
  };

  const getDaysToShow = () => {
    switch (activeView) {
      case 'week':
        return getWeekDays(currentDate);
      case 'day':
        return getDayView(currentDate);
      default:
        return getDaysInMonth(currentDate);
    }
  };

  const days = getDaysToShow();
  const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  const getGridClass = () => {
    switch (activeView) {
      case 'week':
        return 'grid grid-cols-7 gap-2';
      case 'day':
        return 'grid grid-cols-1 gap-4';
      default:
        return 'grid grid-cols-7 gap-2';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header with day names */}
      {activeView !== 'day' && (
        <div className="grid grid-cols-7 gap-2">
          {diasSemana.map((dia) => (
            <div key={dia} className="p-2 text-center font-medium text-muted-foreground">
              {dia}
            </div>
          ))}
        </div>
      )}

      {/* Calendar grid */}
      <div className={getGridClass()}>
        {days.map((day, index) => {
          const fechaStr = day.toISOString().split('T')[0];
          const tareasDelDia = tareas.filter(tarea => tarea.fecha === fechaStr);
          
          return (
            <DayCell
              key={index}
              day={day.getDate()}
              month={day.getMonth()}
              year={day.getFullYear()}
              tareas={tareasDelDia}
              miembroActivo={tareas.find(t => t.fecha === fechaStr)?.miembro || 'mama'}
              onTareasChange={(updatedTareas) => {
                const allTareas = tareas.filter(t => t.fecha !== fechaStr).concat(updatedTareas);
                // This will be handled by the parent component
              }}
              onEditTarea={() => {}}
              onBorrarDia={() => {}}
              onDayClick={() => onDayClick(day)}
              isToday={day.toDateString() === new Date().toDateString()}
            />
          );
        })}
      </div>
    </div>
  );
};