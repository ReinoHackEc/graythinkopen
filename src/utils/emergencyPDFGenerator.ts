import jsPDF from 'jspdf';
import { EquipmentReport } from '../types/Equipment';

// SOLUCIÓN DE EMERGENCIA: Abrir PDF en nueva ventana para descarga manual
export const generateEmergencyPDF = async (report: EquipmentReport): Promise<void> => {
  console.log('🆘 INICIANDO GENERACIÓN PDF DE EMERGENCIA');
  
  try {
    // Crear PDF básico
    const pdf = new jsPDF('portrait', 'mm', 'a4');
    
    console.log('📄 PDF instancia creada correctamente');
    
    // Header profesional Gray Think
    pdf.setFillColor(0, 0, 0); // Negro
    pdf.rect(0, 0, 210, 25, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text('GRAY THINK | INFORME TÉCNICO', 20, 16);
    
    // Información del equipo
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    
    let y = 40;
    const addField = (label: string, value: string) => {
      pdf.setFont('helvetica', 'bold');
      pdf.text(label + ':', 20, y);
      pdf.setFont('helvetica', 'normal');
      pdf.text(value, 80, y);
      y += 8;
    };
    
    addField('Fecha', new Date().toLocaleDateString('es-ES'));
    addField('Modelo', report.modelo || 'No especificado');
    addField('Receptor', report.receptor || 'No especificado');
    addField('Número de Serie', report.numeroSerie || 'No especificado');
    addField('Almacenamiento', report.almacenamiento || 'No especificado');
    addField('Color', report.color || 'No especificado');
    addField('Batería', `${report.bateria || 0}%`);
    addField('Clasificación', report.clasificacion || 'No especificado');
    
    // Estado de componentes
    y += 10;
    pdf.setFont('helvetica', 'bold');
    pdf.text('ESTADO DE COMPONENTES', 20, y);
    y += 10;
    
    addField('Chassis', report.estadoChassis || 'No especificado');
    addField('Pantalla', report.estadoPantalla || 'No especificado');
    addField('Parlantes', report.parlantes || 'No especificado');
    addField('Auricular', report.auricular || 'No especificado');
    addField('Pin de Carga', report.pinCarga || 'No especificado');
    addField('Face ID', report.faceId || 'No especificado');
    addField('Cámara', report.camara || 'No especificado');
    
    if (report.observaciones) {
      y += 10;
      pdf.setFont('helvetica', 'bold');
      pdf.text('OBSERVACIONES', 20, y);
      y += 8;
      pdf.setFont('helvetica', 'normal');
      
      // Dividir observaciones en líneas
      const lines = pdf.splitTextToSize(report.observaciones, 170);
      lines.forEach((line: string) => {
        pdf.text(line, 20, y);
        y += 6;
      });
    }
    
    // Footer
    pdf.setFontSize(10);
    pdf.setTextColor(128, 128, 128);
    pdf.text('Gray Think - Sistema de Informes de Equipos', 20, 280);
    pdf.text(`Código: ${report.codigoBarras}`, 20, 285);
    
    console.log('📝 Contenido del PDF agregado correctamente');
    
    // SOLUCIÓN DE EMERGENCIA: Abrir en nueva ventana
    const filename = `informe-${report.modelo?.replace(/\s+/g, '-')}-${Date.now()}.pdf`;
    
    try {
      // Intentar descarga directa primero
      pdf.save(filename);
      console.log('✅ DESCARGA DIRECTA EXITOSA:', filename);
      
    } catch (downloadError) {
      console.warn('⚠️ Descarga directa falló, abriendo en ventana:', downloadError);
      
      // Plan B: Abrir en nueva ventana
      const pdfDataUri = pdf.output('datauristring');
      const newWindow = window.open('', '_blank');
      
      if (newWindow) {
        newWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Gray Think - ${filename}</title>
              <style>
                body { margin: 0; font-family: Arial, sans-serif; }
                .header { background: #000; color: white; padding: 10px; text-align: center; }
                .instructions { padding: 20px; text-align: center; background: #f5f5f5; }
                iframe { width: 100%; height: calc(100vh - 120px); border: none; }
              </style>
            </head>
            <body>
              <div class="header">
                <h2>Gray Think - Informe Técnico</h2>
              </div>
              <div class="instructions">
                <p><strong>Para descargar:</strong> Haz clic derecho sobre el PDF y selecciona "Guardar como..."</p>
                <p><strong>Nombre sugerido:</strong> ${filename}</p>
              </div>
              <iframe src="${pdfDataUri}"></iframe>
            </body>
          </html>
        `);
        
        console.log('✅ PDF ABIERTO EN NUEVA VENTANA');
        alert('✅ El informe se abrió en una nueva ventana. Haz clic derecho sobre el PDF y selecciona "Guardar como..." para descargarlo.');
        
      } else {
        throw new Error('No se pudo abrir ventana emergente - posiblemente bloqueada por el navegador');
      }
    }
    
  } catch (error) {
    console.error('❌ ERROR CRÍTICO EN PDF DE EMERGENCIA:', error);
    alert('❌ Error generando el informe. Por favor, revisa que tu navegador permita ventanas emergentes y descargas.');
    throw error;
  }
};

// GENERADOR DE ETIQUETAS DE EMERGENCIA
export const generateEmergencyLabel = async (report: Partial<EquipmentReport>): Promise<void> => {
  console.log('🆘 INICIANDO GENERACIÓN ETIQUETA DE EMERGENCIA');
  
  try {
    // Crear PDF para etiqueta 50x25mm
    const pdf = new jsPDF('landscape', 'mm', [50, 25]);
    
    // Contenido simple de etiqueta
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'bold');
    pdf.text(report.modelo || 'MODELO', 2, 5);
    
    pdf.setFontSize(6);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`CLASIF: ${report.clasificacion || 'N/A'}`, 2, 10);
    pdf.text(`BAT: ${report.bateria || 0}%`, 2, 14);
    pdf.text(`${new Date().toLocaleDateString('es-ES')}`, 2, 18);
    
    // Footer
    pdf.setFontSize(5);
    pdf.text('Gray Think', 2, 22);
    
    const filename = `etiqueta-${report.modelo?.replace(/\s+/g, '-')}-${Date.now()}.pdf`;
    
    try {
      // Intentar descarga directa
      pdf.save(filename);
      console.log('✅ DESCARGA DIRECTA DE ETIQUETA EXITOSA:', filename);
      
    } catch (downloadError) {
      console.warn('⚠️ Descarga directa de etiqueta falló, abriendo en ventana:', downloadError);
      
      // Plan B: Nueva ventana
      const pdfDataUri = pdf.output('datauristring');
      const newWindow = window.open('', '_blank', 'width=600,height=400');
      
      if (newWindow) {
        newWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Gray Think - ${filename}</title>
              <style>
                body { margin: 0; font-family: Arial, sans-serif; text-align: center; }
                .header { background: #000; color: white; padding: 10px; }
                .instructions { padding: 15px; background: #f5f5f5; }
                iframe { border: 1px solid #ccc; margin: 10px; }
              </style>
            </head>
            <body>
              <div class="header">
                <h3>Gray Think - Etiqueta</h3>
              </div>
              <div class="instructions">
                <p><strong>Para descargar:</strong> Haz clic derecho y "Guardar como..."</p>
                <p><strong>Nombre:</strong> ${filename}</p>
              </div>
              <iframe src="${pdfDataUri}" width="500" height="250"></iframe>
            </body>
          </html>
        `);
        
        console.log('✅ ETIQUETA ABIERTA EN NUEVA VENTANA');
        alert('✅ La etiqueta se abrió en una nueva ventana. Haz clic derecho y selecciona "Guardar como..." para descargarla.');
        
      } else {
        throw new Error('No se pudo abrir ventana emergente para etiqueta');
      }
    }
    
  } catch (error) {
    console.error('❌ ERROR CRÍTICO EN ETIQUETA DE EMERGENCIA:', error);
    alert('❌ Error generando la etiqueta. Por favor, revisa que tu navegador permita ventanas emergentes.');
    throw error;
  }
};
