import React, { useState } from 'react';
import jsPDF from 'jspdf';
import JsBarcode from 'jsbarcode';
import { EquipmentReport } from '../types/Equipment';
import { Tag, Loader2 } from 'lucide-react';
import { generateEquipmentLabelFixed } from '../utils/pdfGeneratorFixed';

// Método de descarga ultra-robusto para etiquetas
const ultimateLabelDownload = (filename: string, pdfInstance: any) => {
  console.log('🏷️ Iniciando descarga ultra-robusta de etiqueta:', filename);
  
  // Método directo sin try-catch
  console.log('📥 Ejecutando descarga directa de etiqueta...');
  pdfInstance.save(filename);
  console.log('✅ Descarga directa de etiqueta ejecutada');
  
  // Método de respaldo con blob
  setTimeout(() => {
    console.log('📥 Ejecutando método blob de respaldo para etiqueta...');
    try {
      const labelBlob = pdfInstance.output('blob');
      const blobUrl = URL.createObjectURL(labelBlob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
      console.log('✅ Método blob de etiqueta completado');
    } catch (err) {
      console.error('❌ Error en blob de etiqueta:', err);
    }
  }, 300);
  
  return true;
};

interface LabelGeneratorProps {
  report: Partial<EquipmentReport>;
  disabled?: boolean;
}

export const LabelGenerator: React.FC<LabelGeneratorProps> = ({ report, disabled }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  
  const generateLabel = async () => {
    setIsGenerating(true);
    
    try {
      console.log('🏷️ USANDO GENERADOR DE ETIQUETAS CORREGIDO');
      
      // Usar función corregida y robusta
      await generateEquipmentLabelFixed(report);
      
      console.log('✅ ETIQUETA GENERADA EXITOSAMENTE');
      
    } catch (error) {
      console.error('❌ Error generando etiqueta:', error);
      alert('❌ Error generando la etiqueta. Verifica que tu navegador permita descargas.');
    } finally {
      setIsGenerating(false);
    }
  };
  
  // FUNCIÓN ORIGINAL COMENTADA TEMPORALMENTE
  const generateLabelOriginal = async () => {
    setIsGenerating(true);
    try {
      if (!report.modelo || report.bateria === undefined || !report.clasificacion) {
        alert('Para generar la etiqueta se requiere: Modelo, Nivel de Batería y Clasificación');
        return;
      }
      
      // Determinar si incluir código de barras SKU
      const includeSKU = report.productoSKU && report.productoSKU.sku;

      // Crear PDF con dimensiones de etiqueta 50x25mm
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: [50, 25] // Ancho x Alto en mm
      });
      
      // Generar código de barras de ALTA RESOLUCIÓN para impresión
      let barcodeDataURL = '';
      if (includeSKU) {
        try {
          const canvas = document.createElement('canvas');
          
          // Configuración optimizada para impresión de alta calidad
          JsBarcode(canvas, report.productoSKU!.sku, {
            format: 'CODE128',
            width: 4, // Aumentado de 1 a 4 para mayor grosor de barras
            height: 80, // Aumentado de 30 a 80 para mayor altura
            displayValue: false, // Sin texto para más espacio
            margin: 10, // Margen aumentado para zona silenciosa
            background: '#FFFFFF', // Fondo blanco explícito
            lineColor: '#000000', // Negro sólido para las barras
            fontOptions: 'bold',
            fontSize: 16,
            textAlign: 'center',
            textPosition: 'bottom'
          });
          
          // Obtener data URL con máxima calidad
          barcodeDataURL = canvas.toDataURL('image/png', 1.0);
          
        } catch (barcodeError) {
          console.warn('Error generando código de barras:', barcodeError);
        }
      }

      // Configuración de colores
      const primaryColor = [0, 0, 0] as [number, number, number]; // Negro principal Gray Think
      const accentColor = [249, 115, 22] as [number, number, number]; // Naranja accent
      const secondaryColor = [108, 117, 125] as [number, number, number]; // Gris

      // Fondo con borde
      pdf.setDrawColor(...primaryColor);
      pdf.setLineWidth(0.5);
      pdf.rect(1, 1, 48, 23);

      // Diseño del layout dependiendo si hay SKU o no
      if (includeSKU) {
        // Layout con SKU: 3 secciones horizontales
        // Línea divisoria horizontal superior (después del modelo)
        pdf.setDrawColor(...secondaryColor);
        pdf.setLineWidth(0.2);
        pdf.line(1, 9, 49, 9);
        
        // Línea divisoria horizontal inferior (antes del código de barras)
        pdf.line(1, 16, 49, 16);
        
        // Línea divisoria vertical en la sección media
        pdf.line(25, 9, 25, 16);
      } else {
        // Layout original sin SKU
        pdf.setDrawColor(...secondaryColor);
        pdf.setLineWidth(0.2);
        pdf.line(1, 12.5, 49, 12.5);
        pdf.line(25, 12.5, 25, 24);
      }

      // Parte superior: Modelo del equipo
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(includeSKU ? 8 : 9);
      pdf.setTextColor(...primaryColor);
      
      // Calcular posición centrada para el modelo
      const modeloText = report.modelo;
      const textWidth = pdf.getTextWidth(modeloText);
      const xPos = (50 - textWidth) / 2;
      
      pdf.text(modeloText, xPos, includeSKU ? 6 : 8);

      if (includeSKU) {
        // Layout con SKU: sección media dividida
        
        // Sección media izquierda: Clasificación
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(6);
        pdf.setTextColor(80, 80, 80);
        pdf.text('CLASIF:', 2, 11);
        
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(8);
        pdf.setTextColor(...primaryColor);
        pdf.text(report.clasificacion, 2, 14.5);

        // Sección media derecha: Batería
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(6);
        pdf.setTextColor(80, 80, 80);
        pdf.text('BAT:', 27, 11);
        
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(8);
        
        const batteryLevel = report.bateria || 0;
        if (batteryLevel > 70) {
          pdf.setTextColor(40, 167, 69); // Verde
        } else if (batteryLevel > 30) {
          pdf.setTextColor(255, 193, 7); // Amarillo
        } else {
          pdf.setTextColor(220, 53, 69); // Rojo
        }
        
        pdf.text(`${batteryLevel}%`, 27, 14.5);

        // Icono de batería pequeño
        pdf.setDrawColor(100, 100, 100);
        pdf.setLineWidth(0.2);
        pdf.rect(40, 12, 5, 2.5);
        pdf.rect(45, 12.5, 0.8, 1.5);
        
        const fillWidth = (batteryLevel / 100) * 4.5;
        if (batteryLevel > 70) {
          pdf.setFillColor(40, 167, 69);
        } else if (batteryLevel > 30) {
          pdf.setFillColor(255, 193, 7);
        } else {
          pdf.setFillColor(220, 53, 69);
        }
        pdf.rect(40.2, 12.2, fillWidth, 2.1, 'F');
        
        // Sección inferior: Código de barras SKU en ALTA RESOLUCIÓN
        if (barcodeDataURL) {
          try {
            // Dimensiones optimizadas para el código de barras grande
            const barcodeWidth = 42; // Casi todo el ancho disponible
            const barcodeHeight = 6; // Altura aumentada para mejor lectura
            const barcodeX = (50 - barcodeWidth) / 2; // Centrado horizontalmente
            const barcodeY = 16.5; // Posición vertical optimizada
            
            // Agregar código de barras con alta resolución
            pdf.addImage(barcodeDataURL, 'PNG', barcodeX, barcodeY, barcodeWidth, barcodeHeight);
            
            // Texto del SKU debajo del código de barras
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(4.5); // Tamaño de fuente pequeño pero legible
            pdf.setTextColor(40, 40, 40); // Gris oscuro para mejor contraste
            const skuText = report.productoSKU!.sku;
            const skuTextWidth = pdf.getTextWidth(skuText);
            const skuXPos = (50 - skuTextWidth) / 2;
            pdf.text(skuText, skuXPos, 23); // Debajo del código de barras
            
          } catch (imageError) {
            console.warn('Error agregando imagen del código de barras:', imageError);
            
            // Fallback mejorado: dibujar código de barras simple
            pdf.setFillColor(0, 0, 0);
            
            // Simular barras del código
            const barWidth = 0.5;
            const barHeight = 5;
            const startX = 10;
            const startY = 17;
            
            for (let i = 0; i < 30; i++) {
              if (i % 2 === 0) {
                pdf.rect(startX + (i * barWidth), startY, barWidth, barHeight, 'F');
              }
            }
            
            // Texto del SKU como fallback principal
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(6);
            pdf.setTextColor(...primaryColor);
            const skuText = `SKU: ${report.productoSKU!.sku}`;
            const skuTextWidth = pdf.getTextWidth(skuText);
            const skuXPos = (50 - skuTextWidth) / 2;
            pdf.text(skuText, skuXPos, 22.5);
          }
        }
      } else {
        // Layout original sin SKU
        // Parte inferior izquierda: Clasificación
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(7);
        pdf.setTextColor(80, 80, 80);
        pdf.text('CLASIF:', 2, 17);
        
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(10);
        pdf.setTextColor(...primaryColor);
        pdf.text(report.clasificacion, 2, 21);

        // Parte inferior derecha: Batería
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(7);
        pdf.setTextColor(80, 80, 80);
        pdf.text('BAT:', 27, 17);
        
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(10);
        
        const batteryLevel = report.bateria || 0;
        if (batteryLevel > 70) {
          pdf.setTextColor(40, 167, 69); // Verde
        } else if (batteryLevel > 30) {
          pdf.setTextColor(255, 193, 7); // Amarillo
        } else {
          pdf.setTextColor(220, 53, 69); // Rojo
        }
        
        pdf.text(`${batteryLevel}%`, 27, 21);

        // Icono de batería (representación simple)
        pdf.setDrawColor(100, 100, 100);
        pdf.setLineWidth(0.3);
        pdf.rect(40, 18.5, 6, 3);
        pdf.rect(46, 19.2, 1, 1.6);
        
        const fillWidth = (batteryLevel / 100) * 5.5;
        if (batteryLevel > 70) {
          pdf.setFillColor(40, 167, 69);
        } else if (batteryLevel > 30) {
          pdf.setFillColor(255, 193, 7);
        } else {
          pdf.setFillColor(220, 53, 69);
        }
        pdf.rect(40.2, 18.7, fillWidth, 2.6, 'F');
      }

      // Fecha en la esquina inferior (muy pequeña)
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(4);
      pdf.setTextColor(150, 150, 150);
      pdf.text(new Date().toLocaleDateString('es-ES'), 1, 23.5);

      // Descargar etiqueta con método simple y directo
      const skuSuffix = includeSKU ? `-${report.productoSKU!.sku}` : '';
      const filename = `etiqueta-${report.modelo?.replace(/\s+/g, '-')}${skuSuffix}-${Date.now()}.pdf`;
      
      console.log('🎯 DESCARGA SIMPLE DE ETIQUETA:', filename);
      
      // Descarga directa sin complejidad
      pdf.save(filename);
      
      console.log('✅ ETIQUETA DESCARGADA EXITOSAMENTE:', filename);
      
      // Mostrar confirmación al usuario
      alert(`✅ Etiqueta generada: ${filename}`);
      
    } catch (error) {
      console.error('Error al generar la etiqueta:', error);
      alert('Error al generar la etiqueta. Por favor, inténtalo de nuevo.');
    } finally {
      setIsGenerating(false);
    }
  };

  const canGenerate = !!(report.modelo?.trim() && report.bateria !== undefined && report.clasificacion);

  return (
    <button
      onClick={generateLabel}
      disabled={disabled || !canGenerate || isGenerating}
      className={`w-full flex items-center justify-center space-x-2 font-semibold py-3 px-4 rounded-lg transition-colors ${
        disabled || !canGenerate || isGenerating
          ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
          : 'bg-purple-600 hover:bg-purple-700 text-white'
      }`}
      title={!canGenerate ? 'Se requiere: Modelo, Batería y Clasificación' : 'Generar etiqueta imprimible 50x25mm'}
    >
      {isGenerating ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <Tag className="w-5 h-5" />
      )}
      <span>{isGenerating ? 'Generando...' : 'Generar Etiqueta'}</span>
    </button>
  );
};