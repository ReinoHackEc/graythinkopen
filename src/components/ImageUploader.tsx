import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface ImageUploaderProps {
  images: File[];
  onImagesChange: (images: File[]) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ images, onImagesChange }) => {
  const [previews, setPreviews] = useState<string[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Validar archivos antes de procesarlos
    const validFiles = acceptedFiles.filter(file => {
      // Verificar que sea una imagen real
      if (!file.type.startsWith('image/')) return false;
      if (file.size === 0 || file.size > 50 * 1024 * 1024) return false; // Max 50MB
      return true;
    });
    
    if (validFiles.length === 0) {
      alert('Por favor selecciona archivos de imagen válidos (JPG, PNG, GIF, WebP, máximo 50MB)');
      return;
    }
    
    const newImages = [...images, ...validFiles];
    onImagesChange(newImages);
    
    // Generar previews con manejo de errores
    validFiles.forEach((file, index) => {
      const reader = new FileReader();
      
      reader.onload = () => {
        try {
          const result = reader.result as string;
          // Validar que el resultado no sea datos dummy
          if (result && !result.includes('ZHVtbXkgaW1hZ2U') && result.startsWith('data:image/')) {
            setPreviews(prev => [...prev, result]);
          } else {
            console.warn('Imagen inválida detectada, omitiendo preview');
          }
        } catch (error) {
          console.warn('Error procesando preview de imagen:', error);
        }
      };
      
      reader.onerror = () => {
        console.warn('Error leyendo archivo de imagen:', file.name);
      };
      
      try {
        reader.readAsDataURL(file);
      } catch (error) {
        console.warn('Error iniciando lectura de archivo:', error);
      }
    });
  }, [images, onImagesChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    multiple: true
  });

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    onImagesChange(newImages);
    setPreviews(newPreviews);
  };

  // Generar previews iniciales si hay imágenes
  React.useEffect(() => {
    if (images.length > 0 && previews.length === 0) {
      images.forEach(file => {
        const reader = new FileReader();
        reader.onload = () => {
          setPreviews(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  }, [images]);

  return (
    <div className="space-y-4">
      <label className="block text-sm font-semibold text-gray-700">
        Imágenes del Equipo
      </label>
      
      {/* Área de drag & drop */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-300 ${
          isDragActive
            ? 'border-orange-400 bg-orange-50'
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
        }`}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center space-y-4">
          <div className={`p-4 rounded-full ${
            isDragActive ? 'bg-orange-100' : 'bg-gray-100'
          }`}>
            <Upload className={`w-8 h-8 ${
              isDragActive ? 'text-orange-500' : 'text-gray-500'
            }`} />
          </div>
          
          <div>
            <p className="text-lg font-medium text-gray-700">
              {isDragActive ? 'Suelta las imágenes aquí' : 'Arrastra imágenes o haz clic para seleccionar'}
            </p>
            <p className="text-sm text-gray-500">
              Soporta JPG, PNG, GIF, WebP (múltiples archivos)
            </p>
          </div>
        </div>
      </div>
      
      {/* Previsualización de imágenes */}
      {images.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">
            Imágenes adjuntas ({images.length})
          </h4>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((file, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square bg-gray-100 border border-gray-200 rounded-lg overflow-hidden">
                  {previews[index] ? (
                    <img
                      src={previews[index]}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>
                
                {/* Botón de eliminar */}
                <button
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  title="Eliminar imagen"
                >
                  <X className="w-4 h-4" />
                </button>
                
                {/* Nombre del archivo */}
                <p className="mt-1 text-xs text-gray-500 truncate" title={file.name}>
                  {file.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};