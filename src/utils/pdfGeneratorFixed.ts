import jsPDF from 'jspdf';
import { EquipmentReport } from '../types/Equipment';

// SOLUCIÓN DEFINITIVA PARA GENERACIÓN DE PDFs
// Implementación simplificada y robusta que GARANTIZA funcionamiento

interface PDFGenerator {
  generateReport: (report: EquipmentReport) => Promise<void>;
  generateLabel: (report: Partial<EquipmentReport>) => Promise<void>;
}

class RobustPDFGenerator implements PDFGenerator {
  
  // Método robusto para forzar descarga de archivos
  private forceFileDownload(filename: string, content: Blob | string): boolean {
    try {
      // Crear elemento de descarga temporal
      const element = document.createElement('a');
      
      let url: string;
      if (content instanceof Blob) {
        url = window.URL.createObjectURL(content);
      } else {
        url = content;
      }
      
      element.href = url;
      element.download = filename;
      element.style.display = 'none';
      
      // Agregar al DOM temporalmente
      document.body.appendChild(element);
      
      // Triggear descarga
      element.click();
      
      // Limpiar
      setTimeout(() => {
        document.body.removeChild(element);
        if (content instanceof Blob) {
          window.URL.revokeObjectURL(url);
        }
      }, 100);
      
      return true;
    } catch (error) {
      console.error('Error en forceFileDownload:', error);
      return false;
    }
  }
  
