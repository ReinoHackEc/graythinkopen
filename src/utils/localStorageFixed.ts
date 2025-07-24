import { EquipmentReport } from '../types/Equipment';

// SOLUCIÓN ROBUSTA PARA LOCALSTORAGE
// Implementación mejorada con validación y recuperación de errores

interface EquipmentDatabase {
  equipments: EquipmentReport[];
  lastUpdated: string;
  version: string;
}

class LocalStorageManager {
  private readonly STORAGE_KEY = 'gray_think_equipments';
  private readonly VERSION = '1.0.0';
  
  // Verificar si localStorage está disponible
  private isLocalStorageAvailable(): boolean {
    try {
      const test = '__localStorage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      console.warn('localStorage no disponible:', e);
      return false;
    }
  }
  
  // Limpiar datos corruptos
  private cleanCorruptedData(): void {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (data) {
        JSON.parse(data); // Verificar si es JSON válido
      }
    } catch (error) {
      console.warn('Datos corruptos detectados, limpiando...', error);
      localStorage.removeItem(this.STORAGE_KEY);
    }
  }
  
  // Crear estructura de base de datos por defecto
  private createDefaultDatabase(): EquipmentDatabase {
    return {
      equipments: [],
      lastUpdated: new Date().toISOString(),
      version: this.VERSION
    };
  }
  
  // Guardar equipo
  saveEquipment(report: EquipmentReport): boolean {
    if (!this.isLocalStorageAvailable()) {
      console.error('localStorage no disponible');
      return false;
    }
    
    try {
      console.log('💾 Guardando equipo:', report.modelo);
      
      // Limpiar datos corruptos
      this.cleanCorruptedData();
      
      // Cargar base de datos actual
      const database = this.loadDatabase();
      
      // Verificar si ya existe (actualizar) o crear nuevo
      const existingIndex = database.equipments.findIndex(
        eq => eq.codigoBarras === report.codigoBarras
      );
      
      if (existingIndex >= 0) {
        database.equipments[existingIndex] = report;
        console.log('🔄 Equipo actualizado');
      } else {
        database.equipments.push(report);
        console.log('➕ Nuevo equipo agregado');
      }
      
      // Actualizar timestamp
      database.lastUpdated = new Date().toISOString();
      
      // Guardar en localStorage
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(database));
      
      console.log(`✅ Base de datos guardada. Total equipos: ${database.equipments.length}`);
      return true;
      
    } catch (error) {
      console.error('❌ Error guardando equipo:', error);
      return false;
    }
  }
  
  // Cargar base de datos
  loadDatabase(): EquipmentDatabase {
    if (!this.isLocalStorageAvailable()) {
      return this.createDefaultDatabase();
    }
    
    try {
      this.cleanCorruptedData();
      
      const data = localStorage.getItem(this.STORAGE_KEY);
      
      if (!data) {
        console.log('📋 Creando nueva base de datos');
        return this.createDefaultDatabase();
      }
      
      const database: EquipmentDatabase = JSON.parse(data);
      
      // Validar estructura
      if (!database.equipments || !Array.isArray(database.equipments)) {
        console.warn('🔄 Estructura inválida, recreando...');
        return this.createDefaultDatabase();
      }
      
      console.log(`📋 Base de datos cargada. Equipos: ${database.equipments.length}`);
      return database;
      
    } catch (error) {
      console.error('❌ Error cargando base de datos:', error);
      return this.createDefaultDatabase();
    }
  }
  
  // Buscar equipos
  searchEquipments(query: string, searchBy: string = 'all'): EquipmentReport[] {
    try {
      const database = this.loadDatabase();
      
      if (!query.trim()) {
        return database.equipments;
      }
      
      const searchTerm = query.toLowerCase().trim();
      
      return database.equipments.filter(equipment => {
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
      console.error('Error en búsqueda:', error);
      return [];
    }
  }
  
  // Eliminar equipo
  deleteEquipment(codigoBarras: string): boolean {
    try {
      const database = this.loadDatabase();
      const initialLength = database.equipments.length;
      
      database.equipments = database.equipments.filter(
        equipment => equipment.codigoBarras !== codigoBarras
      );
      
      if (database.equipments.length < initialLength) {
        database.lastUpdated = new Date().toISOString();
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(database));
        console.log('✅ Equipo eliminado exitosamente');
        return true;
      }
      
      return false;
      
    } catch (error) {
      console.error('Error eliminando equipo:', error);
      return false;
    }
  }
  
  // Limpiar toda la base de datos
  clearDatabase(): boolean {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      console.log('🗑️ Base de datos limpiada');
      return true;
    } catch (error) {
      console.error('Error limpiando base de datos:', error);
      return false;
    }
  }
  
  // Obtener estadísticas
  getDatabaseStats(): { totalEquipments: number; lastUpdated: string; version: string } {
    const database = this.loadDatabase();
    return {
      totalEquipments: database.equipments.length,
      lastUpdated: database.lastUpdated,
      version: database.version
    };
  }
}

// Instancia singleton
const storageManager = new LocalStorageManager();

// Funciones exportadas mejoradas
export const saveEquipmentToDatabase = (report: EquipmentReport): boolean => {
  try {
    console.log('🚀 Iniciando guardado de equipo...');
    const success = storageManager.saveEquipment(report);
    
    if (success) {
      console.log('✅ Equipo guardado exitosamente en base de datos');
      
      // Disparar evento personalizado para notificar cambios
      window.dispatchEvent(new CustomEvent('equipmentSaved', { 
        detail: { equipment: report } 
      }));
    } else {
      console.error('❌ Error guardando equipo');
    }
    
    return success;
  } catch (error) {
    console.error('❌ Error crítico guardando equipo:', error);
    return false;
  }
};

export const loadEquipmentDatabase = (): EquipmentReport[] => {
  try {
    const database = storageManager.loadDatabase();
    return database.equipments;
  } catch (error) {
    console.error('Error cargando equipos:', error);
    return [];
  }
};

export const searchEquipments = (query: string, searchBy: string = 'all'): EquipmentReport[] => {
  return storageManager.searchEquipments(query, searchBy);
};

export const deleteEquipmentFromDatabase = (codigoBarras: string): boolean => {
  return storageManager.deleteEquipment(codigoBarras);
};

export const clearEquipmentDatabase = (): void => {
  storageManager.clearDatabase();
};

export const getDatabaseStats = () => {
  return storageManager.getDatabaseStats();
};

export default storageManager;
