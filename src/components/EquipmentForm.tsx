import React, { useState, useEffect } from 'react';
import { EquipmentReport } from '../types/Equipment';
import { validateField, calculateProgress } from '../utils/validation';
import { generatePDF, generateExcel } from '../utils/reportGenerator';
import { generateEquipmentReportFixed } from '../utils/pdfGeneratorFixed';
import { saveEquipmentToDatabase } from '../utils/localStorageFixed2';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { FormField, Input, Select, Textarea, RadioGroup } from './FormField';
import { BatteryIndicator } from './BatteryIndicator';
import { ButtonsChecklist } from './ButtonsChecklist';
import { ImageUploaderFinal as ImageUploader } from './ImageUploaderFinal';
import { ProgressIndicator } from './ProgressIndicator';
import { LabelGenerator } from './LabelGenerator';
import { CSVUploader } from './CSVUploader';
import { ProductSKU } from '../types/Equipment';
import { useProductStorage } from '../utils/csvUtils';
import { FileText, Download, Save, Trash2, Calendar } from 'lucide-react';

const initialReport: Partial<EquipmentReport> = {
  fechaRecepcion: '',
  receptor: '',
  modelo: '',
  costo: 0,
  numeroSerie: '',
  almacenamiento: undefined,
  color: '',
  clasificacion: undefined,
  productoSKU: undefined,
  bateria: 50,
  estadoChassis: '',
  estadoPantalla: '',
  parlantes: undefined,
  auricular: undefined,
  pinCarga: undefined,
  todosBotonesFuncionan: false,
  botonesIndividuales: {
    volumen: false,
    encendido: false,
    home: false,
    silencio: false
  },
  faceId: undefined,
  camara: undefined,
  imagenes: [],
  observaciones: '',
  codigoBarras: '',
  fechaGeneracion: '',
  tecnicoFirma: ''
};

interface EquipmentFormProps {
  initialData?: EquipmentReport | null;
  onEquipmentSaved?: () => void;
}

