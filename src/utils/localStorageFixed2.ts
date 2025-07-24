import { EquipmentReport } from '../types/Equipment';

// SOLUCIÓN ULTRA-ROBUSTA PARA LOCALSTORAGE
// Esta versión garantiza funcionamiento completo

interface EquipmentDatabase {
  equipments: EquipmentReport[];
  lastUpdated: string;
  version: string;
}

class UltraRobustLocalStorage {
  private readonly STORAGE_KEY = 'gray_think_equipments_v2';
  private readonly VERSION = '2.0.0';
  private cache: EquipmentDatabase | null = null;
  
  constructor() {
    console.log('🔧 [ULTRA-FIXED] Inicializando LocalStorage Manager v2.0');
    this.initializeStorage();
  }
  
  private initializeStorage(): void {
    try {
      // Verificar disponibilidad
      if (!this.isStorageAvailable()) {
        console.warn('⚠️ localStorage no disponible, usando memoria temporal');
        this.cache = this.createDefaultDatabase();
        return;
      }
      
      // Limpiar datos antiguos si existen
      this.migrateOldData();
      
      // Cargar o crear datos
      this.loadFromStorage();
      
    } catch (error) {
      console.error('❌ Error inicializando storage:', error);
      this.cache = this.createDefaultDatabase();
    }
  }
  
  private isStorageAvailable(): boolean {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }
  
  private migrateOldData(): void {
    try {
      // Migrar datos de versiones anteriores
      const oldKeys = ['gray_think_equipments', 'equipment_reports'];
      
      for (const oldKey of oldKeys) {
        const oldData = localStorage.getItem(oldKey);
        if (oldData) {
          console.log(`🔄 Migrando datos de ${oldKey}`);
          try {
            const parsed = JSON.parse(oldData);
            if (Array.isArray(parsed)) {
              // Datos directos como array
              const database: EquipmentDatabase = {
                equipments: parsed,
                lastUpdated: new Date().toISOString(),
                version: this.VERSION
              };
              localStorage.setItem(this.STORAGE_KEY, JSON.stringify(database));
            } else if (parsed.equipments) {
              // Datos con estructura de database
              parsed.version = this.VERSION;
              localStorage.setItem(this.STORAGE_KEY, JSON.stringify(parsed));
            }
          } catch (e) {
            console.warn(`⚠️ No se pudo migrar ${oldKey}:`, e);
          }
          
          // Limpiar datos antiguos
          localStorage.removeItem(oldKey);
        }
      }
    } catch (error) {
      console.warn('⚠️ Error en migración:', error);
    }
  }
  
  private createDefaultDatabase(): EquipmentDatabase {
    console.log('📋 [ULTRA-FIXED] Creando base de datos por defecto');
    return {
      equipments: [],
      lastUpdated: new Date().toISOString(),
      version: this.VERSION
    };
  }
  
