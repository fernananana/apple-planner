import { TareasPorDia, Categorias, Tarea } from '@/types';

// Configuración de IndexedDB
const DB_NAME = 'FamiliaCalendarioDB';
const DB_VERSION = 1;

// Nombres de los almacenes (tablas)
const STORES = {
  TAREAS: 'tareas',
  SUGERIDAS: 'sugeridas',
  AUTH: 'auth',
  HISTORIAL: 'historial',
} as const;

// Inicializar la base de datos
export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Crear almacén de tareas si no existe
      if (!db.objectStoreNames.contains(STORES.TAREAS)) {
        const tareasStore = db.createObjectStore(STORES.TAREAS, { 
          keyPath: 'id' 
        });
        tareasStore.createIndex('fecha', 'fecha', { unique: false });
        tareasStore.createIndex('miembro', 'miembro', { unique: false });
        tareasStore.createIndex('completada', 'completada', { unique: false });
        tareasStore.createIndex('categoria', 'categoria', { unique: false });
        tareasStore.createIndex('recurrencia', 'recurrencia', { unique: false });
      }

      // Crear almacén de tareas sugeridas
      if (!db.objectStoreNames.contains(STORES.SUGERIDAS)) {
        const sugeridasStore = db.createObjectStore(STORES.SUGERIDAS, {
          keyPath: 'id',
          autoIncrement: true
        });
        sugeridasStore.createIndex('categoria', 'categoria', { unique: false });
      }

      // Crear almacén de autenticación
      if (!db.objectStoreNames.contains(STORES.AUTH)) {
        db.createObjectStore(STORES.AUTH, { keyPath: 'key' });
      }

      // Crear almacén de historial de cambios
      if (!db.objectStoreNames.contains(STORES.HISTORIAL)) {
        const historialStore = db.createObjectStore(STORES.HISTORIAL, {
          keyPath: 'id',
          autoIncrement: true
        });
        historialStore.createIndex('timestamp', 'timestamp', { unique: false });
        historialStore.createIndex('tipo', 'tipo', { unique: false });
      }
    };
  });
};

// Operaciones de Tareas
export const saveTarea = async (tarea: Tarea): Promise<void> => {
  const db = await initDB();
  const transaction = db.transaction(STORES.TAREAS, 'readwrite');
  const store = transaction.objectStore(STORES.TAREAS);
  
  await store.put(tarea);
  
  // Registrar en el historial
  await registrarHistorial('tarea_guardada', tarea);
};

export const getTareas = async (): Promise<Tarea[]> => {
  const db = await initDB();
  const transaction = db.transaction(STORES.TAREAS, 'readonly');
  const store = transaction.objectStore(STORES.TAREAS);
  
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const getTareasPorDia = async (): Promise<TareasPorDia> => {
  const tareas = await getTareas();
  const tareasPorDia: TareasPorDia = {};
  
  tareas.forEach(tarea => {
    if (tarea.fecha) {
      const fecha = new Date(tarea.fecha);
      const dia = fecha.getDate();
      
      if (!tareasPorDia[dia]) {
        tareasPorDia[dia] = [];
      }
      tareasPorDia[dia].push(tarea);
    }
  });
  
  return tareasPorDia;
};

export const getTareasByMes = async (mes: number, año: number): Promise<Tarea[]> => {
  const db = await initDB();
  const transaction = db.transaction(STORES.TAREAS, 'readonly');
  const store = transaction.objectStore(STORES.TAREAS);
  
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => {
      const tareas = request.result.filter((tarea: Tarea) => {
        if (!tarea.fecha) return false;
        const fecha = new Date(tarea.fecha);
        return fecha.getMonth() === mes && fecha.getFullYear() === año;
      });
      resolve(tareas);
    };
    request.onerror = () => reject(request.error);
  });
};

