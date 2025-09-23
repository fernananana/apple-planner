import { Suspense } from 'react';
import { useStore } from '@/store/useStore';
import Login from '@/components/Login';
import Navigation from '@/components/Navigation';
import { useMobile } from '@/hooks/use-mobile';
import { SEOHead } from '@/components/SEOHead';
import { 
  LazyCalendar, 
  LazyDashboard, 
  LazyTasksSection, 
  LazyMembersSection, 
  LazySettingsSection 
} from '@/components/LazyComponents';

// Loading component with accessibility
const LoadingSpinner = () => (
  <div 
    className="flex items-center justify-center p-8" 
    role="status" 
    aria-live="polite"
    aria-label="Cargando contenido"
  >
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    <span className="ml-2 text-muted-foreground">Cargando...</span>
  </div>
);

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
    const content = (() => {
      switch (currentSection) {
        case 'dashboard':
          return (
            <LazyDashboard
              tareas={{}} // Will be handled by zustand
              currentMonth={new Date().getMonth()}
              currentYear={new Date().getFullYear()}
              onSectionChange={setCurrentSection}
            />
          );
        case 'calendar':
          return <LazyCalendar />;
        case 'tasks':
          return <LazyTasksSection />;
        case 'members':
          return <LazyMembersSection />;
        case 'settings':
          return <LazySettingsSection onLogout={logout} />;
        default:
          return null;
      }
    })();

    return (
      <Suspense fallback={<LoadingSpinner />}>
        {content}
      </Suspense>
    );
  };

  return (
    <>
      <SEOHead />
      <div className="min-h-screen bg-background" role="application" aria-label="Calendario Familiar">
      {isMobile ? (
        <div className="flex flex-col h-screen">
          <main id="main-content" className="flex-1 p-4 pb-20" role="main">
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
          <main id="main-content" className="flex-1 ml-64 p-6" role="main">
            {renderCurrentSection()}
          </main>
        </div>
      )}
    </div>
    </>
  );
};

export default Index;