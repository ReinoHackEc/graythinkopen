import React, { useState, useEffect } from 'react';
import { EquipmentForm } from './components/EquipmentForm';
import { EquipmentDatabase } from './components/EquipmentDatabase';
import { Navigation } from './components/Navigation';
import { EquipmentReport } from './types/Equipment';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState<'form' | 'database'>('form');
  const [editingEquipment, setEditingEquipment] = useState<EquipmentReport | null>(null);
  
  // Limpiar localStorage corrupto al inicio y manejar errores globales
  useEffect(() => {
    try {
      // Verificar y limpiar datos de localStorage que puedan estar corruptos
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.includes('draft') || key.includes('temp')) {
          try {
            const data = localStorage.getItem(key);
            if (data && data.includes('ZHVtbXkgYW1hZ2U')) {
              console.warn(`Limpiando localStorage corrupto: ${key}`);
              localStorage.removeItem(key);
            }
          } catch (error) {
            console.warn(`Error verificando localStorage ${key}:`, error);
            localStorage.removeItem(key);
          }
        }
      });
    } catch (error) {
      console.warn('Error durante limpieza de localStorage:', error);
    }
    
    // Manejar errores JavaScript globales
    const handleGlobalError = (event: ErrorEvent) => {
      console.error('Error JavaScript global:', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
      });
      // Prevenir que el error se propague y cause problemas
      event.preventDefault();
    };
    
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Promise rechazada no manejada:', event.reason);
      // Prevenir que la promesa rechazada cause problemas
      event.preventDefault();
    };
    
    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    
    // Limpiar event listeners al desmontar
    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  const handleEditEquipment = (equipment: EquipmentReport) => {
    setEditingEquipment(equipment);
    setActiveTab('form');
  };

  const handleTabChange = (tab: 'form' | 'database') => {
    setActiveTab(tab);
    if (tab === 'form' && !editingEquipment) {
      // Limpiar equipo en edición solo si vamos al formulario sin editar
      setEditingEquipment(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header corporativo */}
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
                  Generación de reportes profesionales de equipos con base de datos integrada
                </p>
              </div>
            </div>
            
            <div className="text-blue-200 text-sm text-right">
              <div className="font-medium">Versión 2.0</div>
              <div>Con Base de Datos y Códigos SKU</div>
            </div>
          </div>
        </div>
      </div>

      {/* Navegación */}
      <Navigation activeTab={activeTab} onTabChange={handleTabChange} />

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'form' ? (
          <div>
            {editingEquipment && (
              <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-blue-900">
                      Editando: {editingEquipment.modelo}
                    </h3>
                    <p className="text-blue-700 text-sm">
                      Código: {editingEquipment.codigoBarras}
                    </p>
                  </div>
                  <button
                    onClick={() => setEditingEquipment(null)}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Nuevo Informe
                  </button>
                </div>
              </div>
            )}
            <EquipmentForm 
              initialData={editingEquipment}
              onEquipmentSaved={() => setEditingEquipment(null)}
            />
          </div>
        ) : (
          <EquipmentDatabase onEditEquipment={handleEditEquipment} />
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h4 className="text-lg font-semibold mb-3">Características</h4>
              <ul className="space-y-2 text-gray-300">
                <li>• Formularios inteligentes con validación</li>
                <li>• Generación de PDF con imágenes</li>
                <li>• Exportación Excel tabular</li>
                <li>• Base de datos local integrada</li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-3">Funcionalidades</h4>
              <ul className="space-y-2 text-gray-300">
                <li>• Códigos de barras automáticos</li>
                <li>• Integración SKU con CSV</li>
                <li>• Etiquetas imprimibles 50x25mm</li>
                <li>• Búsqueda y filtrado avanzado</li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-3">Sistema</h4>
              <ul className="space-y-2 text-gray-300">
                <li>• Almacenamiento local persistente</li>
                <li>• Diseño responsive profesional</li>
                <li>• Interfaz intuitiva para técnicos</li>
                <li>• Reportes de calidad corporativa</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Sistema de Informes Técnicos. Desarrollado por MiniMax Agent.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;