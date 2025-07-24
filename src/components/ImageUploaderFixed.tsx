import React, { useState, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, AlertCircle } from 'lucide-react';

interface ImageUploaderProps {
  images: File[];
  onImagesChange: (images: File[]) => void;
  maxImages?: number;
  maxFileSize?: number; // en bytes
}

interface ProcessedImage {
  file: File;
  preview: string;
  isValid: boolean;
  error?: string;
}

export const ImageUploaderFixed: React.FC<ImageUploaderProps> = ({
  images,
  onImagesChange,
  maxImages = 5,
  maxFileSize = 10 * 1024 * 1024 // 10MB por defecto
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [processedImages, setProcessedImages] = useState<ProcessedImage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Procesar imagen usando SOLO FileReader del lado del cliente
  const processImageClientSide = (file: File): Promise<ProcessedImage> => {
    return new Promise((resolve) => {
      console.log('🖼️ Procesando imagen:', file.name);
      
      // Validaciones básicas
      if (!file.type.startsWith('image/')) {
        resolve({
          file,
          preview: '',
          isValid: false,
          error: 'Archivo no es una imagen válida'
        });
        return;
      }
      
      if (file.size > maxFileSize) {
        resolve({
          file,
          preview: '',
          isValid: false,
          error: `Archivo muy grande (${(file.size / 1024 / 1024).toFixed(1)}MB). Máximo ${(maxFileSize / 1024 / 1024).toFixed(1)}MB`
        });
        return;
      }
      
      // Usar FileReader para procesar completamente del lado del cliente
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const dataURL = e.target?.result as string;
          
          if (!dataURL || !dataURL.startsWith('data:image/')) {
            resolve({
              file,
              preview: '',
              isValid: false,
              error: 'Error procesando imagen'
            });
            return;
          }
          
          // Crear imagen para validar dimensiones
          const img = new Image();
          
          img.onload = () => {
            // Validar dimensiones mínimas
            if (img.width < 50 || img.height < 50) {
              resolve({
                file,
                preview: dataURL,
                isValid: false,
                error: 'Imagen muy pequeña (mínimo 50x50px)'
              });
              return;
            }
            
            // Imagen válida
            console.log(`✅ Imagen procesada: ${img.width}x${img.height}px`);
            resolve({
              file,
              preview: dataURL,
              isValid: true
            });
          };
          
          img.onerror = () => {
            resolve({
              file,
              preview: '',
              isValid: false,
              error: 'Formato de imagen no soportado'
            });
          };
          
          // Cargar imagen para validación
          img.src = dataURL;
          
        } catch (error) {
          console.error('Error en FileReader:', error);
          resolve({
            file,
            preview: '',
            isValid: false,
            error: 'Error leyendo archivo'
          });
        }
      };
      
      reader.onerror = () => {
        resolve({
          file,
          preview: '',
          isValid: false,
          error: 'Error leyendo archivo'
        });
      };
      
      // Leer archivo como Data URL
      reader.readAsDataURL(file);
    });
  };

  // Procesar múltiples archivos
  const processFiles = async (files: FileList | File[]) => {
    setIsProcessing(true);
    console.log(`🚀 Procesando ${files.length} archivos...`);
    
    try {
      const fileArray = Array.from(files);
      const limitedFiles = fileArray.slice(0, maxImages);
      
      // Procesar todas las imágenes en paralelo
      const processedResults = await Promise.all(
        limitedFiles.map(file => processImageClientSide(file))
      );
      
      setProcessedImages(processedResults);
      
      // Filtrar solo imágenes válidas para el callback
      const validImages = processedResults
        .filter(result => result.isValid)
        .map(result => result.file);
      
      onImagesChange(validImages);
      
      console.log(`✅ Procesamiento completado. Válidas: ${validImages.length}/${processedResults.length}`);
      
    } catch (error) {
      console.error('❌ Error procesando archivos:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Manejar drop de archivos
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files?.length > 0) {
      processFiles(files);
    }
  }, [maxImages, onImagesChange]);

  // Manejar drag over
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }, []);

  // Manejar drag leave
  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  // Manejar selección de archivos
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files?.length > 0) {
      processFiles(files);
    }
  };

  // Remover imagen
  const removeImage = (index: number) => {
    const newProcessedImages = processedImages.filter((_, i) => i !== index);
    setProcessedImages(newProcessedImages);
    
    const validImages = newProcessedImages
      .filter(result => result.isValid)
      .map(result => result.file);
    
    onImagesChange(validImages);
  };

  return (
    <div className="space-y-4">
      {/* Área de carga */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive
            ? 'border-orange-500 bg-orange-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          id="image-upload"
          disabled={isProcessing}
        />
        
        <label htmlFor="image-upload" className="cursor-pointer">
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-700 mb-2">
            {isProcessing ? 'Procesando imágenes...' : 'Arrastra imágenes aquí'}
          </p>
          <p className="text-sm text-gray-500">
            o haz clic para seleccionar archivos
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Máximo {maxImages} imágenes, {(maxFileSize / 1024 / 1024).toFixed(1)}MB por archivo
          </p>
        </label>
      </div>

      {/* Preview de imágenes procesadas */}
      {processedImages.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {processedImages.map((processed, index) => (
            <div key={index} className="relative group">
              <div className={`border rounded-lg overflow-hidden ${
                processed.isValid ? 'border-green-200' : 'border-red-200'
              }`}>
                {processed.isValid && processed.preview ? (
                  <>
                    <img
                      src={processed.preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover"
                    />
                    <div className="p-2">
                      <p className="text-xs text-gray-600 truncate">
                        {processed.file.name}
                      </p>
                      <p className="text-xs text-green-600">
                        ✅ Válida ({(processed.file.size / 1024).toFixed(1)}KB)
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="h-32 flex items-center justify-center bg-red-50">
                    <div className="text-center">
                      <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                      <p className="text-xs text-red-600 px-2">
                        {processed.error || 'Error desconocido'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Botón para remover */}
              <button
                onClick={() => removeImage(index)}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Indicador de progreso */}
      {isProcessing && (
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 text-orange-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600"></div>
            <span className="text-sm">Procesando imágenes...</span>
          </div>
        </div>
      )}

      {/* Resumen */}
      {processedImages.length > 0 && (
        <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1">
              <ImageIcon className="w-4 h-4" />
              <span>Total: {processedImages.length}</span>
            </span>
            <span className="text-green-600">
              ✅ Válidas: {processedImages.filter(p => p.isValid).length}
            </span>
            {processedImages.some(p => !p.isValid) && (
              <span className="text-red-600">
                ❌ Inválidas: {processedImages.filter(p => !p.isValid).length}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploaderFixed;
