import { TareasPorDia, Categorias } from '../types';

const STORAGE_KEYS = {
  TAREAS: 'familia-calendario-tareas',
  SUGERIDAS: 'familia-calendario-sugeridas',
  AUTH: 'familia-calendario-auth'
} as const;

// Datos iniciales de tareas sugeridas
export const SUGERIDAS_INICIALES: Categorias = {
  '🍳 Cocina': [
    'Hacer la compra',
    'Preparar la comida',
    'Hacer menú semanal',
    'Hacer la lista de la compra',
    'Preparar desayuno',
    'Cocinar cena',
    'Limpiar platos'
  ],
  '🧹 Limpieza': [
    'Llevar la basura',
    'Habitación papá y mamá',
    'Habitación de Viggo',
    'Despacho',
    'Cocina',
    'Hacer la cama',
    'Poner lavadora',
    'Tender ropa',
    'Doblar ropa',
    'Aspirar',
    'Baño'
  ],
  '👶 Niños': [
    'Recoger al niño',
    'Llevar al baño',
    'Cuidar de Viggo',
    'Bañar a Viggo',
    'Jugar con Viggo',
    'Leer cuento',
    'Preparar merienda',
    'Llevar al parque'
  ],
  '📊 Administración': [
    'Contabilidad',
    'Mantenimiento',
    'Pagar facturas',
    'Revisar emails',
    'Médico',
    'Banco'
  ]
};

/**
 * Guarda tareas en localStorage con manejo de errores
 */
export const saveTareas = (tareas: TareasPorDia): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.TAREAS, JSON.stringify(tareas));
  } catch (error) {
    console.error('Error guardando tareas:', error);
  }
};

/**
 * Carga tareas desde localStorage con manejo de errores
 */
export const loadTareas = (): TareasPorDia => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.TAREAS);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Validación básica del formato
      if (typeof parsed === 'object' && parsed !== null) {
        return parsed;
      }
    }
  } catch (error) {
    console.error('Error cargando tareas, usando datos vacíos:', error);
  }
  return {};
};

/**
 * Guarda sugeridas en localStorage con manejo de errores
 */
export const saveSugeridas = (sugeridas: Categorias): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.SUGERIDAS, JSON.stringify(sugeridas));
  } catch (error) {
    console.error('Error guardando sugeridas:', error);
  }
};

/**
 * Carga sugeridas desde localStorage con manejo de errores
 */
export const loadSugeridas = (): Categorias => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.SUGERIDAS);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Validación básica del formato
      if (typeof parsed === 'object' && parsed !== null) {
        return parsed;
      }
    }
  } catch (error) {
    console.error('Error cargando sugeridas, usando datos iniciales:', error);
  }
  return SUGERIDAS_INICIALES;
};

/**
 * Guarda estado de autenticación
 */
export const saveAuth = (isAuthenticated: boolean): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(isAuthenticated));
  } catch (error) {
    console.error('Error guardando auth:', error);
  }
};

/**
 * Carga estado de autenticación
 */
export const loadAuth = (): boolean => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.AUTH);
    if (stored) {
      return JSON.parse(stored) === true;
    }
  } catch (error) {
    console.error('Error cargando auth:', error);
  }
  return false;
};