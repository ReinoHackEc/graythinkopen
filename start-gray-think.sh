#!/bin/bash

# Gray Think - Script de Inicio Rápido
# Versión: 2.0 Final

echo "🚀 ================================================"
echo "🚀    GRAY THINK - SISTEMA DE INFORMES v2.0    "
echo "🚀 ================================================"
echo ""

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado"
    echo "💻 Instala Node.js desde: https://nodejs.org"
    exit 1
fi

echo "✅ Node.js detectado: $(node --version)"

# Verificar npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm no está disponible"
    exit 1
fi

echo "✅ npm detectado: $(npm --version)"
echo ""

# Instalar dependencias si es necesario
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Error instalando dependencias"
        exit 1
    fi
    echo "✅ Dependencias instaladas"
else
    echo "✅ Dependencias ya instaladas"
fi

echo ""
echo "🚀 Iniciando Gray Think..."
echo "🌐 Servidor se abrirá en: http://localhost:5173"
echo "📝 Logs del sistema:"
echo "-------------------------------------------"

# Iniciar servidor de desarrollo
npm run dev
