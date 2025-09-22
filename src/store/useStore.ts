import { create } from 'zustand';
import { Tarea, TareaSugerida, Miembro } from '@/types';
import { loadTareas, saveTareas, loadSugeridas, saveSugeridas } from '@/lib/storage';

// Debounce function to optimize localStorage writes
const debounce = (func: Function, wait: number) => {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

interface AppState {
  // Authentication
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;

  // Active member
  miembroActivo: Miembro;
  setMiembroActivo: (miembro: Miembro) => void;

  // Tasks
  tareas: Tarea[];
  setTareas: (tareas: Tarea[]) => void;

  // Suggested tasks
  sugeridas: TareaSugerida[];
  setSugeridas: (sugeridas: TareaSugerida[]) => void;

  // Current view
  activeView: 'month' | 'week' | 'day';
  setActiveView: (view: 'month' | 'week' | 'day') => void;

  // Current section
  currentSection: string;
  setCurrentSection: (section: string) => void;
}

// Create debounced save functions
const debouncedSaveTareas = debounce(saveTareas, 500);
const debouncedSaveSugeridas = debounce(saveSugeridas, 500);

export const useStore = create<AppState>((set, get) => ({
  // Authentication
  isAuthenticated: localStorage.getItem('familyCalendarAuth') === 'true',
  login: () => {
    localStorage.setItem('familyCalendarAuth', 'true');
    set({ isAuthenticated: true });
  },
  logout: () => {
    localStorage.removeItem('familyCalendarAuth');
    set({ isAuthenticated: false });
  },

  // Active member
  miembroActivo: 'mama',
  setMiembroActivo: (miembro: Miembro) => set({ miembroActivo: miembro }),

  // Tasks
  tareas: [],
  setTareas: (tareas: Tarea[]) => {
    set({ tareas });
    debouncedSaveTareas(tareas);
  },

  // Suggested tasks
  sugeridas: [],
  setSugeridas: (sugeridas: TareaSugerida[]) => {
    set({ sugeridas });
    debouncedSaveSugeridas(sugeridas);
  },

  // Current view
  activeView: 'month',
  setActiveView: (view: 'month' | 'week' | 'day') => set({ activeView: view }),

  // Current section
  currentSection: 'calendar',
  setCurrentSection: (section: string) => set({ currentSection: section }),
}));