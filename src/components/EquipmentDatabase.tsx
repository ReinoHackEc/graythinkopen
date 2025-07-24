import React, { useState, useEffect } from 'react';
import { Search, Download, Trash2, Eye, Edit3, Calendar, Package, User, Barcode, RefreshCw, AlertCircle } from 'lucide-react';
import { EquipmentReport } from '../types/Equipment';
import {
  loadEquipmentDatabase,
  searchEquipments,
  deleteEquipmentFromDatabase,
  clearEquipmentDatabase,
  getDatabaseStats
} from '../utils/localStorageFixed2';
import { exportDatabaseToExcel } from '../utils/reportGenerator';
import { FormField, Input, Select } from './FormField';

interface EquipmentDatabaseProps {
  onEditEquipment?: (equipment: EquipmentReport) => void;
}

export const EquipmentDatabase: React.FC<EquipmentDatabaseProps> = ({ onEditEquipment }) => {
  const [equipments, setEquipments] = useState<EquipmentReport[]>([]);
  const [filteredEquipments, setFilteredEquipments] = useState<EquipmentReport[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchBy, setSearchBy] = useState('all');
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const searchOptions = [
    { value: 'all', label: 'Buscar en todos los campos' },
    { value: 'modelo', label: 'Modelo' },
    { value: 'sku', label: 'SKU' },
    { value: 'receptor', label: 'Receptor' },
    { value: 'codigo', label: 'Código de Barras' },
    { value: 'fecha', label: 'Fecha' }
  ];

  const loadData = () => {
    setIsLoading(true);
    try {
      const equipments = loadEquipmentDatabase();
      const stats = getDatabaseStats();
      
      setEquipments(equipments);
      setFilteredEquipments(equipments);
      setLastUpdated(stats.lastUpdated);
    } catch (error) {
      console.error('Error cargando equipos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const results = searchEquipments(searchQuery, searchBy);
    setFilteredEquipments(results);
  }, [searchQuery, searchBy, equipments]);

  const handleDeleteEquipment = (codigoBarras: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este equipo de la base de datos?')) {
      const success = deleteEquipmentFromDatabase(codigoBarras);
      if (success) {
        loadData();
        setSelectedEquipment(null);
        alert('Equipo eliminado exitosamente');
      } else {
        alert('Error al eliminar el equipo');
      }
    }
  };

  const handleClearDatabase = () => {
    if (confirm('¿Estás seguro de que deseas eliminar TODOS los equipos de la base de datos? Esta acción no se puede deshacer.')) {
      clearEquipmentDatabase();
      loadData();
      setSelectedEquipment(null);
      alert('Base de datos limpiada exitosamente');
    }
  };

  const handleExportDatabase = () => {
    try {
      exportDatabaseToExcel();
      alert('Base de datos exportada exitosamente');
    } catch (error) {
      console.error('Error exportando base de datos:', error);
      alert('Error al exportar la base de datos');
    }
  };

  const getStatusColor = (value: string, type: string) => {
    if (type === 'bateria') {
      const level = parseInt(value);
      if (level > 70) return 'text-green-600';
      if (level > 30) return 'text-yellow-600';
      return 'text-red-600';
    }
    
    if (['Perfecto', 'Funciona'].includes(value)) return 'text-green-600';
    if (value.includes('No') || value.includes('Dañ')) return 'text-red-600';
    if (value.includes('Leve')) return 'text-yellow-600';
    return 'text-gray-600';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Cargando base de datos...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header y estadísticas */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Package className="w-6 h-6 text-blue-600" />
              Base de Datos de Equipos
            </h2>
            <p className="text-gray-600 mt-1">
              {equipments.length} equipos registrados | Última actualización: {' '}
              {lastUpdated ? new Date(lastUpdated).toLocaleString('es-ES') : 'Nunca'}
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={loadData}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              title="Actualizar datos"
            >
              <RefreshCw className="w-4 h-4" />
              Actualizar
            </button>
            
            <button
              onClick={handleExportDatabase}
              disabled={equipments.length === 0}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                equipments.length === 0
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
              title="Exportar toda la base de datos a Excel"
            >
              <Download className="w-4 h-4" />
              Exportar Todo
            </button>
            
            <button
              onClick={handleClearDatabase}
              disabled={equipments.length === 0}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                equipments.length === 0
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
              title="Limpiar toda la base de datos"
            >
              <Trash2 className="w-4 h-4" />
              Limpiar Todo
            </button>
          </div>
        </div>
      </div>

      {/* Búsqueda y filtros */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <FormField label="Buscar equipos">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Escribe para buscar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </FormField>
          </div>
          
          <div>
            <FormField label="Buscar por">
              <Select
                options={searchOptions}
                value={searchBy}
                onChange={(e) => setSearchBy(e.target.value)}
              />
            </FormField>
          </div>
        </div>
        
        <div className="mt-4 text-sm text-gray-600">
          Mostrando {filteredEquipments.length} de {equipments.length} equipos
        </div>
      </div>

      {/* Mensaje si no hay equipos */}
      {equipments.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay equipos registrados</h3>
          <p className="text-gray-600">
            Los equipos se guardarán automáticamente cuando generes reportes desde el formulario principal.
          </p>
        </div>
      )}

      {/* Lista de equipos */}
      {filteredEquipments.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredEquipments.map((equipment) => (
            <div key={equipment.codigoBarras} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{equipment.modelo}</h3>
                  <p className="text-sm text-gray-600">Código: {equipment.codigoBarras}</p>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedEquipment(equipment)}
                    className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                    title="Ver detalles"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  
                  {onEditEquipment && (
                    <button
                      onClick={() => onEditEquipment(equipment)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Editar equipo"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleDeleteEquipment(equipment.codigoBarras)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Eliminar equipo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>{new Date(equipment.fechaRecepcion).toLocaleDateString('es-ES')}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <span>{equipment.receptor}</span>
                </div>
                
                {equipment.productoSKU && (
                  <div className="flex items-center gap-2 col-span-2">
                    <Barcode className="w-4 h-4 text-gray-400" />
                    <span className="font-mono text-xs">{equipment.productoSKU.sku}</span>
                    <span className="text-gray-600">({equipment.productoSKU.nombre})</span>
                  </div>
                )}
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="text-center">
                    <div className={`font-medium ${getStatusColor(equipment.bateria.toString(), 'bateria')}`}>
                      {equipment.bateria}%
                    </div>
                    <div className="text-gray-500">Batería</div>
                  </div>
                  
                  <div className="text-center">
                    <div className={`font-medium ${getStatusColor(equipment.camara, 'componente')}`}>
                      {equipment.camara}
                    </div>
                    <div className="text-gray-500">Cámara</div>
                  </div>
                  
                  <div className="text-center">
                    <div className={`font-medium ${getStatusColor(equipment.faceId, 'componente')}`}>
                      {equipment.faceId}
                    </div>
                    <div className="text-gray-500">Face ID</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de detalles */}
      {selectedEquipment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedEquipment.modelo}</h2>
                  <p className="text-gray-600">Código: {selectedEquipment.codigoBarras}</p>
                </div>
                
                <button
                  onClick={() => setSelectedEquipment(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Información Básica</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Fecha:</strong> {new Date(selectedEquipment.fechaRecepcion).toLocaleDateString('es-ES')}</div>
                    <div><strong>Receptor:</strong> {selectedEquipment.receptor}</div>
                    <div><strong>Número de Serie:</strong> {selectedEquipment.numeroSerie}</div>
                    <div><strong>Almacenamiento:</strong> {selectedEquipment.almacenamiento}</div>
                    <div><strong>Color:</strong> {selectedEquipment.color}</div>
                    <div><strong>Clasificación:</strong> {selectedEquipment.clasificacion}</div>
                    {selectedEquipment.productoSKU && (
                      <div><strong>SKU:</strong> {selectedEquipment.productoSKU.sku} - {selectedEquipment.productoSKU.nombre}</div>
                    )}
                    <div><strong>Costo:</strong> ${selectedEquipment.costo.toLocaleString('es-ES')}</div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-3">Estado y Componentes</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Batería:</strong> <span className={getStatusColor(selectedEquipment.bateria.toString(), 'bateria')}>{selectedEquipment.bateria}%</span></div>
                    <div><strong>Chassis:</strong> {selectedEquipment.estadoChassis}</div>
                    <div><strong>Pantalla:</strong> {selectedEquipment.estadoPantalla}</div>
                    <div><strong>Parlantes:</strong> <span className={getStatusColor(selectedEquipment.parlantes, 'componente')}>{selectedEquipment.parlantes}</span></div>
                    <div><strong>Auricular:</strong> <span className={getStatusColor(selectedEquipment.auricular, 'componente')}>{selectedEquipment.auricular}</span></div>
                    <div><strong>Pin de Carga:</strong> <span className={getStatusColor(selectedEquipment.pinCarga, 'componente')}>{selectedEquipment.pinCarga}</span></div>
                    <div><strong>Face ID:</strong> <span className={getStatusColor(selectedEquipment.faceId, 'componente')}>{selectedEquipment.faceId}</span></div>
                    <div><strong>Cámara:</strong> <span className={getStatusColor(selectedEquipment.camara, 'componente')}>{selectedEquipment.camara}</span></div>
                  </div>
                </div>
              </div>
              
              {selectedEquipment.observaciones && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-3">Observaciones</h3>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">{selectedEquipment.observaciones}</p>
                </div>
              )}
              
              {selectedEquipment.imagenes && selectedEquipment.imagenes.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-3">Imágenes ({selectedEquipment.imagenes.length})</h3>
                  <p className="text-sm text-gray-600">Las imágenes están disponibles en el reporte PDF completo.</p>
                </div>
              )}
              
              <div className="mt-6 flex gap-3">
                {onEditEquipment && (
                  <button
                    onClick={() => {
                      onEditEquipment(selectedEquipment);
                      setSelectedEquipment(null);
                    }}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    Editar Equipo
                  </button>
                )}
                
                <button
                  onClick={() => setSelectedEquipment(null)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};