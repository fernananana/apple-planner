export type Miembro = 'mama' | 'papa' | 'ambos';

export interface Tarea {
  id: string;
  texto: string;
  miembro: Miembro;
  notas: string;
  completada: boolean;
}

export type TareasPorDia = Record<number, Tarea[]>;

export type Categorias = Record<string, string[]>;

export interface CalendarState {
  currentMonth: number;
  currentYear: number;
  miembroActivo: Miembro;
  tareas: TareasPorDia;
  sugeridas: Categorias;
}

export interface AuthState {
  isAuthenticated: boolean;
}