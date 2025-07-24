// Interfaz para productos con SKU
export interface ProductSKU {
  sku: string;
  nombre: string;
}

export interface EquipmentReport {
  // Información básica
  fechaRecepcion: string;
  receptor: string;
  modelo: string;
  costo: number;
  numeroSerie: string;
  almacenamiento: '32GB' | '64GB' | '128GB' | '256GB' | '512GB' | '1TB';
  color: string;
  clasificacion: 'OB' | 'TI' | 'SE' | 'RE';
  productoSKU?: ProductSKU; // Producto seleccionado del CSV
  
  // Estado del equipo
  bateria: number;
  estadoChassis: string;
  estadoPantalla: string;
  
  // Componentes específicos
  parlantes: 'Perfecto' | 'Levemente Ronco' | 'Muy Ronco' | 'No suena';
  auricular: 'Perfecto' | 'Levemente Ronco' | 'Muy Ronco' | 'No suena';
  pinCarga: 'Perfecto' | 'Levemente Dañado' | 'Dañado';
  
  // Botones y funciones
  todosBotonesFuncionan: boolean;
  botonesIndividuales: {
    volumen: boolean;
    encendido: boolean;
    home: boolean;
    silencio: boolean;
  };
  
  faceId: 'Funciona' | 'No funciona';
  camara: 'Perfecto' | 'Manchas Imperceptibles' | 'Lente Roto' | 'Dañada';
  
  // Información adicional
  imagenes: File[];
  observaciones: string;
  
  // Metadatos del reporte
  codigoBarras: string;
  fechaGeneracion: string;
  tecnicoFirma?: string;
}

export interface FormErrors {
  [key: string]: string;
}

export interface FormProgress {
  completedFields: number;
  totalFields: number;
  percentage: number;
}