export const getTareasByMiembro = async (miembro: string): Promise<Tarea[]> => {
  const db = await initDB();
  const transaction = db.transaction(STORES.TAREAS, 'readonly');
  const store = transaction.objectStore(STORES.TAREAS);
  const index = store.index('miembro');
  
  return new Promise((resolve, reject) => {
    const request = index.getAll(miembro);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const deleteTarea = async (id: string): Promise<void> => {
  const db = await initDB();
  const transaction = db.transaction(STORES.TAREAS, 'readwrite');
  const store = transaction.objectStore(STORES.TAREAS);
  
  // Obtener la tarea antes de eliminarla para el historial
  const tarea = await new Promise<Tarea>((resolve, reject) => {
    const request = store.get(id);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  
  await store.delete(id);
  
  // Registrar en el historial
  await registrarHistorial('tarea_eliminada', tarea);
};

export const deleteAllTareas = async (): Promise<void> => {
  const db = await initDB();
  const transaction = db.transaction(STORES.TAREAS, 'readwrite');
  const store = transaction.objectStore(STORES.TAREAS);
  
  await store.clear();
  await registrarHistorial('todas_tareas_eliminadas', null);
};

// Operaciones de Tareas Sugeridas
export const saveSugerida = async (categoria: string, texto: string): Promise<void> => {
  const db = await initDB();
  const transaction = db.transaction(STORES.SUGERIDAS, 'readwrite');
  const store = transaction.objectStore(STORES.SUGERIDAS);
  
  await store.add({ categoria, texto });
};

export const getSugeridas = async (): Promise<Categorias> => {
  const db = await initDB();
  const transaction = db.transaction(STORES.SUGERIDAS, 'readonly');
  const store = transaction.objectStore(STORES.SUGERIDAS);
  
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => {
      const categorias: Categorias = {};
      request.result.forEach((item: { categoria: string; texto: string }) => {
        if (!categorias[item.categoria]) {
          categorias[item.categoria] = [];
        }
        categorias[item.categoria].push(item.texto);
      });
      resolve(categorias);
    };
    request.onerror = () => reject(request.error);
  });
};

export const deleteSugerida = async (categoria: string, texto: string): Promise<void> => {
  const db = await initDB();
  const transaction = db.transaction(STORES.SUGERIDAS, 'readwrite');
  const store = transaction.objectStore(STORES.SUGERIDAS);
  const index = store.index('categoria');
  
  return new Promise((resolve, reject) => {
    const request = index.openCursor(IDBKeyRange.only(categoria));
    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result;
      if (cursor) {
        if (cursor.value.texto === texto) {
          cursor.delete();
          resolve();
        } else {
          cursor.continue();
        }
      } else {
        resolve();
      }
    };
    request.onerror = () => reject(request.error);
  });
};

export const updateSugeridas = async (categorias: Categorias): Promise<void> => {
  const db = await initDB();
  const transaction = db.transaction(STORES.SUGERIDAS, 'readwrite');
  const store = transaction.objectStore(STORES.SUGERIDAS);
  
  // Limpiar todas las sugeridas
  await store.clear();
  
  // Agregar las nuevas
  for (const [categoria, textos] of Object.entries(categorias)) {
    for (const texto of textos) {
      await store.add({ categoria, texto });
    }
  }
};

// Operaciones de Autenticación
export const saveAuth = async (isAuthenticated: boolean): Promise<void> => {
  const db = await initDB();
  const transaction = db.transaction(STORES.AUTH, 'readwrite');
  const store = transaction.objectStore(STORES.AUTH);
  
  await store.put({ key: 'isAuthenticated', value: isAuthenticated });
};

export const getAuth = async (): Promise<boolean> => {
  const db = await initDB();
  const transaction = db.transaction(STORES.AUTH, 'readonly');
  const store = transaction.objectStore(STORES.AUTH);
  
  return new Promise((resolve, reject) => {
    const request = store.get('isAuthenticated');
    request.onsuccess = () => resolve(request.result?.value || false);
    request.onerror = () => reject(request.error);
  });
};

// Operaciones de Historial
interface HistorialEntry {
  id?: number;
  tipo: string;
  datos: any;
  timestamp: string;
}

export const registrarHistorial = async (tipo: string, datos: any): Promise<void> => {
  const db = await initDB();
  const transaction = db.transaction(STORES.HISTORIAL, 'readwrite');
  const store = transaction.objectStore(STORES.HISTORIAL);
  
  const entry: HistorialEntry = {
    tipo,
    datos,
    timestamp: new Date().toISOString()
  };
  
  await store.add(entry);
};

export const getHistorial = async (limit?: number): Promise<HistorialEntry[]> => {
  const db = await initDB();
  const transaction = db.transaction(STORES.HISTORIAL, 'readonly');
  const store = transaction.objectStore(STORES.HISTORIAL);
  const index = store.index('timestamp');
  
  return new Promise((resolve, reject) => {
    const request = index.openCursor(null, 'prev');
    const results: HistorialEntry[] = [];
    let count = 0;
    
    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result;
      if (cursor && (!limit || count < limit)) {
        results.push(cursor.value);
        count++;
        cursor.continue();
      } else {
        resolve(results);
      }
    };
    request.onerror = () => reject(request.error);
  });
};

// Exportar e Importar datos
export const exportarDatos = async () => {
  const tareas = await getTareas();
  const sugeridas = await getSugeridas();
  
  return {
    tareas,
    sugeridas,
    version: DB_VERSION,
    exportDate: new Date().toISOString()
  };
};

export const importarDatos = async (datos: any): Promise<void> => {
  const db = await initDB();
  
  // Importar tareas
  if (datos.tareas) {
    const transaction = db.transaction(STORES.TAREAS, 'readwrite');
    const store = transaction.objectStore(STORES.TAREAS);
    await store.clear();
    
    for (const tarea of datos.tareas) {
      await store.add(tarea);
    }
  }
  
  // Importar sugeridas
  if (datos.sugeridas) {
    await updateSugeridas(datos.sugeridas);
  }
  
  await registrarHistorial('datos_importados', { count: datos.tareas?.length || 0 });
};

// Estadísticas
export const getEstadisticas = async () => {
  const tareas = await getTareas();
  
  const totalTareas = tareas.length;
  const tareasCompletadas = tareas.filter(t => t.completada).length;
  const tareasPendientes = tareas.filter(t => !t.completada).length;
  
  const porMiembro = tareas.reduce((acc, tarea) => {
    if (!acc[tarea.miembro]) {
      acc[tarea.miembro] = { total: 0, completadas: 0 };
    }
    acc[tarea.miembro].total++;
    if (tarea.completada) {
      acc[tarea.miembro].completadas++;
    }
    return acc;
  }, {} as Record<string, { total: number; completadas: number }>);
  
  const porCategoria = tareas.reduce((acc, tarea) => {
    const categoria = tarea.categoria || 'Sin categoría';
    if (!acc[categoria]) {
      acc[categoria] = { total: 0, completadas: 0 };
    }
    acc[categoria].total++;
    if (tarea.completada) {
      acc[categoria].completadas++;
    }
    return acc;
  }, {} as Record<string, { total: number; completadas: number }>);
  
  return {
    totalTareas,
    tareasCompletadas,
    tareasPendientes,
    porMiembro,
    porCategoria,
    porcentajeCompletado: totalTareas > 0 ? Math.round((tareasCompletadas / totalTareas) * 100) : 0
  };
};

// Búsqueda avanzada
export const buscarTareas = async (query: string): Promise<Tarea[]> => {
  const tareas = await getTareas();
  const queryLower = query.toLowerCase();
  
  return tareas.filter(tarea => 
    tarea.texto.toLowerCase().includes(queryLower) ||
    tarea.notas?.toLowerCase().includes(queryLower) ||
    tarea.categoria?.toLowerCase().includes(queryLower)
  );
};
