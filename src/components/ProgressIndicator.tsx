import React from 'react';
import { CheckCircle, Circle } from 'lucide-react';

interface ProgressIndicatorProps {
  completedFields: number;
  totalFields: number;
  percentage: number;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  completedFields,
  totalFields,
  percentage
}) => {
  const getProgressColor = () => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 50) return 'bg-orange-500';
    return 'bg-yellow-500';
  };

  const getProgressTextColor = () => {
    if (percentage >= 80) return 'text-green-700';
    if (percentage >= 50) return 'text-blue-700';
    return 'text-yellow-700';
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Progreso del Formulario
        </h3>
        <div className={`flex items-center space-x-2 ${getProgressTextColor()}`}>
          {percentage === 100 ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <Circle className="w-5 h-5" />
          )}
          <span className="font-bold text-lg">{percentage}%</span>
        </div>
      </div>
      
      {/* Barra de progreso */}
      <div className="mb-4">
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className={`h-3 rounded-full transition-all duration-500 ease-out ${getProgressColor()}`}
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>
      
      {/* Detalles */}
      <div className="flex justify-between items-center text-sm text-gray-600">
        <span>
          {completedFields} de {totalFields} campos completados
        </span>
        <span>
          {totalFields - completedFields} restantes
        </span>
      </div>
      
      {/* Mensaje motivacional */}
      {percentage < 100 && (
        <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <p className="text-sm text-blue-800">
            {percentage < 25 && '¡Acabas de empezar! Completa los campos básicos.'}
            {percentage >= 25 && percentage < 50 && '¡Buen avance! Continúa completando los detalles.'}
            {percentage >= 50 && percentage < 75 && '¡Excelente progreso! Ya estás a medio camino.'}
            {percentage >= 75 && '¡Casi terminado! Solo faltan algunos campos.'}
          </p>
        </div>
      )}
      
      {percentage === 100 && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800 font-medium">
            ✓ ¡Formulario completo! Ya puedes generar el informe.
          </p>
        </div>
      )}
    </div>
  );
};