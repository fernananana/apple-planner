import {
  Calendar as CalendarIcon,
  CheckSquare,
  Users,
  Settings,
  BarChart3,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

interface AppSidebarProps {
  currentSection: string;
  onSectionChange: (section: string) => void;
}

export function AppSidebar({ currentSection, onSectionChange }: AppSidebarProps) {
  const sections = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'calendar', label: 'Calendario', icon: CalendarIcon },
    { id: 'tasks', label: 'Tareas', icon: CheckSquare },
    { id: 'members', label: 'Miembros', icon: Users },
    { id: 'settings', label: 'Ajustes', icon: Settings },
  ];

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <h2 className="text-lg font-semibold px-2 py-4">Calendario Familiar 👨‍👩‍👧‍👦</h2>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegación</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {sections.map((section) => (
                <SidebarMenuItem key={section.id}>
                  <SidebarMenuButton
                    onClick={() => onSectionChange(section.id)}
                    isActive={currentSection === section.id}
                    tooltip={section.label}
                  >
                    <section.icon className="h-5 w-5" />
                    <span>{section.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
