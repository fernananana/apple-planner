import { useState, useEffect } from 'react';
import { loadAuth, loadTareas, loadSugeridas, saveTareas, saveSugeridas, saveAuth } from '@/lib/storage';
import { Miembro, TareasPorDia, Categorias } from '@/types';
import Login from '@/components/Login';
import Navigation from '@/components/Navigation';
import Calendar from '@/components/Calendar';
import Dashboard from '@/components/Dashboard';
import TasksSection from '@/components/TasksSection';
import MembersSection from '@/components/MembersSection';
import SettingsSection from '@/components/SettingsSection';

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [currentSection, setCurrentSection] = useState('dashboard');
  const [miembroActivo, setMiembroActivo] = useState<Miembro>('mama');
  const [tareas, setTareas] = useState<TareasPorDia>(loadTareas);
  const [sugeridas, setSugeridas] = useState<Categorias>(loadSugeridas);

  useEffect(() => {
    const authStatus = loadAuth();
    setIsAuthenticated(authStatus);
  }, []);

  // Auto-guardar cuando cambien las tareas o sugeridas
  useEffect(() => {
    saveTareas(tareas);
  }, [tareas]);

  useEffect(() => {
    saveSugeridas(sugeridas);
  }, [sugeridas]);

  const handleLogout = () => {
    saveAuth(false);
    setIsAuthenticated(false);
  };

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onSuccess={() => setIsAuthenticated(true)} />;
  }

  const renderCurrentSection = () => {
    switch (currentSection) {
      case 'dashboard':
        return (
          <Dashboard
            tareas={tareas}
            currentMonth={new Date().getMonth()}
            currentYear={new Date().getFullYear()}
            onSectionChange={setCurrentSection}
          />
        );
      case 'calendar':
        return (
          <Calendar
            tareas={tareas}
            sugeridas={sugeridas}
            miembroActivo={miembroActivo}
            onTareasChange={setTareas}
            onSugeridasChange={setSugeridas}
            onMiembroChange={setMiembroActivo}
          />
        );
      case 'tasks':
        return (
          <TasksSection
            tareas={tareas}
            onTareasChange={setTareas}
            miembroActivo={miembroActivo}
          />
        );
      case 'members':
        return (
          <MembersSection
            tareas={tareas}
            miembroActivo={miembroActivo}
            onMiembroChange={setMiembroActivo}
          />
        );
      case 'settings':
        return (
          <SettingsSection
            tareas={tareas}
            sugeridas={sugeridas}
            onTareasChange={setTareas}
            onSugeridasChange={setSugeridas}
            onLogout={handleLogout}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex flex-col md:flex-row">
        {/* Navigation */}
        <div className="md:w-64 md:flex-shrink-0">
          <div className="md:fixed md:top-4 md:left-4 md:bottom-4 md:w-56">
            <Navigation
              currentSection={currentSection}
              onSectionChange={setCurrentSection}
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 md:ml-64 p-4 md:p-6">
          {renderCurrentSection()}
        </div>
      </div>
    </div>
  );
};

export default Index;