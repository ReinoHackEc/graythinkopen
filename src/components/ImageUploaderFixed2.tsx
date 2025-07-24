import React, { useState, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, AlertCircle } from 'lucide-react';

interface ImageUploaderProps {
  images: File[];
  onImagesChange: (images: File[]) => void;
  maxImages?: number;
  maxFileSize?: number;
}

interface ProcessedImage {
  file: File;
  preview: string;
  isValid: boolean;
  error?: string;
}

export const ImageUploaderFixed2: React.FC<ImageUploaderProps> = ({
  images,
  onImagesChange,
  maxImages = 5,
  maxFileSize = 10 * 1024 * 1024
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [processedImages, setProcessedImages] = useState<ProcessedImage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Versión simplificada y robusta del procesamiento
  const processImageRobust = (file: File): Promise<ProcessedImage> => {
    return new Promise((resolve) => {
      console.log('🔧 [FIXED] Procesando imagen:', file.name, 'Tamaño:', file.size);
      
      // Validaciones básicas más permisivas
      if (!file.type || !file.type.includes('image')) {
        console.warn('⚠️ Tipo no válido:', file.type);
        resolve({
          file,
          preview: '',
          isValid: false,
          error: `Tipo no válido: ${file.type}`
        });
        return;
      }
      
      if (file.size > maxFileSize) {
        resolve({
          file,
          preview: '',
          isValid: false,
          error: `Archivo muy grande: ${(file.size / 1024 / 1024).toFixed(1)}MB`
        });
        return;
      }
      
      // Usar URL.createObjectURL para better performance
      try {
        const objectURL = URL.createObjectURL(file);
        
        // Crear imagen para validar que se puede cargar
        const img = new Image();
        
        img.onload = () => {
          console.log(`✅ [FIXED] Imagen cargada exitosamente: ${img.width}x${img.height}px`);
          
          // Validaciones de dimensiones más permisivas
          if (img.width < 10 || img.height < 10) {
            URL.revokeObjectURL(objectURL);
            resolve({
              file,
              preview: '',
              isValid: false,
              error: `Dimensiones muy pequeñas: ${img.width}x${img.height}px`
            });
            return;
          }
          
          // Si llegamos aquí, la imagen es válida
          resolve({
            file,
            preview: objectURL,
            isValid: true
          });
        };
        
        img.onerror = (error) => {
          console.error('❌ [FIXED] Error cargando imagen:', error);
          URL.revokeObjectURL(objectURL);
          resolve({
            file,
            preview: '',
            isValid: false,
            error: 'Error cargando imagen'
          });
        };
        
        // Asignar src para triggear carga
        img.src = objectURL;
        
      } catch (error) {
        console.error('❌ [FIXED] Error creando object URL:', error);
        resolve({
          file,
          preview: '',
          isValid: false,
          error: 'Error procesando archivo'
        });
      }
    });
  };

  const processFiles = async (files: FileList | File[]) => {
    setIsProcessing(true);
    console.log(`🚀 [FIXED] Procesando ${files.length} archivos...`);
    
    try {
      const fileArray = Array.from(files);
      const limitedFiles = fileArray.slice(0, maxImages);
      
      const processedResults: ProcessedImage[] = [];
      
      // Procesar uno por uno para mejor debugging
      for (const file of limitedFiles) {
        const result = await processImageRobust(file);
        processedResults.push(result);
        console.log(`📊 [FIXED] Resultado ${file.name}:`, result.isValid ? '✅ Válida' : `❌ ${result.error}`);
      }
      
      setProcessedImages(processedResults);
      
      const validImages = processedResults
        .filter(result => result.isValid)
        .map(result => result.file);
      
      console.log(`✅ [FIXED] Procesamiento completado. Válidas: ${validImages.length}/${processedResults.length}`);
      onImagesChange(validImages);
      
    } catch (error) {
      console.error('❌ [FIXED] Error procesando archivos:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files?.length > 0) {
      console.log('📁 [FIXED] Archivos dropeados:', files.length);
      processFiles(files);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files?.length > 0) {
      console.log('📁 [FIXED] Archivos seleccionados:', files.length);
      processFiles(files);
    }
  };

  const removeImage = (index: number) => {
    const imageToRemove = processedImages[index];
    if (imageToRemove.preview && imageToRemove.preview.startsWith('blob:')) {
      URL.revokeObjectURL(imageToRemove.preview);
    }
    
    const newProcessedImages = processedImages.filter((_, i) => i !== index);
    setProcessedImages(newProcessedImages);
    
    const validImages = newProcessedImages
      .filter(result => result.isValid)
      .map(result => result.file);
    
    onImagesChange(validImages);
  };

  return (
    <div className="space-y-4">
      {/* Área de carga con mejor feedback */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 ${
          dragActive
            ? 'border-orange-500 bg-orange-50 scale-105'
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
        } ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          type="file"
          multiple
          accept="image/*,.jpg,.jpeg,.png,.gif,.webp,.bmp"
          onChange={handleFileSelect}
          className="hidden"
          id="image-upload-fixed"
          disabled={isProcessing}
        />
        
        <label htmlFor="image-upload-fixed" className="cursor-pointer block">
          <Upload className={`w-12 h-12 mx-auto mb-4 transition-colors ${
            dragActive ? 'text-orange-500' : 'text-gray-400'
          }`} />
          <p className="text-lg font-medium text-gray-700 mb-2">
            {isProcessing ? '🔄 Procesando imágenes...' : '📸 Arrastra imágenes aquí'}
          </p>
          <p className="text-sm text-gray-500">
            o haz clic para seleccionar archivos
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Máximo {maxImages} imágenes • {(maxFileSize / 1024 / 1024).toFixed(1)}MB por archivo
          </p>
          <p className="text-xs text-green-600 mt-1">
            ✅ Soporta: JPG, PNG, GIF, WebP, BMP
          </p>
        </label>
      </div>

      {/* Preview mejorado */}
      {processedImages.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {processedImages.map((processed, index) => (
            <div key={index} className="relative group bg-white rounded-lg shadow-sm border">
              <div className={`border-2 rounded-lg overflow-hidden transition-all ${
                processed.isValid 
                  ? 'border-green-200 hover:border-green-300' 
                  : 'border-red-200 hover:border-red-300'
              }`}>
                {processed.isValid && processed.preview ? (
                  <>
                    <div className="relative">
                      <img
                        src={processed.preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover"
                        onError={(e) => {
                          console.error('Error cargando preview:', e);
                        }}
                      />
                      <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                        ✅ OK
                      </div>
                    </div>
                    <div className="p-3">
                      <p className="text-xs text-gray-600 truncate font-medium">
                        {processed.file.name}
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        📦 {(processed.file.size / 1024).toFixed(1)}KB
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="h-32 flex items-center justify-center bg-red-50">
                    <div className="text-center p-3">
                      <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                      <p className="text-xs text-red-600 break-words">
                        {processed.error || 'Error desconocido'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {processed.file.name}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Botón mejorado para remover */}
              <button
                onClick={() => removeImage(index)}
                className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center shadow-lg"
                title="Eliminar imagen"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Indicador de progreso mejorado */}
      {isProcessing && (
        <div className="text-center bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="inline-flex items-center space-x-3 text-orange-700">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-600"></div>
            <span className="text-sm font-medium">Procesando imágenes...</span>
          </div>
        </div>
      )}

      {/* Resumen detallado */}
      {processedImages.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm">
              <span className="flex items-center space-x-2">
                <ImageIcon className="w-4 h-4 text-gray-600" />
                <span className="font-medium">Total: {processedImages.length}</span>
              </span>
              <span className="flex items-center space-x-1 text-green-600">
                <span>✅</span>
                <span className="font-medium">Válidas: {processedImages.filter(p => p.isValid).length}</span>
              </span>
              {processedImages.some(p => !p.isValid) && (
                <span className="flex items-center space-x-1 text-red-600">
                  <span>❌</span>
                  <span className="font-medium">Errores: {processedImages.filter(p => !p.isValid).length}</span>
                </span>
              )}
            </div>
            
            {processedImages.filter(p => p.isValid).length > 0 && (
              <div className="text-xs text-green-600 font-medium">
                ✅ Listo para PDF
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploaderFixed2;
