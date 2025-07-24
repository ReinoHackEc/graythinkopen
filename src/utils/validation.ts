import { EquipmentReport } from '../types/Equipment';

export const validateField = (field: string, value: any): string => {
  switch (field) {
    case 'fechaRecepcion':
      if (!value) return 'La fecha de recepción es requerida';
      break;
    case 'receptor':
      if (!value?.trim()) return 'El receptor es requerido';
      break;
    case 'modelo':
      if (!value?.trim()) return 'El modelo del equipo es requerido';
      break;
    case 'costo':
      if (!value || value <= 0) return 'El costo debe ser mayor a 0';
      break;
    case 'numeroSerie':
      if (!value?.trim()) return 'El número de serie es requerido';
      break;
    case 'almacenamiento':
      if (!value) return 'El almacenamiento es requerido';
      break;
    case 'color':
      if (!value?.trim()) return 'El color del equipo es requerido';
      break;
    case 'clasificacion':
      if (!value) return 'La clasificación es requerida';
      break;
    case 'productoSKU':
      // El producto SKU es opcional, solo validar si hay productos cargados
      break;
    case 'bateria':
      if (value === undefined || value === null || value < 0 || value > 100) return 'La batería debe estar entre 0 y 100%';
      break;
    case 'estadoChassis':
      if (!value?.trim()) return 'El estado del chassis es requerido';
      break;
    case 'estadoPantalla':
      if (!value?.trim()) return 'El estado de la pantalla es requerido';
      break;
  }
  return '';
};

export const validateForm = (report: Partial<EquipmentReport>): string[] => {
  const errors: string[] = [];
  
  const requiredFields = [
    'fechaRecepcion', 'receptor', 'modelo', 'costo', 'numeroSerie',
    'almacenamiento', 'color', 'clasificacion', 'estadoChassis', 'estadoPantalla'
  ];
  
  requiredFields.forEach(field => {
    const error = validateField(field, (report as any)[field]);
    if (error) errors.push(error);
  });
  
  return errors;
};

export const calculateProgress = (report: Partial<EquipmentReport>, hasProductsLoaded: boolean = false) => {
  // Total de campos: 19 base + 1 opcional de producto SKU si hay productos cargados
  const totalFields = hasProductsLoaded ? 20 : 19;
  let completedFields = 0;
  
  if (report.fechaRecepcion) completedFields++;
  if (report.receptor?.trim()) completedFields++;
  if (report.modelo?.trim()) completedFields++;
  if (report.costo && report.costo > 0) completedFields++;
  if (report.numeroSerie?.trim()) completedFields++;
  if (report.almacenamiento) completedFields++;
  if (report.color?.trim()) completedFields++;
  if (report.clasificacion) completedFields++;
  if (report.bateria !== undefined && report.bateria !== null) completedFields++;
  if (report.estadoChassis?.trim()) completedFields++;
  if (report.estadoPantalla?.trim()) completedFields++;
  if (report.parlantes) completedFields++;
  if (report.auricular) completedFields++;
  if (report.pinCarga) completedFields++;
  if (report.todosBotonesFuncionan !== undefined || Object.values(report.botonesIndividuales || {}).some(v => v)) completedFields++;
  if (report.faceId) completedFields++;
  if (report.camara) completedFields++;
  if (report.imagenes && report.imagenes.length > 0) completedFields++;
  if (report.observaciones?.trim()) completedFields++;
  
  // Campo opcional de producto SKU (solo cuenta si hay productos cargados)
  if (hasProductsLoaded && report.productoSKU) completedFields++;
  
  return {
    completedFields,
    totalFields,
    percentage: Math.round((completedFields / totalFields) * 100)
  };
};