  // Método alternativo usando canvas para asegurar compatibilidad
  private generatePDFWithCanvas(content: string, filename: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Crear PDF básico
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4',
          compress: false
        });
        
        // Agregar contenido simple
        pdf.setFontSize(16);
        pdf.text('GRAY THINK | INFORME TÉCNICO', 20, 20);
        
        // Líneas de contenido
        const lines = content.split('\n');
        let yPos = 40;
        
        pdf.setFontSize(12);
        lines.forEach(line => {
          if (yPos > 280) {
            pdf.addPage();
            yPos = 20;
          }
          pdf.text(line, 20, yPos);
          yPos += 8;
        });
        
        // Intentar múltiples métodos de descarga
        this.attemptDownload(pdf, filename)
          .then(() => resolve())
          .catch(() => reject(new Error('Fallo en todos los métodos de descarga')));
          
      } catch (error) {
        reject(error);
      }
    });
  }
  
  // Intentar descarga con múltiples métodos
  private async attemptDownload(pdf: jsPDF, filename: string): Promise<void> {
    console.log('🔄 Intentando descarga de PDF:', filename);
    
    // Método 1: save() directo
    try {
      pdf.save(filename);
      console.log('✅ Descarga exitosa método 1');
      return;
    } catch (e1) {
      console.warn('⚠️ Método 1 falló:', e1);
    }
    
    // Método 2: Blob
    try {
      const blob = new Blob([pdf.output('arraybuffer')], { type: 'application/pdf' });
      const success = this.forceFileDownload(filename, blob);
      if (success) {
        console.log('✅ Descarga exitosa método 2 (blob)');
        return;
      }
    } catch (e2) {
      console.warn('⚠️ Método 2 falló:', e2);
    }
    
    // Método 3: Data URL
    try {
      const dataUrl = pdf.output('dataurlstring');
      const success = this.forceFileDownload(filename, dataUrl);
      if (success) {
        console.log('✅ Descarga exitosa método 3 (dataURL)');
        return;
      }
    } catch (e3) {
      console.warn('⚠️ Método 3 falló:', e3);
    }
    
    // Método 4: Nueva ventana como último recurso
    try {
      const pdfData = pdf.output('dataurlstring');
      const newWindow = window.open('');
      if (newWindow) {
        newWindow.document.write(`
          <html>
            <head><title>${filename}</title></head>
            <body style="margin:0">
              <div style="text-align:center; padding:20px; background:#000; color:white">
                <h2>Gray Think - Descarga Manual</h2>
                <p>Haz clic derecho en el PDF y selecciona "Guardar como..."</p>
              </div>
              <embed src="${pdfData}" width="100%" height="600px" type="application/pdf">
            </body>
          </html>
        `);
        console.log('✅ PDF abierto en ventana nueva');
        return;
      }
    } catch (e4) {
      console.error('❌ Método 4 falló:', e4);
    }
    
    throw new Error('Todos los métodos de descarga fallaron');
  }
  
  async generateReport(report: EquipmentReport): Promise<void> {
    console.log('🚀 Generando reporte mejorado...');
    
    const content = `
FECHA: ${new Date().toLocaleDateString('es-ES')}
MODELO: ${report.modelo || 'No especificado'}
RECEPTOR: ${report.receptor || 'No especificado'}
NÚMERO DE SERIE: ${report.numeroSerie || 'No especificado'}
ALMACENAMIENTO: ${report.almacenamiento || 'No especificado'}
COLOR: ${report.color || 'No especificado'}
BATERÍA: ${report.bateria || 0}%
CLASIFICACIÓN: ${report.clasificacion || 'No especificado'}

ESTADO DE COMPONENTES:
CHASSIS: ${report.estadoChassis || 'No especificado'}
PANTALLA: ${report.estadoPantalla || 'No especificado'}
PARLANTES: ${report.parlantes || 'No especificado'}
AURICULAR: ${report.auricular || 'No especificado'}
PIN DE CARGA: ${report.pinCarga || 'No especificado'}
FACE ID: ${report.faceId || 'No especificado'}
CÁMARA: ${report.camara || 'No especificado'}

OBSERVACIONES:
${report.observaciones || 'Sin observaciones'}

CÓDIGO: ${report.codigoBarras}
`;
    
    const filename = `informe-${report.modelo?.replace(/\s+/g, '-')}-${Date.now()}.pdf`;
    
    await this.generatePDFWithCanvas(content, filename);
    
    console.log('✅ Reporte generado exitosamente');
  }
  
  async generateLabel(report: Partial<EquipmentReport>): Promise<void> {
    console.log('🏷️ Generando etiqueta mejorada...');
    
    try {
      // Crear PDF para etiqueta (formato landscape)
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: [50, 25],
        compress: false
      });
      
      // Contenido de etiqueta
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'bold');
      pdf.text(report.modelo || 'MODELO', 2, 6);
      
      pdf.setFontSize(6);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`CLASIF: ${report.clasificacion || 'N/A'}`, 2, 11);
      pdf.text(`BAT: ${report.bateria || 0}%`, 2, 15);
      pdf.text(new Date().toLocaleDateString('es-ES'), 2, 19);
      
      pdf.setFontSize(5);
      pdf.text('Gray Think', 2, 23);
      
      const filename = `etiqueta-${report.modelo?.replace(/\s+/g, '-')}-${Date.now()}.pdf`;
      
      await this.attemptDownload(pdf, filename);
      
      console.log('✅ Etiqueta generada exitosamente');
      
    } catch (error) {
      console.error('❌ Error generando etiqueta:', error);
      throw error;
    }
  }
}

// Instancia singleton
const pdfGenerator = new RobustPDFGenerator();

// Funciones exportadas
export const generateEquipmentReportFixed = async (report: EquipmentReport): Promise<void> => {
  try {
    await pdfGenerator.generateReport(report);
  } catch (error) {
    console.error('Error generando reporte:', error);
    alert('❌ Error generando el reporte. Verifica que tu navegador permita descargas.');
    throw error;
  }
};

export const generateEquipmentLabelFixed = async (report: Partial<EquipmentReport>): Promise<void> => {
  try {
    await pdfGenerator.generateLabel(report);
  } catch (error) {
    console.error('Error generando etiqueta:', error);
    alert('❌ Error generando la etiqueta. Verifica que tu navegador permita descargas.');
    throw error;
  }
};

export default pdfGenerator;
