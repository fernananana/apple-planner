export type Miembro = 'mama' | 'papa' | 'ambos' | 'viggo';

export type TipoRecurrencia = 'puntual' | 'diaria' | 'semanal' | 'mensual';

export interface Tarea {
  id: string;
  texto: string;
  miembro: Miembro;
  notas: string;
  completada: boolean;
  fechaCreacion: string;
  fechaCompletada?: string;
  recurrencia?: TipoRecurrencia;
  categoria?: string;
  valoracion?: number; // 1-5
  confirmada?: boolean;
  fecha?: string; // formato YYYY-MM-DD
  archivada?: boolean; // Para eliminación suave - no se muestra pero sigue en estadísticas
  confirmadaPor?: Miembro; // Quién confirmó la tarea
}

export type TareasPorDia = Record<number, Tarea[]>;

export type Categorias = Record<string, string[]>;

export interface TareaCompletada extends Tarea {
  fechaCompletada: string;
  confirmada: boolean;
  valoracion?: number;
}

export interface EstadisticasMiembro {
  total: number;
  completadas: number;
  pendientes: number;
  porcentaje: number;
}

export interface Dashboard {
  tareasPendientes: Tarea[];
  tareasCompletadas: TareaCompletada[];
  estadisticasPorMiembro: Record<Miembro, EstadisticasMiembro>;
  totalTareas: number;
}

export interface CalendarState {
  currentMonth: number;
  currentYear: number;
  miembroActivo: Miembro;
  tareas: TareasPorDia;
  sugeridas: Categorias;
  vista: 'diaria' | 'semanal' | 'mensual';
}

export interface AuthState {
  isAuthenticated: boolean;
}