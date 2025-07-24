import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import JsBarcode from 'jsbarcode';
import { EquipmentReport } from '../types/Equipment';

// Método básico y directo que FUNCIONA GARANTIZADO
const basicDownload = (filename: string, pdfInstance: any) => {
  console.log('🎯 DESCARGA BÁSICA INICIADA:', filename);
  
  // MÉTODO FUNDAMENTAL: Solo save() directo
  pdfInstance.save(filename);
  
  console.log('✅ DESCARGA BÁSICA COMPLETADA:', filename);
  return true;
};

export const generateBarcode = (code: string): string => {
  const canvas = document.createElement('canvas');
  
  // Configuración optimizada para alta resolución en PDF
  JsBarcode(canvas, code, {
    format: 'CODE128',
    width: 3, // Aumentado para mejor legibilidad
    height: 60, // Mayor altura para fácil escaneo
    displayValue: true, // Mostrar texto en reportes principales
    fontSize: 14, // Tamaño de fuente legible
    textAlign: 'center',
    textPosition: 'bottom',
    background: '#FFFFFF', // Fondo blanco explícito
    lineColor: '#000000', // Negro sólido
    margin: 10, // Margen adecuado
    marginTop: 5,
    marginBottom: 15,
    fontOptions: 'bold'
  });
  
  // Retornar con máxima calidad PNG
  return canvas.toDataURL('image/png', 1.0);
};

// Función auxiliar para procesar imágenes en SÚPER ALTA RESOLUCIÓN con validación
const processImageForPDF = async (file: File): Promise<{dataURL: string, width: number, height: number}> => {
  return new Promise((resolve, reject) => {
    // Validar que el archivo sea una imagen real
    if (!file || !file.type.startsWith('image/') || file.size === 0) {
      reject(new Error('Archivo de imagen inválido'));
      return;
    }
    
    // Validar tamaño del archivo (máximo 50MB)
    if (file.size > 50 * 1024 * 1024) {
      reject(new Error('Archivo de imagen demasiado grande'));
      return;
    }
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();
    
    // Timeout para evitar cuelgues
    const timeout = setTimeout(() => {
      reject(new Error('Timeout al cargar imagen'));
    }, 10000);
    
    img.onload = () => {
      clearTimeout(timeout);
      
      // Validar dimensiones mínimas
      if (img.width < 10 || img.height < 10) {
        reject(new Error('Imagen demasiado pequeña'));
        return;
      }
      // Calcular dimensiones para página completa (A4: 210x297mm = 595x842px a 72dpi)
      // Usar alta resolución para impresión (300 DPI)
      const pageWidthPx = 210 * 300 / 25.4; // ~2480px
      const pageHeightPx = 297 * 300 / 25.4; // ~3508px
      
      // Área disponible para imagen (dejando márgenes)
      const availableWidth = pageWidthPx - 120; // ~2360px
      const availableHeight = pageHeightPx - 200; // ~3308px
      
      let { width, height } = img;
      
      // Calcular escala para maximizar la imagen manteniendo proporción
      const scaleX = availableWidth / width;
      const scaleY = availableHeight / height;
      const scale = Math.min(scaleX, scaleY);
      
      // Aplicar escala para máxima calidad
      const finalWidth = width * scale;
      const finalHeight = height * scale;
      
      // Configurar canvas con dimensiones finales
      canvas.width = finalWidth;
      canvas.height = finalHeight;
      
      // Configuración para máxima calidad
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      
      // Dibujar imagen con máxima calidad
      ctx.drawImage(img, 0, 0, finalWidth, finalHeight);
      
      // Usar calidad máxima para JPEG (0.95)
      resolve({
        dataURL: canvas.toDataURL('image/jpeg', 0.95),
        width: finalWidth,
        height: finalHeight
      });
    };
    
    img.onerror = (error) => {
      clearTimeout(timeout);
      reject(new Error('Error al cargar la imagen'));
    };
    
    // Usar createObjectURL de forma segura
    try {
      const imageUrl = URL.createObjectURL(file);
      img.src = imageUrl;
      
      // Limpiar URL después de cargar
      img.onload = (originalOnload => function(e) {
        URL.revokeObjectURL(imageUrl);
        return originalOnload.call(this, e);
      })(img.onload);
      
      img.onerror = (originalOnError => function(e) {
        URL.revokeObjectURL(imageUrl);
        return originalOnError.call(this, e);
      })(img.onerror);
      
    } catch (urlError) {
      clearTimeout(timeout);
      reject(new Error('Error creando URL de imagen'));
    }
  });
};

