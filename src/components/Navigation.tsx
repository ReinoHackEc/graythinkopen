import React from 'react';
import { FileText, Database, Package } from 'lucide-react';

interface NavigationProps {
  activeTab: 'form' | 'database';
  onTabChange: (tab: 'form' | 'database') => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header con logo */}
        <div className="flex items-center justify-between py-3 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <img
              src="/images/logo/gray-think-logo.jpg"
              alt="Gray Think Logo"
              className="h-12 w-auto rounded shadow-sm"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <div>
              <h1 className="text-xl font-bold text-gray-900">Gray Think</h1>
              <p className="text-sm text-gray-600">Sistema de Informes de Equipos</p>
            </div>
          </div>
        </div>
        
        {/* Navegación */}
        <div className="flex space-x-8">
          <button
            onClick={() => onTabChange('form')}
            className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'form'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FileText className="w-5 h-5" />
            <span>Nuevo Informe</span>
          </button>
          
          <button
            onClick={() => onTabChange('database')}
            className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'database'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Database className="w-5 h-5" />
            <span>Base de Datos</span>
          </button>
        </div>
      </div>
    </nav>
  );
};