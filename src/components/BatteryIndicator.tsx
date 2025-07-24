import React from 'react';

interface BatteryIndicatorProps {
  level: number;
  onChange: (level: number) => void;
}

export const BatteryIndicator: React.FC<BatteryIndicatorProps> = ({ level, onChange }) => {
  const getBatteryColor = () => {
    if (level > 70) return 'bg-green-500';
    if (level > 30) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getBatteryIcon = () => {
    const segments = Math.ceil(level / 25);
    return (
      <div className="relative w-12 h-6 border-2 border-gray-600 rounded-sm">
        {/* Terminal de la batería */}
        <div className="absolute -right-1 top-1.5 w-1 h-3 bg-gray-600 rounded-r"></div>
        
        {/* Nivel de la batería */}
        <div 
          className={`h-full rounded-sm transition-all duration-300 ${getBatteryColor()}`}
          style={{ width: `${level}%` }}
        ></div>
        
        {/* Texto del porcentaje */}
        <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white mix-blend-difference">
          {level}%
        </div>
      </div>
    );
  };

  const sliderStyle = {
    background: `linear-gradient(to right, ${getBatteryColor().replace('bg-', '#')} ${level}%, #e5e7eb ${level}%)`
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-semibold text-gray-700">
        Nivel de Batería
      </label>
      
      <div className="flex items-center space-x-4">
        {getBatteryIcon()}
        
        <div className="flex-1">
          <input
            type="range"
            min="0"
            max="100"
            value={level}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, ${level > 70 ? '#10b981' : level > 30 ? '#f59e0b' : '#ef4444'} ${level}%, #e5e7eb ${level}%)`
            }}
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <input
            type="number"
            min="0"
            max="100"
            value={level}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <span className="text-sm text-gray-600">%</span>
        </div>
      </div>
    </div>
  );
};