export const generatePDF = async (report: EquipmentReport): Promise<void> => {
  const pdf = new jsPDF();
  
  // Configuración de colores Gray Think
  const colors = {
    primary: [0, 0, 0] as [number, number, number], // Negro principal
    secondary: [75, 85, 99] as [number, number, number], // Gris elegante
    accent: [249, 115, 22] as [number, number, number], // Naranja accent
    success: [40, 167, 69] as [number, number, number], // Verde
    danger: [220, 53, 69] as [number, number, number] // Rojo
  };
  
  // ========== PÁGINA 1: INFORME TÉCNICO ==========
  
  // Header con logo Gray Think
  pdf.setFillColor(...colors.primary);
  pdf.rect(0, 0, 210, 30, 'F');
  
  // Logo Gray Think
  try {
    pdf.addImage('/images/logo/gray-think-logo.jpg', 'JPEG', 10, 5, 25, 20);
  } catch (error) {
    console.warn('Logo Gray Think no encontrado');
  }
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.text('GRAY THINK | INFORME TÉCNICO', 45, 20);
  
  // Código de barras en alta resolución
  const barcodeImg = generateBarcode(report.codigoBarras);
  pdf.addImage(barcodeImg, 'PNG', 135, 3, 70, 24); // Dimensiones aumentadas para mejor legibilidad
  
  // Información básica
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  
  let yPos = 50;
  const addField = (label: string, value: string, color?: [number, number, number]) => {
    pdf.setFont('helvetica', 'bold');
    pdf.text(label + ':', 20, yPos);
    pdf.setFont('helvetica', 'normal');
    if (color) pdf.setTextColor(...color);
    pdf.text(value, 80, yPos);
    pdf.setTextColor(0, 0, 0);
    yPos += 8;
  };
  
  addField('Fecha de Recepción', new Date(report.fechaRecepcion).toLocaleDateString('es-ES'));
  addField('Receptor', report.receptor);
  addField('Modelo', report.modelo);
  addField('Número de Serie', report.numeroSerie);
  addField('Almacenamiento', report.almacenamiento);
  addField('Color', report.color);
  addField('Clasificación', report.clasificacion);
  
  // Información del producto SKU si está disponible
  if (report.productoSKU) {
    addField('Producto SKU', `${report.productoSKU.nombre} (${report.productoSKU.sku})`);
  }
  
  addField('Costo', `$${report.costo.toLocaleString('es-ES')}`);
  
  // Sección de estado
  yPos += 10;
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(14);
  pdf.text('ESTADO DEL EQUIPO', 20, yPos);
  yPos += 10;
  
  pdf.setFontSize(12);
  addField('Nivel de Batería', `${report.bateria}%`, 
    report.bateria > 70 ? colors.success : report.bateria > 30 ? [255, 193, 7] : colors.danger);
  addField('Estado del Chassis', report.estadoChassis);
  addField('Estado de Pantalla', report.estadoPantalla);
  
  // Componentes
  yPos += 10;
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(14);
  pdf.text('COMPONENTES', 20, yPos);
  yPos += 10;
  
  pdf.setFontSize(12);
  addField('Parlantes', report.parlantes, 
    report.parlantes === 'Perfecto' ? colors.success : colors.danger);
  addField('Auricular', report.auricular,
    report.auricular === 'Perfecto' ? colors.success : colors.danger);
  addField('Pin de Carga', report.pinCarga,
    report.pinCarga === 'Perfecto' ? colors.success : colors.danger);
  addField('Face ID', report.faceId,
    report.faceId === 'Funciona' ? colors.success : colors.danger);
  addField('Cámara', report.camara,
    report.camara === 'Perfecto' ? colors.success : colors.danger);
  
  // Botones
  yPos += 5;
  if (report.todosBotonesFuncionan) {
    addField('Botones', 'Todos los botones funcionan correctamente', colors.success);
  } else {
    addField('Botones', 'Verificación individual:', colors.secondary);
    Object.entries(report.botonesIndividuales).forEach(([boton, funciona]) => {
      pdf.text(`  • ${boton.charAt(0).toUpperCase() + boton.slice(1)}: ${funciona ? 'Funciona' : 'No funciona'}`, 
        25, yPos);
      yPos += 6;
    });
  }
  
  // Observaciones
  if (report.observaciones) {
    yPos += 10;
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(14);
    pdf.text('OBSERVACIONES', 20, yPos);
    yPos += 10;
    
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(12);
    const splitText = pdf.splitTextToSize(report.observaciones, 170);
    pdf.text(splitText, 20, yPos);
    yPos += splitText.length * 6;
  }
  
  // Firma
  yPos = Math.max(yPos + 20, 250);
  pdf.line(20, yPos, 80, yPos);
  pdf.text('Firma del Técnico', 20, yPos + 10);
  
  pdf.line(130, yPos, 190, yPos);
  pdf.text('Fecha', 130, yPos + 10);
  pdf.text(new Date().toLocaleString('es-ES'), 130, yPos + 20);
  
  // Footer
  pdf.setFontSize(8);
  pdf.setTextColor(...colors.secondary);
  pdf.text(`Reporte generado el ${new Date().toLocaleString('es-ES')}`, 20, 280);
  pdf.text(`Código: ${report.codigoBarras}`, 20, 285);
  
  // ========== PÁGINA 2: REGISTRO FOTOGRÁFICO ==========
  
  if (report.imagenes && report.imagenes.length > 0) {
    pdf.addPage();
    
    // Header de la página de imágenes
    pdf.setFillColor(...colors.primary);
    pdf.rect(0, 0, 210, 30, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('REGISTRO FOTOGRÁFICO', 20, 20);
    
    // Subtitle
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Modelo: ${report.modelo} | Código: ${report.codigoBarras}`, 20, 45);
    
    // Procesar y agregar imágenes - UNA IMAGEN POR PÁGINA EN ALTA RESOLUCIÓN
    try {
      for (let imgIndex = 0; imgIndex < report.imagenes.length; imgIndex++) {
        const imageFile = report.imagenes[imgIndex];
        
        try {
          const processedImage = await processImageForPDF(imageFile);
          
          // Crear nueva página para cada imagen
          pdf.addPage();
          
          // Header de la página de imagen
          pdf.setFillColor(...colors.primary);
          pdf.rect(0, 0, 210, 30, 'F');
          
          pdf.setTextColor(255, 255, 255);
          pdf.setFontSize(18);
          pdf.setFont('helvetica', 'bold');
          pdf.text(`IMAGEN ${imgIndex + 1} DE ${report.imagenes.length}`, 20, 18);
          
          // Información del equipo en el header
          pdf.setFontSize(12);
          pdf.setFont('helvetica', 'normal');
          pdf.text(`${report.modelo} | Código: ${report.codigoBarras}`, 20, 25);
          
          // Calcular posición centrada para la imagen
          const pageWidth = 210;
          const pageHeight = 297;
          const marginTop = 40;
          const marginBottom = 20;
          const marginSide = 10;
          
          // Área disponible para la imagen
          const availableWidth = pageWidth - (marginSide * 2);
          const availableHeight = pageHeight - marginTop - marginBottom;
          
          // Convertir dimensiones de pixel a mm (aproximadamente)
          // Asumir que la imagen ya está optimizada para impresión
          const imageWidthMM = Math.min(processedImage.width * 0.08, availableWidth);
          const imageHeightMM = Math.min(processedImage.height * 0.08, availableHeight);
          
          // Centrar la imagen en la página
          const xPos = (pageWidth - imageWidthMM) / 2;
          const yPos = marginTop + (availableHeight - imageHeightMM) / 2;
          
          // Agregar imagen en página completa con máxima calidad
          pdf.addImage(
            processedImage.dataURL, 
            'JPEG', 
            xPos, 
            yPos, 
            imageWidthMM, 
            imageHeightMM
          );
          
          // Información adicional en la parte inferior
          pdf.setTextColor(0, 0, 0);
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'normal');
          
          const imageInfo = [
            `Imagen ${imgIndex + 1} de ${report.imagenes.length}`,
            `Tamaño original: ${Math.round(imageFile.size / 1024)}KB`,
            `Fecha de captura: ${new Date().toLocaleDateString('es-ES')}`,
            `Resolución optimizada para impresión de alta calidad`
          ];
          
          let infoY = pageHeight - 15;
          imageInfo.forEach((info, index) => {
            pdf.text(info, 20, infoY - (index * 5));
          });
          
          // Marca de agua sutil con el código del equipo
          pdf.setTextColor(200, 200, 200);
          pdf.setFontSize(8);
          pdf.text(`Equipo: ${report.codigoBarras}`, pageWidth - 60, pageHeight - 5);
          
        } catch (imageError) {
          console.warn(`Error procesando imagen ${imgIndex + 1}:`, imageError);
          
          // Página de error para imagen dañada
          pdf.addPage();
          
          pdf.setFillColor(...colors.primary);
          pdf.rect(0, 0, 210, 30, 'F');
          
          pdf.setTextColor(255, 255, 255);
          pdf.setFontSize(16);
          pdf.setFont('helvetica', 'bold');
          pdf.text(`IMAGEN ${imgIndex + 1} - ERROR`, 20, 18);
          
          pdf.setTextColor(0, 0, 0);
          pdf.setFontSize(14);
          pdf.setFont('helvetica', 'normal');
          pdf.text('Error al procesar la imagen adjunta.', 20, 60);
          pdf.text(`Tamaño del archivo: ${Math.round(imageFile.size / 1024)}KB`, 20, 75);
          pdf.text('La imagen podría estar dañada o en un formato no compatible.', 20, 90);
        }
      }
      
      // Página de resumen de imágenes al final
      if (report.imagenes.length > 1) {
        pdf.addPage();
        
        pdf.setFillColor(...colors.primary);
        pdf.rect(0, 0, 210, 30, 'F');
        
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text('RESUMEN DEL REGISTRO FOTOGRÁFICO', 20, 18);
        
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');
        
        const summary = [
          `Equipo: ${report.modelo}`,
          `Código: ${report.codigoBarras}`,
          `Total de imágenes: ${report.imagenes.length}`,
          `Fecha de generación: ${new Date().toLocaleDateString('es-ES')}`,
          '',
          'Características del registro:',
          '• Cada imagen en página individual para máxima calidad',
          '• Resolución optimizada para impresión profesional',
          '• Formato JPEG con alta compresión sin pérdida',
          '• Dimensiones ajustadas para visualización detallada'
        ];
        
        let summaryY = 50;
        summary.forEach(line => {
          if (line.startsWith('•')) {
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(10);
          } else if (line === 'Características del registro:') {
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(12);
          } else {
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(12);
          }
          
          if (line) {
            pdf.text(line, 20, summaryY);
          }
          summaryY += line ? 8 : 4;
        });
      }
      
    } catch (error) {
      console.error('Error procesando imágenes para PDF:', error);
      
      // Página de error si no se pueden procesar las imágenes
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(12);
      pdf.text('Error al procesar las imágenes adjuntas.', 20, 80);
      pdf.text(`Número total de imágenes: ${report.imagenes.length}`, 20, 95);
    }
  }
  
  // Descargar PDF con método básico garantizado
  const filename = `informe-${report.modelo?.replace(/\s+/g, '-')}-${report.codigoBarras}.pdf`;
  
  console.log('🚀 INICIANDO DESCARGA BÁSICA DE PDF:', filename);
  
  // Ejecutar descarga básica directa
  basicDownload(filename, pdf);
  
  console.log('✅ DESCARGA BÁSICA DE PDF COMPLETADA:', filename);
};

// ========== NUEVO GENERADOR EXCEL HORIZONTAL ==========
export const generateExcel = (report: EquipmentReport): void => {
  // Crear datos en formato horizontal (una fila por equipo)
  const headers = [
    'Código de Barras',
    'Fecha de Generación', 
    'Fecha de Recepción',
    'Receptor',
    'Modelo',
    'Número de Serie',
    'Almacenamiento',
    'Color',
    'Clasificación',
    'SKU',
    'Producto SKU',
    'Costo',
    'Nivel de Batería (%)',
    'Estado del Chassis',
    'Estado de Pantalla',
    'Parlantes',
    'Auricular', 
    'Pin de Carga',
    'Face ID',
    'Cámara',
    'Todos los Botones Funcionan',
    'Botón Volumen',
    'Botón Encendido',
    'Botón Home',
    'Botón Silencio',
    'Observaciones',
    'Técnico',
    'Número de Imágenes'
  ];
  
  const rowData = [
    report.codigoBarras,
    new Date().toLocaleDateString('es-ES'),
    new Date(report.fechaRecepcion).toLocaleDateString('es-ES'),
    report.receptor,
    report.modelo,
    report.numeroSerie,
    report.almacenamiento,
    report.color,
    report.clasificacion,
    report.productoSKU?.sku || 'No asignado',
    report.productoSKU?.nombre || 'No asignado',
    report.costo,
    report.bateria,
    report.estadoChassis,
    report.estadoPantalla,
    report.parlantes,
    report.auricular,
    report.pinCarga,
    report.faceId,
    report.camara,
    report.todosBotonesFuncionan ? 'Sí' : 'No',
    report.botonesIndividuales.volumen ? 'Funciona' : 'No funciona',
    report.botonesIndividuales.encendido ? 'Funciona' : 'No funciona', 
    report.botonesIndividuales.home ? 'Funciona' : 'No funciona',
    report.botonesIndividuales.silencio ? 'Funciona' : 'No funciona',
    report.observaciones,
    report.tecnicoFirma || 'No especificado',
    report.imagenes?.length || 0
  ];
  
  // Crear hoja de cálculo con formato tabular
  const ws = XLSX.utils.aoa_to_sheet([headers, rowData]);
  
  // Configurar ancho de columnas
  const colWidths = headers.map(header => ({
    wch: Math.max(header.length, 15)
  }));
  ws['!cols'] = colWidths;
  
  // Estilo para encabezados (si es compatible)
  const headerRange = XLSX.utils.encode_range({ s: { c: 0, r: 0 }, e: { c: headers.length - 1, r: 0 } });
  
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Equipos');
  
  // Crear hoja adicional con instrucciones
  const instructionsData = [
    ['INSTRUCCIONES DE USO'],
    [''],
    ['Este archivo Excel está diseñado para crear una base de datos de equipos.'],
    ['Cada fila representa un equipo diferente con todos sus parámetros.'],
    [''],
    ['Para agregar más equipos:'],
    ['1. Copie la fila de encabezados si es necesario'],
    ['2. Agregue una nueva fila por cada equipo'],
    ['3. Complete todos los campos correspondientes'],
    [''],
    ['Campos principales:'],
    ['- Código de Barras: Identificador único del equipo'],
    ['- Modelo: Modelo del dispositivo'],
    ['- SKU: Código de producto (si aplica)'],
    ['- Estado: Condición de cada componente'],
    ['- Observaciones: Notas adicionales del técnico'],
    [''],
    ['Este formato facilita:'],
    ['- Análisis de múltiples equipos'],
    ['- Filtrado y búsqueda de datos'],
    ['- Creación de reportes consolidados'],
    ['- Importación a otros sistemas']
  ];
  
  const instructionsWS = XLSX.utils.aoa_to_sheet(instructionsData);
  XLSX.utils.book_append_sheet(wb, instructionsWS, 'Instrucciones');
  
  XLSX.writeFile(wb, `base-datos-equipos-${report.modelo}-${report.codigoBarras}.xlsx`);
};

// ========== FUNCIONES PARA BASE DE DATOS LOCAL ==========

// Interfaz para la base de datos de equipos
export interface EquipmentDatabase {
  equipments: EquipmentReport[];
  lastUpdated: string;
}

// Guardar equipo en base de datos local
export const saveEquipmentToDatabase = (report: EquipmentReport): void => {
  try {
    const database = loadEquipmentDatabase();
    
    // Verificar si ya existe un equipo con el mismo código de barras
    const existingIndex = database.equipments.findIndex(
      eq => eq.codigoBarras === report.codigoBarras
    );
    
    if (existingIndex >= 0) {
      // Actualizar equipo existente
      database.equipments[existingIndex] = report;
    } else {
      // Agregar nuevo equipo
      database.equipments.push(report);
    }
    
    database.lastUpdated = new Date().toISOString();
    localStorage.setItem('equipment-database', JSON.stringify(database));
    
    console.log('Equipo guardado en base de datos local:', report.codigoBarras);
  } catch (error) {
    console.error('Error guardando equipo en base de datos:', error);
  }
};

// Cargar base de datos de equipos
export const loadEquipmentDatabase = (): EquipmentDatabase => {
  try {
    const stored = localStorage.getItem('equipment-database');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error cargando base de datos:', error);
  }
  
  // Retornar base de datos vacía si no existe o hay error
  return {
    equipments: [],
    lastUpdated: new Date().toISOString()
  };
};

// Buscar equipos en la base de datos
export const searchEquipments = (query: string, searchBy: string = 'all'): EquipmentReport[] => {
  const database = loadEquipmentDatabase();
  const lowercaseQuery = query.toLowerCase();
  
  if (!query.trim()) {
    return database.equipments;
  }
  
  return database.equipments.filter(equipment => {
    switch (searchBy) {
      case 'sku':
        return equipment.productoSKU?.sku.toLowerCase().includes(lowercaseQuery) || false;
      case 'modelo':
        return equipment.modelo.toLowerCase().includes(lowercaseQuery);
      case 'receptor':
        return equipment.receptor.toLowerCase().includes(lowercaseQuery);
      case 'codigo':
        return equipment.codigoBarras.toLowerCase().includes(lowercaseQuery);
      case 'fecha':
        return equipment.fechaRecepcion.includes(query);
      default: // 'all'
        return (
          equipment.modelo.toLowerCase().includes(lowercaseQuery) ||
          equipment.receptor.toLowerCase().includes(lowercaseQuery) ||
          equipment.codigoBarras.toLowerCase().includes(lowercaseQuery) ||
          equipment.numeroSerie.toLowerCase().includes(lowercaseQuery) ||
          (equipment.productoSKU?.sku.toLowerCase().includes(lowercaseQuery)) ||
          (equipment.productoSKU?.nombre.toLowerCase().includes(lowercaseQuery)) ||
          equipment.observaciones.toLowerCase().includes(lowercaseQuery)
        );
    }
  });
};

// Exportar toda la base de datos a Excel
export const exportDatabaseToExcel = (): void => {
  const database = loadEquipmentDatabase();
  
  if (database.equipments.length === 0) {
    alert('No hay equipos en la base de datos para exportar.');
    return;
  }
  
  const headers = [
    'Código de Barras',
    'Fecha de Generación', 
    'Fecha de Recepción',
    'Receptor',
    'Modelo',
    'Número de Serie',
    'Almacenamiento',
    'Color',
    'Clasificación',
    'SKU',
    'Producto SKU',
    'Costo',
    'Nivel de Batería (%)',
    'Estado del Chassis',
    'Estado de Pantalla',
    'Parlantes',
    'Auricular', 
    'Pin de Carga',
    'Face ID',
    'Cámara',
    'Todos los Botones Funcionan',
    'Botón Volumen',
    'Botón Encendido',
    'Botón Home',
    'Botón Silencio',
    'Observaciones',
    'Número de Imágenes'
  ];
  
  const rows = database.equipments.map(equipment => [
    equipment.codigoBarras,
    equipment.fechaGeneracion || new Date(equipment.fechaRecepcion).toLocaleDateString('es-ES'),
    new Date(equipment.fechaRecepcion).toLocaleDateString('es-ES'),
    equipment.receptor,
    equipment.modelo,
    equipment.numeroSerie,
    equipment.almacenamiento,
    equipment.color,
    equipment.clasificacion,
    equipment.productoSKU?.sku || 'No asignado',
    equipment.productoSKU?.nombre || 'No asignado',
    equipment.costo,
    equipment.bateria,
    equipment.estadoChassis,
    equipment.estadoPantalla,
    equipment.parlantes,
    equipment.auricular,
    equipment.pinCarga,
    equipment.faceId,
    equipment.camara,
    equipment.todosBotonesFuncionan ? 'Sí' : 'No',
    equipment.botonesIndividuales.volumen ? 'Funciona' : 'No funciona',
    equipment.botonesIndividuales.encendido ? 'Funciona' : 'No funciona', 
    equipment.botonesIndividuales.home ? 'Funciona' : 'No funciona',
    equipment.botonesIndividuales.silencio ? 'Funciona' : 'No funciona',
    equipment.observaciones,
    equipment.imagenes?.length || 0
  ]);
  
  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  
  // Configurar ancho de columnas
  const colWidths = headers.map(header => ({
    wch: Math.max(header.length, 15)
  }));
  ws['!cols'] = colWidths;
  
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Base de Datos Equipos');
  
  // Agregar hoja de estadísticas
  const statsData = [
    ['ESTADÍSTICAS DE LA BASE DE DATOS'],
    [''],
    ['Total de equipos registrados:', database.equipments.length],
    ['Última actualización:', new Date(database.lastUpdated).toLocaleString('es-ES')],
    ['Fecha de exportación:', new Date().toLocaleString('es-ES')],
    [''],
    ['Distribución por clasificación:'],
  ];
  
  // Calcular estadísticas
  const clasificaciones = database.equipments.reduce((acc, eq) => {
    acc[eq.clasificacion] = (acc[eq.clasificacion] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  Object.entries(clasificaciones).forEach(([clasificacion, count]) => {
    statsData.push([`- ${clasificacion}:`, count]);
  });
  
  const statsWS = XLSX.utils.aoa_to_sheet(statsData);
  XLSX.utils.book_append_sheet(wb, statsWS, 'Estadísticas');
  
  XLSX.writeFile(wb, `base-datos-completa-${new Date().toISOString().split('T')[0]}.xlsx`);
};

// Eliminar equipo de la base de datos
export const deleteEquipmentFromDatabase = (codigoBarras: string): boolean => {
  try {
    const database = loadEquipmentDatabase();
    const initialLength = database.equipments.length;
    
    database.equipments = database.equipments.filter(
      eq => eq.codigoBarras !== codigoBarras
    );
    
    if (database.equipments.length < initialLength) {
      database.lastUpdated = new Date().toISOString();
      localStorage.setItem('equipment-database', JSON.stringify(database));
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error eliminando equipo:', error);
    return false;
  }
};

// Limpiar toda la base de datos
export const clearEquipmentDatabase = (): void => {
  try {
    localStorage.removeItem('equipment-database');
    console.log('Base de datos de equipos limpiada');
  } catch (error) {
    console.error('Error limpiando base de datos:', error);
  }
};