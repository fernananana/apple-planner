import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Calendar as CalendarIcon, 
  CheckSquare, 
  Users, 
  Settings,
  BarChart3,
  Menu,
  X
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useMobile } from '@/hooks/use-mobile';

const Navigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { currentSection, setCurrentSection } = useStore();
  const isMobile = useMobile();

  const sections = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'calendar', label: 'Calendario', icon: CalendarIcon },
    { id: 'tasks', label: 'Tareas', icon: CheckSquare },
    { id: 'members', label: 'Miembros', icon: Users },
    { id: 'settings', label: 'Ajustes', icon: Settings },
  ];

  const NavButton = ({ section }: { section: typeof sections[0] }) => (
    <Button
      variant={currentSection === section.id ? 'default' : 'ghost'}
      size="lg"
      onClick={() => {
        setCurrentSection(section.id);
        setIsMobileMenuOpen(false);
      }}
      className="w-full justify-start gap-3 h-12 text-base"
    >
      <section.icon className="w-5 h-5" />
      {section.label}
    </Button>
  );

  if (isMobile) {
    return (
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
        <div className="flex justify-around py-2">
          {sections.map((section) => (
            <Button
              key={section.id}
              variant={currentSection === section.id ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setCurrentSection(section.id)}
              className="flex flex-col items-center gap-1 h-auto py-2 px-3"
            >
              <section.icon className="w-4 h-4" />
              <span className="text-xs">{section.label}</span>
            </Button>
          ))}
        </div>
      </nav>
    );
  }

  return (
    <>
      {/* Desktop Navigation */}
      <Card className="shadow-apple">
        <CardContent className="p-4">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold mb-4">Calendario Familiar 👨‍👩‍👧‍👦</h2>
            {sections.map((section) => (
              <NavButton key={section.id} section={section} />
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default Navigation;