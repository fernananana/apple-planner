import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarHeaderProps {
  currentDate: Date;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
}

export const CalendarHeader = ({ currentDate, onPreviousMonth, onNextMonth }: CalendarHeaderProps) => {
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  return (
    <div className="flex items-center justify-between mb-6">
      <Button variant="outline" size="icon" onClick={onPreviousMonth}>
        <ChevronLeft className="w-4 h-4" />
      </Button>
      
      <h2 className="text-2xl font-bold text-center">
        {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
      </h2>
      
      <Button variant="outline" size="icon" onClick={onNextMonth}>
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
};