export const EquipmentForm: React.FC<EquipmentFormProps> = ({ initialData, onEquipmentSaved }) => {
  const [report, setReport] = useLocalStorage<Partial<EquipmentReport>>('equipment-draft', initialReport);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  // Manejo de productos SKU
  const { saveProducts, loadProducts } = useProductStorage();
  const [loadedProducts, setLoadedProducts] = useState<ProductSKU[]>([]);
  
  // Cargar productos guardados al inicializar
  React.useEffect(() => {
    const products = loadProducts();
    setLoadedProducts(products);
  }, []);
  
  // Cargar datos iniciales para edición
  React.useEffect(() => {
    if (initialData) {
      setReport(initialData);
      // Limpiar errores al cargar datos para edición
      setErrors({});
    } else {
      setReport(initialReport);
    }
  }, [initialData]);

  // Opciones para dropdowns
  const audioOptions = [
    { value: 'Perfecto', label: 'Perfecto' },
    { value: 'Levemente Ronco', label: 'Levemente Ronco' },
    { value: 'Muy Ronco', label: 'Muy Ronco' },
    { value: 'No suena', label: 'No suena' }
  ];

  const pinOptions = [
    { value: 'Perfecto', label: 'Perfecto' },
    { value: 'Levemente Dañado', label: 'Levemente Dañado' },
    { value: 'Dañado', label: 'Dañado' }
  ];

  const faceIdOptions = [
    { value: 'Funciona', label: 'Funciona' },
    { value: 'No funciona', label: 'No funciona' }
  ];

  const camaraOptions = [
    { value: 'Perfecto', label: 'Perfecto' },
    { value: 'Manchas Imperceptibles', label: 'Manchas Imperceptibles' },
    { value: 'Lente Roto', label: 'Lente Roto' },
    { value: 'Dañada', label: 'Dañada' }
  ];

  const almacenamientoOptions = [
    { value: '32GB', label: '32GB' },
    { value: '64GB', label: '64GB' },
    { value: '128GB', label: '128GB' },
    { value: '256GB', label: '256GB' },
    { value: '512GB', label: '512GB' },
    { value: '1TB', label: '1TB' }
  ];

  const clasificacionOptions = [
    { value: 'OB', label: 'OB' },
    { value: 'TI', label: 'TI' },
    { value: 'SE', label: 'SE' },
    { value: 'RE', label: 'RE' }
  ];

  // Generar código de barras único
  useEffect(() => {
    if (!report.codigoBarras) {
      const codigo = `EQ${Date.now().toString().slice(-8)}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
      setReport(prev => ({ ...prev, codigoBarras: codigo }));
    }
  }, []);

  // Autoguardado cada 30 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setLastSaved(new Date());
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const updateField = (field: string, value: any) => {
    setReport(prev => ({ ...prev, [field]: value }));
    
    // Validar campo en tiempo real
    const error = validateField(field, value);
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const handleGeneratePDF = async () => {
    setIsGenerating(true);
    try {
      const completeReport: EquipmentReport = {
        ...report,
        fechaGeneracion: new Date().toISOString(),
      } as EquipmentReport;
      
      // Usar versión corregida y robusta
    await generateEquipmentReportFixed(completeReport);
      
      // Guardar automáticamente en la base de datos
      saveEquipmentToDatabase(completeReport);
      
      // Actualizar el reporte con los nuevos datos
      setReport(completeReport);
      
      // Notificar que se guardó el equipo
      if (onEquipmentSaved) {
        onEquipmentSaved();
      }
      
      alert('✅ Reporte PDF generado y equipo guardado en la base de datos.');
      
    } catch (error) {
      console.error('Error generando PDF:', error);
      alert('Error al generar el reporte PDF. Por favor, inténtalo de nuevo.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateExcel = () => {
    try {
      const completeReport: EquipmentReport = {
        ...report,
        fechaGeneracion: new Date().toISOString(),
      } as EquipmentReport;
      
      generateExcel(completeReport);
      
      // Guardar automáticamente en la base de datos
      saveEquipmentToDatabase(completeReport);
      
      // Actualizar el reporte con los nuevos datos
      setReport(completeReport);
      
      // Notificar que se guardó el equipo
      if (onEquipmentSaved) {
        onEquipmentSaved();
      }
      
      alert('✅ Reporte Excel generado y equipo guardado en la base de datos.');
      
    } catch (error) {
      console.error('Error generando Excel:', error);
      alert('Error al generar el reporte Excel. Por favor, inténtalo de nuevo.');
    }
  };

  const clearForm = () => {
    if (confirm('¿Estás seguro de que deseas limpiar todo el formulario?')) {
      setReport(initialReport);
      setErrors({});
      setLastSaved(null);
    }
  };
  
  // Manejar carga de productos
  const handleProductsLoaded = (products: ProductSKU[]) => {
    setLoadedProducts(products);
    saveProducts(products);
    
    // Si no hay productos, limpiar la selección de producto SKU
    if (products.length === 0 && report.productoSKU) {
      setReport(prev => ({ ...prev, productoSKU: undefined }));
    }
  };
  
  // Opciones para el dropdown de productos SKU
  const productSKUOptions = loadedProducts.map(product => ({
    value: JSON.stringify(product),
    label: `${product.nombre} (SKU: ${product.sku})`
  }));

  const progress = calculateProgress(report, loadedProducts.length > 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <img 
                src="/images/logo/company-logo.png" 
                alt="Logo" 
                className="h-12 w-auto" 
              />
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Sistema de Informes Técnicos
                </h1>
                <p className="text-blue-200">
                  Generación de reportes profesionales de equipos
                </p>
              </div>
            </div>
            
            {lastSaved && (
              <div className="text-blue-200 text-sm">
                <div className="flex items-center space-x-2">
                  <Save className="w-4 h-4" />
                  <span>Guardado: {lastSaved.toLocaleTimeString('es-ES')}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Indicador de progreso - Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <ProgressIndicator 
                completedFields={progress.completedFields}
                totalFields={progress.totalFields}
                percentage={progress.percentage}
              />
              
              {/* Botones de acción */}
              <div className="mt-6 space-y-3">
                <button
                  onClick={handleGeneratePDF}
                  disabled={isGenerating || progress.percentage < 100}
                  className="w-full flex items-center justify-center space-x-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                >
                  <FileText className="w-5 h-5" />
                  <span>{isGenerating ? 'Generando...' : 'Generar PDF'}</span>
                </button>
                
                <button
                  onClick={handleGenerateExcel}
                  disabled={progress.percentage < 100}
                  className="w-full flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                >
                  <Download className="w-5 h-5" />
                  <span>Exportar Excel</span>
                </button>
                
                <LabelGenerator 
                  report={report}
                  disabled={isGenerating}
                />
                
                <button
                  onClick={clearForm}
                  className="w-full flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                  <span>Limpiar Formulario</span>
                </button>
              </div>
              
              {report.codigoBarras && (
                <div className="mt-6 p-4 bg-white border border-gray-200 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Código de Equipo</h4>
                  <p className="text-lg font-mono text-blue-600 font-bold">{report.codigoBarras}</p>
                </div>
              )}
            </div>
          </div>

          {/* Formulario principal */}
          <div className="lg:col-span-3">
            <form className="space-y-8">
              {/* Sección 1: Información Básica */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center space-x-2">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold">1</span>
                  </div>
                  <span>Información Básica</span>
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField label="Fecha de Recepción" required error={errors.fechaRecepcion}>
                    <div className="relative">
                      <Input
                        type="date"
                        value={report.fechaRecepcion || ''}
                        onChange={(e) => updateField('fechaRecepcion', e.target.value)}
                        error={!!errors.fechaRecepcion}
                      />
                      <Calendar className="absolute right-3 top-3 w-5 h-5 text-gray-400 pointer-events-none" />
                    </div>
                  </FormField>
                  
                  <FormField label="Receptor" required error={errors.receptor}>
                    <Input
                      type="text"
                      placeholder="Nombre del receptor"
                      value={report.receptor || ''}
                      onChange={(e) => updateField('receptor', e.target.value)}
                      error={!!errors.receptor}
                    />
                  </FormField>
                  
                  <FormField label="Modelo del Equipo" required error={errors.modelo}>
                    <Input
                      type="text"
                      placeholder="Ej: iPhone 14 Pro, Samsung Galaxy S23"
                      value={report.modelo || ''}
                      onChange={(e) => updateField('modelo', e.target.value)}
                      error={!!errors.modelo}
                    />
                  </FormField>
                  
                  <FormField label="Número de Serie" required error={errors.numeroSerie}>
                    <Input
                      type="text"
                      placeholder="Número de serie del equipo"
                      value={report.numeroSerie || ''}
                      onChange={(e) => updateField('numeroSerie', e.target.value)}
                      error={!!errors.numeroSerie}
                    />
                  </FormField>
                  
                  <FormField label="Almacenamiento" required error={errors.almacenamiento}>
                    <Select
                      options={almacenamientoOptions}
                      value={report.almacenamiento || ''}
                      onChange={(e) => updateField('almacenamiento', e.target.value)}
                      error={!!errors.almacenamiento}
                    />
                  </FormField>
                  
                  <FormField label="Color del Equipo" required error={errors.color}>
                    <Input
                      type="text"
                      placeholder="Ej: Negro, Blanco, Azul"
                      value={report.color || ''}
                      onChange={(e) => updateField('color', e.target.value)}
                      error={!!errors.color}
                    />
                  </FormField>
                  
                  <FormField label="Clasificación" required error={errors.clasificacion}>
                    <Select
                      options={clasificacionOptions}
                      value={report.clasificacion || ''}
                      onChange={(e) => updateField('clasificacion', e.target.value)}
                      error={!!errors.clasificacion}
                    />
                  </FormField>
                  
                  <FormField label="Costo" required error={errors.costo}>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-gray-500">$</span>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={report.costo || ''}
                        onChange={(e) => updateField('costo', Number(e.target.value))}
                        error={!!errors.costo}
                        className="pl-8"
                      />
                    </div>
                  </FormField>
                  
                  {/* Campo de Producto SKU (si hay productos cargados) */}
                  {loadedProducts.length > 0 && (
                    <FormField label="Producto con SKU" error={errors.productoSKU}>
                      <Select
                        options={productSKUOptions}
                        value={report.productoSKU ? JSON.stringify(report.productoSKU) : ''}
                        onChange={(e) => {
                          if (e.target.value) {
                            try {
                              const product = JSON.parse(e.target.value);
                              updateField('productoSKU', product);
                            } catch (error) {
                              console.error('Error parseando producto SKU:', error);
                            }
                          } else {
                            updateField('productoSKU', undefined);
                          }
                        }}
                        error={!!errors.productoSKU}
                      />
                    </FormField>
                  )}
                </div>
                
                {/* Cargador de CSV */}
                <div className="mt-6">
                  <CSVUploader
                    onProductsLoaded={handleProductsLoaded}
                    loadedProducts={loadedProducts}
                  />
                </div>
              </div>

              {/* Sección 2: Estado del Equipo */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center space-x-2">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-bold">2</span>
                  </div>
                  <span>Estado del Equipo</span>
                </h2>
                
                <div className="space-y-6">
                  <BatteryIndicator
                    level={report.bateria || 50}
                    onChange={(level) => updateField('bateria', level)}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField label="Estado del Chassis" required error={errors.estadoChassis}>
                      <Textarea
                        placeholder="Describe el estado físico del chassis..."
                        value={report.estadoChassis || ''}
                        onChange={(e) => updateField('estadoChassis', e.target.value)}
                        error={!!errors.estadoChassis}
                      />
                    </FormField>
                    
                    <FormField label="Estado de la Pantalla" required error={errors.estadoPantalla}>
                      <Textarea
                        placeholder="Describe el estado de la pantalla..."
                        value={report.estadoPantalla || ''}
                        onChange={(e) => updateField('estadoPantalla', e.target.value)}
                        error={!!errors.estadoPantalla}
                      />
                    </FormField>
                  </div>
                </div>
              </div>

              {/* Sección 3: Componentes */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center space-x-2">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 font-bold">3</span>
                  </div>
                  <span>Componentes</span>
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField label="Estado de Parlantes">
                    <Select
                      options={audioOptions}
                      value={report.parlantes || ''}
                      onChange={(e) => updateField('parlantes', e.target.value)}
                    />
                  </FormField>
                  
                  <FormField label="Estado del Auricular">
                    <Select
                      options={audioOptions}
                      value={report.auricular || ''}
                      onChange={(e) => updateField('auricular', e.target.value)}
                    />
                  </FormField>
                  
                  <FormField label="Estado del Pin de Carga">
                    <Select
                      options={pinOptions}
                      value={report.pinCarga || ''}
                      onChange={(e) => updateField('pinCarga', e.target.value)}
                    />
                  </FormField>
                  
                  <FormField label="Estado de la Cámara">
                    <Select
                      options={camaraOptions}
                      value={report.camara || ''}
                      onChange={(e) => updateField('camara', e.target.value)}
                    />
                  </FormField>
                </div>
                
                <div className="mt-6">
                  <FormField label="Face ID">
                    <RadioGroup
                      name="faceId"
                      options={faceIdOptions}
                      value={report.faceId || ''}
                      onChange={(value) => updateField('faceId', value)}
                    />
                  </FormField>
                </div>
              </div>

              {/* Sección 4: Botones */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center space-x-2">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-orange-600 font-bold">4</span>
                  </div>
                  <span>Botones y Controles</span>
                </h2>
                
                <ButtonsChecklist
                  todosFuncionan={report.todosBotonesFuncionan || false}
                  botonesIndividuales={report.botonesIndividuales || {
                    volumen: false,
                    encendido: false,
                    home: false,
                    silencio: false
                  }}
                  onTodosFuncionanChange={(value) => updateField('todosBotonesFuncionan', value)}
                  onBotonIndividualChange={(boton, value) => {
                    updateField('botonesIndividuales', {
                      ...report.botonesIndividuales,
                      [boton]: value
                    });
                  }}
                />
              </div>

              {/* Sección 5: Información Adicional */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center space-x-2">
                  <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                    <span className="text-teal-600 font-bold">5</span>
                  </div>
                  <span>Información Adicional</span>
                </h2>
                
                <div className="space-y-6">
                  <ImageUploader
                    images={report.imagenes || []}
                    onImagesChange={(images) => updateField('imagenes', images)}
                  />
                  
                  <FormField label="Observaciones">
                    <Textarea
                      placeholder="Comentarios adicionales, observaciones especiales, recomendaciones..."
                      value={report.observaciones || ''}
                      onChange={(e) => updateField('observaciones', e.target.value)}
                      className="min-h-[120px]"
                    />
                  </FormField>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};