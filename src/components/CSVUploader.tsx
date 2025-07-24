import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, X, CheckCircle, AlertCircle, Download, Clock, AlertTriangle } from 'lucide-react';
import { ProductSKU } from '../types/Equipment';

interface CSVUploaderProps {
  onProductsLoaded: (products: ProductSKU[]) => void;
  loadedProducts: ProductSKU[];
}

interface ProcessingStats {
  totalLines: number;
  processedLines: number;
  validProducts: number;
  duplicates: number;
  errors: string[];
}

export const CSVUploader: React.FC<CSVUploaderProps> = ({ onProductsLoaded, loadedProducts }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [processingStats, setProcessingStats] = useState<ProcessingStats | null>(null);
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);

  const parseCSVAsync = async (csvText: string): Promise<{ products: ProductSKU[], stats: ProcessingStats }> => {
    return new Promise((resolve, reject) => {
      // Usar setTimeout para hacer el procesamiento asíncrono
      setTimeout(() => {
        try {
          const lines = csvText.trim().split('\n');
          
          if (lines.length < 2) {
            reject(new Error('El archivo CSV debe contener al menos una fila de encabezados y una fila de datos'));
            return;
          }

          // Verificar encabezados
          const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
          if (headers.length !== 2 || !headers.includes('sku') || !headers.includes('nombre')) {
            reject(new Error('El archivo CSV debe tener exactamente 2 columnas: SKU, Nombre'));
            return;
          }

          const products: ProductSKU[] = [];
          const seenSKUs = new Set<string>();
          const errors: string[] = [];
          let duplicates = 0;
          
          const stats: ProcessingStats = {
            totalLines: lines.length - 1, // Excluir header
            processedLines: 0,
            validProducts: 0,
            duplicates: 0,
            errors: []
          };
          
          for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            
            // Saltar líneas vacías
            if (!line) {
              stats.processedLines++;
              continue;
            }
            
            const values = line.split(',');
            
            if (values.length !== 2) {
              const errorMsg = `Fila ${i + 1}: debe tener exactamente 2 valores separados por coma`;
              errors.push(errorMsg);
              stats.processedLines++;
              continue;
            }

            const sku = values[0].trim();
            const nombre = values[1].trim();

            if (!sku || !nombre) {
              const errorMsg = `Fila ${i + 1}: SKU y Nombre no pueden estar vacíos`;
              errors.push(errorMsg);
              stats.processedLines++;
              continue;
            }

            // Validación flexible de SKU (1-50 caracteres, alfanumérico)
            if (sku.length < 1 || sku.length > 50) {
              const errorMsg = `Fila ${i + 1}: SKU '${sku}' debe tener entre 1 y 50 caracteres`;
              errors.push(errorMsg);
              stats.processedLines++;
              continue;
            }

            // Manejo de duplicados
            if (seenSKUs.has(sku)) {
              duplicates++;
              // Mantener solo la primera ocurrencia (o puedes cambiar esta lógica)
              stats.processedLines++;
              continue;
            }

            seenSKUs.add(sku);
            products.push({ sku, nombre });
            stats.validProducts++;
            stats.processedLines++;
          }

          stats.duplicates = duplicates;
          stats.errors = errors.slice(0, 10); // Mostrar solo los primeros 10 errores

          resolve({ products, stats });
        } catch (err) {
          reject(err);
        }
      }, 100); // Pequeño delay para no bloquear UI
    });
  };

  const processFile = async (file: File) => {
    setIsProcessing(true);
    setError(null);
    setSuccess(null);
    setProcessingStats(null);
    setShowDuplicateWarning(false);

    try {
      // Verificar tamaño del archivo (máximo 10MB)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('El archivo es demasiado grande. Máximo permitido: 10MB');
      }

      const text = await file.text();
      
      // Mostrar estadísticas de procesamiento
      const lineCount = text.split('\n').length;
      setProcessingStats({
        totalLines: lineCount - 1,
        processedLines: 0,
        validProducts: 0,
        duplicates: 0,
        errors: []
      });

      const { products, stats } = await parseCSVAsync(text);
      
      setProcessingStats(stats);
      
      if (products.length === 0) {
        throw new Error('No se encontraron productos válidos en el archivo CSV');
      }
      
      onProductsLoaded(products);
      
      let successMessage = `✅ Archivo procesado exitosamente: ${stats.validProducts} productos cargados`;
      
      if (stats.duplicates > 0) {
        successMessage += ` (${stats.duplicates} duplicados omitidos)`;
        setShowDuplicateWarning(true);
      }
      
      if (stats.errors.length > 0) {
        successMessage += ` (${stats.errors.length} errores en líneas individuales)`;
      }
      
      setSuccess(successMessage);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al procesar el archivo';
      setError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      processFile(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.csv']
    },
    multiple: false,
    maxSize: 10 * 1024 * 1024 // 10MB máximo
  });

  const clearProducts = () => {
    onProductsLoaded([]);
    setSuccess(null);
    setError(null);
    setProcessingStats(null);
    setShowDuplicateWarning(false);
  };
  
  const downloadExample = () => {
    // Crear el contenido del CSV directamente
    const csvContent = `SKU,Nombre
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
XYZ999888777,Producto Con SKU Largo
555,Tablet Genérica
ALPHA001,Monitor 4K Professional
BETA002,Teclado Mecánico RGB
GAMMA003,Mouse Gaming Inalámbrico
DELTA004,Webcam HD 1080p
EPSILON005,Micrófono USB Condensador
ZETA006,Altavoces Bluetooth Premium
A1,Producto A1 (SKU Corto)
A2,Producto A2 (SKU Corto)
A3,Producto A3 (SKU Corto)
999888777666,Producto con SKU Numérico Largo
MIX123ABC,Producto SKU Mixto
TEST_001,Producto de Prueba 1
TEST-002,Producto de Prueba 2
TEST.003,Producto de Prueba 3
456789879568575000,Producto SKU Extremadamente Largo
Z,Producto SKU Mínimo`;
    
    // Crear blob y descargar
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'ejemplo-productos-sku.csv';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-gray-700">
          Cargar Productos con SKU (Opcional)
        </label>
        {loadedProducts.length > 0 && (
          <button
            onClick={clearProducts}
            className="text-red-600 hover:text-red-800 text-sm font-medium"
            title="Limpiar productos cargados"
          >
            Limpiar
          </button>
        )}
      </div>
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <p className="text-sm text-gray-600">
          Sube un archivo CSV con columnas: SKU, Nombre (hasta 10MB, 5000+ líneas)
        </p>
        <button
          onClick={downloadExample}
          className="flex items-center space-x-1 text-orange-600 hover:text-orange-800 text-sm font-medium"
          title="Descargar archivo de ejemplo"
        >
          <Download className="w-4 h-4" />
          <span>Descargar ejemplo</span>
        </button>
      </div>

      {/* Área de drag & drop */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-300 ${
          isDragActive
            ? 'border-orange-400 bg-orange-50'
            : loadedProducts.length > 0
            ? 'border-green-300 bg-green-50'
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
        }`}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center space-y-3">
          <div className={`p-3 rounded-full ${
            isDragActive 
              ? 'bg-orange-100' 
              : loadedProducts.length > 0 
              ? 'bg-green-100' 
              : 'bg-gray-100'
          }`}>
            {loadedProducts.length > 0 ? (
              <CheckCircle className="w-6 h-6 text-green-600" />
            ) : (
              <Upload className={`w-6 h-6 ${
                isDragActive ? 'text-orange-500' : 'text-gray-500'
              }`} />
            )}
          </div>
          
          <div>
            <p className="text-lg font-medium text-gray-700">
              {isDragActive
                ? 'Suelta el archivo CSV aquí'
                : loadedProducts.length > 0
                ? `✅ ${loadedProducts.length} productos cargados`
                : 'Arrastra un archivo CSV o haz clic para seleccionar'
              }
            </p>
            <p className="text-sm text-gray-500">
              Formato: SKU, Nombre (máximo 10MB) | Soporta archivos grandes (3000+ líneas)
            </p>
          </div>
        </div>
      </div>

      {/* Indicador de procesamiento con estadísticas */}
      {isProcessing && processingStats && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 text-blue-600 mb-2">
            <Clock className="w-5 h-5 animate-pulse" />
            <span className="text-sm font-medium">Procesando archivo CSV...</span>
          </div>
          <div className="space-y-1 text-xs text-blue-700">
            <div>📊 Total de líneas: {processingStats.totalLines}</div>
            <div>✅ Productos válidos: {processingStats.validProducts}</div>
            {processingStats.duplicates > 0 && (
              <div>🔄 Duplicados encontrados: {processingStats.duplicates}</div>
            )}
            {processingStats.errors.length > 0 && (
              <div>⚠️ Errores en líneas: {processingStats.errors.length}</div>
            )}
          </div>
        </div>
      )}

      {/* Advertencia de duplicados */}
      {showDuplicateWarning && (
        <div className="flex items-start space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div className="text-sm">
            <span className="font-medium text-yellow-800">Duplicados detectados:</span>
            <span className="text-yellow-700 ml-1">
              Se encontraron SKUs duplicados. Solo se mantuvo la primera ocurrencia de cada SKU.
            </span>
          </div>
        </div>
      )}

      {/* Mensaje de éxito */}
      {success && (
        <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <span className="text-sm text-green-800">{success}</span>
        </div>
      )}

      {/* Mensaje de error */}
      {error && (
        <div className="flex items-start space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
          <div className="text-sm">
            <span className="font-medium text-red-800">Error:</span>
            <span className="text-red-700 ml-1">{error}</span>
          </div>
        </div>
      )}

      {/* Estadísticas detalladas del procesamiento */}
      {processingStats && !isProcessing && processingStats.errors.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            <h4 className="text-sm font-medium text-orange-800">
              Errores en el procesamiento ({processingStats.errors.length} líneas)
            </h4>
          </div>
          <div className="max-h-24 overflow-y-auto space-y-1">
            {processingStats.errors.map((error, index) => (
              <div key={index} className="text-xs text-orange-700 bg-white px-2 py-1 rounded">
                {error}
              </div>
            ))}
            {processingStats.errors.length >= 10 && (
              <div className="text-xs text-orange-600 italic">
                ... mostrando solo los primeros 10 errores
              </div>
            )}
          </div>
        </div>
      )}

      {/* Lista de productos cargados (resumen) */}
      {loadedProducts.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <FileText className="w-5 h-5 text-gray-600" />
            <h4 className="text-sm font-medium text-gray-700">
              Productos Cargados ({loadedProducts.length})
            </h4>
          </div>
          
          <div className="max-h-32 overflow-y-auto space-y-1">
            {loadedProducts.slice(0, 5).map((product, index) => (
              <div key={index} className="text-xs text-gray-600 bg-white px-2 py-1 rounded">
                <span className="font-mono">{product.sku}</span> - {product.nombre}
              </div>
            ))}
            {loadedProducts.length > 5 && (
              <div className="text-xs text-gray-500 italic">
                ... y {loadedProducts.length - 5} productos más
              </div>
            )}
          </div>
          
          <div className="mt-3 p-2 bg-orange-50 border border-orange-200 rounded text-xs text-orange-700">
            ℹ️ El campo "Producto con SKU" ahora está disponible en el formulario. Selecciónalo para incluir el código de barras en las etiquetas.
          </div>
        </div>
      )}
    </div>
  );
};