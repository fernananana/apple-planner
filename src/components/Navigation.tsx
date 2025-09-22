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

interface NavigationProps {
  currentSection: string;
  onSectionChange: (section: string) => void;
}

const Navigation = ({ currentSection, onSectionChange }: NavigationProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
        onSectionChange(section.id);
        setIsMobileMenuOpen(false);
      }}
      className="w-full justify-start gap-3 h-12 text-base"
    >
      <section.icon className="w-5 h-5" />
      {section.label}
    </Button>
  );

  return (
    <>
      {/* Mobile Menu Toggle */}
      <div className="md:hidden fixed top-4 right-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="bg-background/80 backdrop-blur-sm"
        >
          {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </Button>
      </div>

      {/* Desktop Navigation */}
      <Card className="hidden md:block shadow-apple">
        <CardContent className="p-4">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold mb-4">Calendario Familiar 👨‍👩‍👧‍👦</h2>
            {sections.map((section) => (
              <NavButton key={section.id} section={section} />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Mobile Navigation Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-background/80 backdrop-blur-sm">
          <Card className="absolute top-16 left-4 right-4 shadow-apple">
            <CardContent className="p-4">
              <div className="space-y-2">
                <h2 className="text-lg font-semibold mb-4">Calendario Familiar 👨‍👩‍👧‍👦</h2>
                {sections.map((section) => (
                  <NavButton key={section.id} section={section} />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};

export default Navigation;