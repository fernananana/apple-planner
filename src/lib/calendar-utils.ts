/**
 * Utilidades para el calendario - operaciones de fecha y formato
 */

export const DIAS_SEMANA = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

export const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

/**
 * Obtiene el primer día del mes (0 = domingo, 1 = lunes, etc.)
 * Ajustado para que lunes sea 0
 */
export const getPrimerDiaMes = (year: number, month: number): number => {
  const firstDay = new Date(year, month, 1).getDay();
  return firstDay === 0 ? 6 : firstDay - 1; // Lunes = 0
};

/**
 * Obtiene el número de días en un mes
 */
export const getDiasEnMes = (year: number, month: number): number => {
  return new Date(year, month + 1, 0).getDate();
};

/**
 * Verifica si una fecha es hoy
 */
export const esHoy = (day: number, month: number, year: number): boolean => {
  const today = new Date();
  return day === today.getDate() && 
         month === today.getMonth() && 
         year === today.getFullYear();
};

/**
 * Genera un ID único para tareas
 */
export const generarId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * Formatea una fecha para mostrar
 */
export const formatearFecha = (day: number, month: number, year: number): string => {
  return `${day} de ${MESES[month]} de ${year}`;
};