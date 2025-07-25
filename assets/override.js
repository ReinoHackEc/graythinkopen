/*
 * Gray Think Override Script
 *
 * This script enhances the functionality of the built-in report and label
 * generators used by the Gray Think application. By overriding the
 * generateLabel and generateReport methods on the Z8 prototype, we add
 * support for Code128 barcodes and a detailed multi‑page report layout
 * reminiscent of the original MiniMax version. The overrides are applied
 * once the page has finished loading and the Z8 class is defined.
 */
(function() {
  function applyOverrides() {
    try {
      // Ensure the constructor exists before overriding
      if (typeof window.Z8 === 'function') {
        /**
         * Generate an improved 50x25 mm label PDF with a Code128 barcode.
         * @param {Object} data Equipment data containing at least modelo, clasificacion, bateria and codigoBarras.
         */
        window.Z8.prototype.generateLabel = async function(data) {
          console.log('[Override] Generando etiqueta detallada...');
          const doc = new window.jspdf.jsPDF({ orientation: 'landscape', unit: 'mm', format: [50, 25], compress: false });
          // Primary line: model name
          doc.setFontSize(8);
          doc.setFont('helvetica', 'bold');
          doc.text(data.modelo || 'MODELO', 2, 6);
          // Secondary lines
          doc.setFontSize(6);
          doc.setFont('helvetica', 'normal');
          doc.text(`CLASIF: ${data.clasificacion || 'N/A'}`, 2, 11);
          doc.text(`BAT: ${data.bateria ?? 0}%`, 2, 15);
          doc.text(new Date().toLocaleDateString('es-ES'), 2, 19);
          // Footer branding
          doc.setFontSize(5);
          doc.text('Gray Think', 2, 23);
          // Draw barcode on the right
          if (data.codigoBarras) {
            try {
              const canvas = document.createElement('canvas');
              window.JsBarcode(canvas, data.codigoBarras, { format: 'CODE128', height: 20, displayValue: false, margin: 0 });
              const barcodeData = canvas.toDataURL('image/png');
              doc.addImage(barcodeData, 'PNG', 30, 5, 18, 10);
            } catch (barcodeErr) {
              console.warn('[Override] No se pudo generar el código de barras:', barcodeErr);
            }
          }
          const namePart = (data.modelo || 'modelo').replace(/\s+/g, '-');
          const filename = `etiqueta-${namePart}-${Date.now()}.pdf`;
          await this.attemptDownload(doc, filename);
          console.log('[Override] Etiqueta PDF generada');
        };

        /**
         * Generate a detailed multi‑page report PDF with component states, button status,
         * observations, technician signature, and optional images.
         * @param {Object} data Equipment data object used to populate the report.
         */
        window.Z8.prototype.generateReport = async function(data) {
          console.log('[Override] Generando informe detallado...');
          const doc = new window.jspdf.jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: false });
          // Title and basic info
          doc.setFontSize(18);
          doc.setFont('helvetica', 'bold');
          doc.text('GRAY THINK | INFORME TÉCNICO', 20, 20);
          doc.setFontSize(12);
          doc.setFont('helvetica', 'normal');
          doc.text(`Fecha de Generación: ${new Date().toLocaleDateString('es-ES')}`, 20, 27);
          doc.text(`Receptor: ${data.receptor || 'N/A'}`, 20, 34);
          doc.text(`Modelo: ${data.modelo || 'N/A'}`, 20, 41);
          doc.text(`Número de Serie: ${data.numeroSerie || 'N/A'}`, 20, 48);
          doc.text(`Código de Barras: ${data.codigoBarras || 'N/A'}`, 20, 55);
          doc.text(`Fecha de Recepción: ${data.fechaRecepcion ? new Date(data.fechaRecepcion).toLocaleDateString('es-ES') : 'N/A'}`, 20, 62);
          // Key attributes
          const info = [
            { label: 'Almacenamiento', value: data.almacenamiento || 'N/A' },
            { label: 'Color', value: data.color || 'N/A' },
            { label: 'Clasificación', value: data.clasificacion || 'N/A' },
            { label: 'SKU', value: (data.productoSKU && data.productoSKU.sku) || 'No asignado' },
            { label: 'Producto SKU', value: (data.productoSKU && data.productoSKU.nombre) || 'No asignado' },
            { label: 'Costo', value: data.costo || 'N/A' },
            { label: 'Nivel de Batería', value: `${data.bateria ?? 0}%` },
          ];
          let y = 72;
          doc.setFontSize(11);
          info.forEach(item => {
            doc.setFont('helvetica', 'bold');
            doc.text(`${item.label}:`, 20, y);
            doc.setFont('helvetica', 'normal');
            doc.text(String(item.value), 60, y);
            y += 7;
          });
          // Component states
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(14);
          doc.text('Estado de Componentes', 20, y + 5);
          y += 12;
          const components = [
            { name: 'Chassis', value: data.estadoChassis },
            { name: 'Pantalla', value: data.estadoPantalla },
            { name: 'Parlantes', value: data.parlantes },
            { name: 'Auricular', value: data.auricular },
            { name: 'Pin de Carga', value: data.pinCarga },
            { name: 'Face ID', value: data.faceId },
            { name: 'Cámara', value: data.camara },
          ];
          doc.setFontSize(11);
          doc.setFont('helvetica', 'normal');
          components.forEach(item => {
            doc.text(`${item.name}: ${item.value || 'No especificado'}`, 25, y);
            y += 6;
          });
          y += 4;
          // Button status
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(14);
          doc.text('Botones', 20, y);
          y += 10;
          const buttons = [
            { name: 'Todos los Botones Funcionan', value: data.todosBotonesFuncionan },
            { name: 'Botón Volumen', value: data.botonesIndividuales?.volumen },
            { name: 'Botón Encendido', value: data.botonesIndividuales?.encendido },
            { name: 'Botón Home', value: data.botonesIndividuales?.home },
            { name: 'Botón Silencio', value: data.botonesIndividuales?.silencio },
          ];
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(11);
          buttons.forEach(item => {
            const val = item.value ? (item.value === true ? 'Funciona' : item.value) : 'No funciona';
            doc.text(`${item.name}: ${val}`, 25, y);
            y += 6;
          });
          y += 6;
          // Observations
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(14);
          doc.text('Observaciones', 20, y);
          y += 8;
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(10);
          const obsLines = doc.splitTextToSize(data.observaciones || 'Sin observaciones', 170);
          doc.text(obsLines, 25, y);
          y += obsLines.length * 5 + 6;
          // Signature
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(12);
          doc.text('Firma del Técnico:', 20, y + 10);
          doc.line(60, y + 12, 150, y + 12);
          if (data.tecnicoFirma) {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            doc.text(String(data.tecnicoFirma), 60, y + 18);
          }
          // Additional pages for images
          if (Array.isArray(data.imagenes) && data.imagenes.length > 0) {
            data.imagenes.forEach((img, idx) => {
              doc.addPage();
              doc.setFontSize(14);
              doc.setFont('helvetica', 'bold');
              doc.text(`Imagen ${idx + 1}`, 20, 20);
              try {
                doc.addImage(img, 'JPEG', 20, 28, 170, 120);
              } catch (imgErr) {
                console.warn('[Override] Error al añadir imagen al informe:', imgErr);
              }
            });
          }
          const namePart = (data.modelo || 'modelo').replace(/\s+/g, '-');
          const reportName = `informe-${namePart}-${Date.now()}.pdf`;
          await this.attemptDownload(doc, reportName);
          console.log('[Override] Informe PDF generado');
        };
        console.log('[Override] Métodos de Z8 reemplazados exitosamente');
      } else {
        console.warn('[Override] Clase Z8 no encontrada; no se aplicaron las mejoras');
      }
    } catch (err) {
      console.error('[Override] Error al aplicar las mejoras:', err);
    }
  }
  if (document.readyState === 'complete') {
    applyOverrides();
  } else {
    window.addEventListener('load', applyOverrides);
  }
})();