  private loadFromStorage(): void {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      
      if (!data) {
        console.log('📋 No hay datos existentes, creando nueva base');
        this.cache = this.createDefaultDatabase();
        this.saveToStorage();
        return;
      }
      
      const parsed: EquipmentDatabase = JSON.parse(data);
      
      // Validar estructura
      if (!parsed.equipments || !Array.isArray(parsed.equipments)) {
        console.warn('⚠️ Estructura inválida, recreando...');
        this.cache = this.createDefaultDatabase();
        this.saveToStorage();
        return;
      }
      
      // Actualizar versión si es necesaria
      if (parsed.version !== this.VERSION) {
        parsed.version = this.VERSION;
        parsed.lastUpdated = new Date().toISOString();
      }
      
      this.cache = parsed;
      console.log(`📋 [ULTRA-FIXED] Datos cargados: ${this.cache.equipments.length} equipos`);
      
    } catch (error) {
      console.error('❌ Error cargando datos:', error);
      this.cache = this.createDefaultDatabase();
      this.saveToStorage();
    }
  }
  
  private saveToStorage(): boolean {
    if (!this.cache) {
      console.error('❌ No hay cache para guardar');
      return false;
    }
    
    try {
      if (!this.isStorageAvailable()) {
        console.warn('⚠️ Storage no disponible, solo en memoria');
        return false;
      }
      
      this.cache.lastUpdated = new Date().toISOString();
      const serialized = JSON.stringify(this.cache);
      
      localStorage.setItem(this.STORAGE_KEY, serialized);
      console.log(`💾 [ULTRA-FIXED] Datos guardados: ${this.cache.equipments.length} equipos`);
      
      // Verificar que se guardó correctamente
      const verification = localStorage.getItem(this.STORAGE_KEY);
      if (!verification) {
        throw new Error('Verificación de guardado falló');
      }
      
      return true;
      
    } catch (error) {
      console.error('❌ Error guardando datos:', error);
      return false;
    }
  }
  
  // API Pública
  saveEquipment(report: EquipmentReport): boolean {
    try {
      console.log(`💾 [ULTRA-FIXED] Guardando equipo: ${report.modelo || 'Sin modelo'}`);
      
      if (!this.cache) {
        console.error('❌ Cache no inicializado');
        return false;
      }
      
      // Buscar si ya existe
      const existingIndex = this.cache.equipments.findIndex(
        eq => eq.codigoBarras === report.codigoBarras
      );
      
      if (existingIndex >= 0) {
        // Actualizar existente
        this.cache.equipments[existingIndex] = { ...report };
        console.log('🔄 [ULTRA-FIXED] Equipo actualizado');
      } else {
        // Agregar nuevo
        this.cache.equipments.push({ ...report });
        console.log('➕ [ULTRA-FIXED] Nuevo equipo agregado');
      }
      
      // Guardar inmediatamente
      const success = this.saveToStorage();
      
      if (success) {
        console.log(`✅ [ULTRA-FIXED] Guardado exitoso. Total: ${this.cache.equipments.length}`);
        
        // Disparar evento
        try {
          window.dispatchEvent(new CustomEvent('equipmentSaved', {
            detail: { equipment: report, total: this.cache.equipments.length }
          }));
        } catch (e) {
          console.warn('⚠️ Error disparando evento:', e);
        }
      }
      
      return success;
      
    } catch (error) {
      console.error('❌ [ULTRA-FIXED] Error guardando equipo:', error);
      return false;
    }
  }
  
  loadEquipments(): EquipmentReport[] {
    try {
      if (!this.cache) {
        console.log('🔄 Cache no disponible, recargando...');
        this.loadFromStorage();
      }
      
      const equipments = this.cache?.equipments || [];
      console.log(`📋 [ULTRA-FIXED] Cargando ${equipments.length} equipos`);
      
      return [...equipments]; // Retornar copia para evitar mutaciones
      
    } catch (error) {
      console.error('❌ Error cargando equipos:', error);
      return [];
    }
  }
  
  searchEquipments(query: string, searchBy: string = 'all'): EquipmentReport[] {
    try {
      const equipments = this.loadEquipments();
      
      if (!query?.trim()) {
        return equipments;
      }
      
      const searchTerm = query.toLowerCase().trim();
      
      return equipments.filter(equipment => {
        switch (searchBy) {
          case 'modelo':
            return equipment.modelo?.toLowerCase().includes(searchTerm);
          case 'receptor':
            return equipment.receptor?.toLowerCase().includes(searchTerm);
          case 'numeroSerie':
            return equipment.numeroSerie?.toLowerCase().includes(searchTerm);
          case 'codigoBarras':
            return equipment.codigoBarras?.toLowerCase().includes(searchTerm);
          default:
            return (
              equipment.modelo?.toLowerCase().includes(searchTerm) ||
              equipment.receptor?.toLowerCase().includes(searchTerm) ||
              equipment.numeroSerie?.toLowerCase().includes(searchTerm) ||
              equipment.codigoBarras?.toLowerCase().includes(searchTerm) ||
              equipment.clasificacion?.toLowerCase().includes(searchTerm)
            );
        }
      });
    } catch (error) {
      console.error('❌ Error en búsqueda:', error);
      return [];
    }
  }
  
  deleteEquipment(codigoBarras: string): boolean {
    try {
      if (!this.cache) {
        this.loadFromStorage();
      }
      
      if (!this.cache) {
        return false;
      }
      
      const initialLength = this.cache.equipments.length;
      this.cache.equipments = this.cache.equipments.filter(
        equipment => equipment.codigoBarras !== codigoBarras
      );
      
      if (this.cache.equipments.length < initialLength) {
        const success = this.saveToStorage();
        console.log('🗑️ [ULTRA-FIXED] Equipo eliminado');
        return success;
      }
      
      return false;
      
    } catch (error) {
      console.error('❌ Error eliminando equipo:', error);
      return false;
    }
  }
  
  clearDatabase(): boolean {
    try {
      this.cache = this.createDefaultDatabase();
      const success = this.saveToStorage();
      console.log('🗑️ [ULTRA-FIXED] Base de datos limpiada');
      return success;
    } catch (error) {
      console.error('❌ Error limpiando base de datos:', error);
      return false;
    }
  }
  
  getDatabaseStats(): { totalEquipments: number; lastUpdated: string; version: string } {
    if (!this.cache) {
      this.loadFromStorage();
    }
    
    return {
      totalEquipments: this.cache?.equipments.length || 0,
      lastUpdated: this.cache?.lastUpdated || new Date().toISOString(),
      version: this.cache?.version || this.VERSION
    };
  }
  
  // Método para debugging
  debugInfo(): void {
    console.log('🔍 [DEBUG] Storage Info:', {
      key: this.STORAGE_KEY,
      version: this.VERSION,
      cache: this.cache,
      storageAvailable: this.isStorageAvailable(),
      storageData: localStorage.getItem(this.STORAGE_KEY)
    });
  }
}

// Instancia singleton
const ultraStorage = new UltraRobustLocalStorage();

// Funciones exportadas
export const saveEquipmentToDatabase = (report: EquipmentReport): boolean => {
  console.log('🚀 [EXPORT] Iniciando guardado...');
  const result = ultraStorage.saveEquipment(report);
  console.log(`${result ? '✅' : '❌'} [EXPORT] Resultado del guardado:`, result);
  return result;
};

export const loadEquipmentDatabase = (): EquipmentReport[] => {
  return ultraStorage.loadEquipments();
};

export const searchEquipments = (query: string, searchBy: string = 'all'): EquipmentReport[] => {
  return ultraStorage.searchEquipments(query, searchBy);
};

export const deleteEquipmentFromDatabase = (codigoBarras: string): boolean => {
  return ultraStorage.deleteEquipment(codigoBarras);
};

export const clearEquipmentDatabase = (): void => {
  ultraStorage.clearDatabase();
};

export const getDatabaseStats = () => {
  return ultraStorage.getDatabaseStats();
};

export const debugStorage = () => {
  ultraStorage.debugInfo();
};

export default ultraStorage;
