import React from 'react';
import { AlertCircle } from 'lucide-react';

interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  description?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  required = false,
  children,
  description
}) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      {description && (
        <p className="text-sm text-gray-600">{description}</p>
      )}
      
      <div className="relative">
        {children}
      </div>
      
      {error && (
        <div className="flex items-center space-x-2 text-red-600">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">{error}</span>
        </div>
      )}
    </div>
  );
};

// Componente específico para inputs con estilos consistentes
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input: React.FC<InputProps> = ({ error, className = '', ...props }) => {
  return (
    <input
      className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
        error ? 'border-red-300 focus:ring-red-500' : ''
      } ${className}`}
      {...props}
    />
  );
};

// Componente específico para selects
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
  options: { value: string; label: string }[];
}

export const Select: React.FC<SelectProps> = ({ error, options, className = '', ...props }) => {
  return (
    <select
      className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white ${
        error ? 'border-red-300 focus:ring-red-500' : ''
      } ${className}`}
      {...props}
    >
      <option value="">Seleccionar...</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

// Componente específico para textareas
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const Textarea: React.FC<TextareaProps> = ({ error, className = '', ...props }) => {
  return (
    <textarea
      className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-vertical min-h-[100px] ${
        error ? 'border-red-300 focus:ring-red-500' : ''
      } ${className}`}
      {...props}
    />
  );
};

// Componente para radio buttons
interface RadioGroupProps {
  name: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  name,
  options,
  value,
  onChange,
  error
}) => {
  return (
    <div className="space-y-3">
      {options.map((option) => (
        <label key={option.value} className="flex items-center space-x-3 cursor-pointer">
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={(e) => onChange(e.target.value)}
            className={`w-4 h-4 text-blue-600 border-2 border-gray-300 focus:ring-blue-500 focus:ring-2 ${
              error ? 'border-red-300' : ''
            }`}
          />
          <span className="text-gray-700 font-medium">{option.label}</span>
        </label>
      ))}
    </div>
  );
}