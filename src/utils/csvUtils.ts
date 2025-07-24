import { ProductSKU } from '../types/Equipment';

// Validar estructura básica del CSV
export const validateCSVStructure = (csvText: string): { isValid: boolean; error?: string } => {
  const lines = csvText.trim().split('\n');
  
  if (lines.length < 2) {
    return { isValid: false, error: 'El archivo CSV debe contener al menos una fila de encabezados y una fila de datos' };
  }

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  if (headers.length !== 2 || !headers.includes('sku') || !headers.includes('nombre')) {
    return { isValid: false, error: 'El archivo CSV debe tener exactamente 2 columnas: SKU, Nombre' };
  }

  return { isValid: true };
};

// Parsear CSV con manejo robusto de errores
export const parseCSVRobust = (csvText: string): {
  products: ProductSKU[];
  duplicates: number;
  errors: string[];
  totalLines: number;
} => {
  const lines = csvText.trim().split('\n');
  const products: ProductSKU[] = [];
  const seenSKUs = new Set<string>();
  const errors: string[] = [];
  let duplicates = 0;
  
  // Comenzar desde la línea 1 (saltar header)
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Saltar líneas vacías
    if (!line) continue;
    
    const values = line.split(',');
    
    if (values.length !== 2) {
      errors.push(`Línea ${i + 1}: debe tener exactamente 2 valores separados por coma`);
      continue;
    }

    const sku = values[0].trim();
    const nombre = values[1].trim();

    // Validación de campos vacíos
    if (!sku || !nombre) {
      errors.push(`Línea ${i + 1}: SKU y Nombre no pueden estar vacíos`);
      continue;
    }

    // Validación flexible de SKU
    if (sku.length < 1 || sku.length > 50) {
      errors.push(`Línea ${i + 1}: SKU '${sku}' debe tener entre 1 y 50 caracteres`);
      continue;
    }

    // Manejo de duplicados
    if (seenSKUs.has(sku)) {
      duplicates++;
      continue; // Saltar duplicados
    }

    seenSKUs.add(sku);
    products.push({ sku, nombre });
  }

  return {
    products,
    duplicates,
    errors,
    totalLines: lines.length - 1 // Excluir header
  };
};

// Generar CSV de ejemplo más completo
export const generateExampleCSV = (): string => {
  return `SKU,Nombre
5674632524,iPhone 15 128GB Black
865457346,iPad mini 7
796865374635,MacBook Pro 2015
123456789,Samsung Galaxy S24
987654321,Dell XPS 13
456789123,Sony WH-1000XM5
789123456,Nintendo Switch OLED
321654987,Microsoft Surface Pro 9
654987321,AirPods Pro 2
147258369,Xiaomi Mi 13 Pro
ABC123,Producto Especial A
1,Producto Simple
XYZ999888777,Producto Largo
555,Tablet Genérica
ALPHA001,Monitor 4K
BETA002,Teclado Mecánico
GAMMA003,Mouse Gaming
DELTA004,Webcam HD
EPSILON005,Micrófono USB
ZETA006,Altavoces Bluetooth`;
};

// Descargar archivo CSV
export const downloadCSV = (content: string, filename: string) => {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

// Hook para el almacenamiento local
export const useProductStorage = () => {
  const STORAGE_KEY = 'equipment-products-sku';
  
  const saveProducts = (products: ProductSKU[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    } catch (error) {
      console.error('Error guardando productos en localStorage:', error);
    }
  };
  
  const loadProducts = (): ProductSKU[] => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error cargando productos de localStorage:', error);
      return [];
    }
  };
  
  const clearProducts = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error limpiando productos de localStorage:', error);
    }
  };
  
  return { saveProducts, loadProducts, clearProducts };
};

// Función para validar SKU individual
export const validateSKU = (sku: string): { isValid: boolean; error?: string } => {
  if (!sku || sku.trim().length === 0) {
    return { isValid: false, error: 'SKU no puede estar vacío' };
  }
  
  const trimmedSKU = sku.trim();
  
  if (trimmedSKU.length < 1 || trimmedSKU.length > 50) {
    return { isValid: false, error: 'SKU debe tener entre 1 y 50 caracteres' };
  }
  
  // Permitir caracteres alfanuméricos y algunos especiales comunes
  if (!/^[a-zA-Z0-9_\-\.]+$/.test(trimmedSKU)) {
    return { isValid: false, error: 'SKU solo puede contener letras, números, guiones, puntos y guiones bajos' };
  }
  
  return { isValid: true };
};

// Función para obtener estadísticas del CSV
export const getCSVStats = (csvText: string): {
  totalLines: number;
  headerValid: boolean;
  estimatedProducts: number;
} => {
  const lines = csvText.trim().split('\n');
  const headers = lines[0]?.split(',').map(h => h.trim().toLowerCase()) || [];
  
  return {
    totalLines: lines.length,
    headerValid: headers.length === 2 && headers.includes('sku') && headers.includes('nombre'),
    estimatedProducts: Math.max(0, lines.length - 1)
  };
};