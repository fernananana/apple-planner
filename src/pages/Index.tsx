import { useEffect } from 'react';
import { useStore } from '@/store/useStore';
import Login from '@/components/Login';
import Navigation from '@/components/Navigation';
import Calendar from '@/components/Calendar';
import Dashboard from '@/components/Dashboard';
import TasksSection from '@/components/TasksSection';
import MembersSection from '@/components/MembersSection';
import SettingsSection from '@/components/SettingsSection';
import { useMobile } from '@/hooks/use-mobile';

const Index = () => {
  const { 
    isAuthenticated, 
    currentSection, 
    setCurrentSection,
    logout 
  } = useStore();
  const isMobile = useMobile();

  if (!isAuthenticated) {
    return <Login />;
  }

  const renderCurrentSection = () => {
    switch (currentSection) {
      case 'dashboard':
        return (
          <Dashboard
            tareas={{}} // Will be handled by zustand
            currentMonth={new Date().getMonth()}
            currentYear={new Date().getFullYear()}
            onSectionChange={setCurrentSection}
          />
        );
      case 'calendar':
        return <Calendar />;
      case 'tasks':
        return <TasksSection />;
      case 'members':
        return <MembersSection />;
      case 'settings':
        return <SettingsSection onLogout={logout} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {isMobile ? (
        <div className="flex flex-col h-screen">
          <main className="flex-1 p-4 pb-20">
            {renderCurrentSection()}
          </main>
          <Navigation />
        </div>
      ) : (
        <div className="flex">
          <div className="w-64 flex-shrink-0">
            <div className="fixed top-4 left-4 bottom-4 w-56">
              <Navigation />
            </div>
          </div>
          <main className="flex-1 ml-64 p-6">
            {renderCurrentSection()}
          </main>
        </div>
      )}
    </div>
  );
};

export default Index;