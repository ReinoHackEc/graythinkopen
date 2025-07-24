import jsPDF from 'jspdf';
import { EquipmentReport } from '../types/Equipment';

// Función simplificada SOLO para VALIDAR que las descargas funcionan
export const generateSimplePDF = async (report: EquipmentReport): Promise<void> => {
  console.log('🔥 INICIANDO GENERACIÓN PDF SIMPLIFICADA');
  
  try {
    // Crear PDF básico
    const pdf = new jsPDF('portrait', 'mm', 'a4');
    
    console.log('📄 PDF instancia creada correctamente');
    
    // Header simple
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('GRAY THINK - INFORME TÉCNICO', 20, 30);
    
    // Información básica
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    
    let y = 50;
    const addLine = (text: string) => {
      pdf.text(text, 20, y);
      y += 10;
    };
    
    addLine(`Fecha: ${new Date().toLocaleDateString('es-ES')}`);
    addLine(`Modelo: ${report.modelo || 'No especificado'}`);
    addLine(`Receptor: ${report.receptor || 'No especificado'}`);
    addLine(`Batería: ${report.bateria || 0}%`);
    addLine(`Clasificación: ${report.clasificacion || 'No especificado'}`);
    addLine(`Código: ${report.codigoBarras}`);
    
    // Estado de componentes
    y += 10;
    addLine('=== ESTADO DE COMPONENTES ===');
    addLine(`Chassis: ${report.estadoChassis || 'No especificado'}`);
    addLine(`Pantalla: ${report.estadoPantalla || 'No especificado'}`);
    addLine(`Parlantes: ${report.parlantes || 'No especificado'}`);
    addLine(`Face ID: ${report.faceId || 'No especificado'}`);
    
    if (report.observaciones) {
      y += 10;
      addLine('=== OBSERVACIONES ===');
      addLine(report.observaciones);
    }
    
    console.log('📝 Contenido del PDF agregado correctamente');
    
    // Nombre del archivo
    const filename = `informe-simple-${report.modelo?.replace(/\s+/g, '-')}-${Date.now()}.pdf`;
    
    console.log('💾 INICIANDO DESCARGA SIMPLE:', filename);
    
    // Descarga directa y simple
    pdf.save(filename);
    
    console.log('✅ DESCARGA SIMPLE COMPLETADA:', filename);
    
  } catch (error) {
    console.error('❌ ERROR EN PDF SIMPLE:', error);
    throw error;
  }
};
