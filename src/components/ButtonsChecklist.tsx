import React from 'react';

interface ButtonsChecklistProps {
  todosFuncionan: boolean;
  botonesIndividuales: {
    volumen: boolean;
    encendido: boolean;
    home: boolean;
    silencio: boolean;
  };
  onTodosFuncionanChange: (value: boolean) => void;
  onBotonIndividualChange: (boton: string, value: boolean) => void;
}

export const ButtonsChecklist: React.FC<ButtonsChecklistProps> = ({
  todosFuncionan,
  botonesIndividuales,
  onTodosFuncionanChange,
  onBotonIndividualChange
}) => {
  const botones = [
    { key: 'volumen', label: 'Volumen' },
    { key: 'encendido', label: 'Encendido' },
    { key: 'home', label: 'Home' },
    { key: 'silencio', label: 'Silencio' }
  ];

  return (
    <div className="space-y-4">
      <label className="block text-sm font-semibold text-gray-700">
        Estado de los Botones
      </label>
      
      {/* Opción: Todos los botones funcionan */}
      <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={todosFuncionan}
            onChange={(e) => onTodosFuncionanChange(e.target.checked)}
            className="w-5 h-5 text-blue-600 border-2 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
          />
          <span className="text-lg font-medium text-blue-800">
            ✓ Todos los botones funcionan correctamente
          </span>
        </label>
      </div>
      
      {/* Verificación individual (deshabilitada si todos funcionan) */}
      <div className={`space-y-2 transition-all duration-300 ${
        todosFuncionan ? 'opacity-50 pointer-events-none' : 'opacity-100'
      }`}>
        <p className="text-sm text-gray-600 font-medium">
          Verificación individual de botones:
        </p>
        
        <div className="grid grid-cols-2 gap-3">
          {botones.map(({ key, label }) => (
            <label key={key} className="flex items-center space-x-3 p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
              <input
                type="checkbox"
                checked={todosFuncionan || botonesIndividuales[key as keyof typeof botonesIndividuales]}
                onChange={(e) => onBotonIndividualChange(key, e.target.checked)}
                disabled={todosFuncionan}
                className="w-4 h-4 text-green-600 border-2 border-gray-300 rounded focus:ring-green-500 focus:ring-2 disabled:bg-gray-200"
              />
              <span className={`font-medium ${
                todosFuncionan || botonesIndividuales[key as keyof typeof botonesIndividuales] 
                  ? 'text-green-700' 
                  : 'text-gray-700'
              }`}>
                {label}
              </span>
            </label>
          ))}
        </div>
      </div>
      
      {!todosFuncionan && (
        <div className="text-xs text-gray-500 italic">
          Nota: Marca los botones que funcionan correctamente
        </div>
      )}
    </div>
  );
};