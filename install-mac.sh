#!/bin/bash

# Gray Think - Instalador Automático para macOS
# Versión: 2.0 Final

echo "🍎 ================================================"
echo "🍎   GRAY THINK - INSTALADOR MACOS v2.0         "
echo "🍎 ================================================"
echo ""

# Función para mostrar progreso
show_progress() {
    echo "🔄 $1..."
}

show_success() {
    echo "✅ $1"
}

show_error() {
    echo "❌ $1"
}

# Verificar macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    show_error "Este script es solo para macOS"
    exit 1
fi

show_success "macOS detectado: $(sw_vers -productVersion)"

# Verificar/Instalar Homebrew
if ! command -v brew &> /dev/null; then
    show_progress "Instalando Homebrew"
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    if [ $? -ne 0 ]; then
        show_error "Error instalando Homebrew"
        exit 1
    fi
fi

show_success "Homebrew disponible"

# Verificar/Instalar Node.js
if ! command -v node &> /dev/null; then
    show_progress "Instalando Node.js via Homebrew"
    brew install node
    if [ $? -ne 0 ]; then
        show_error "Error instalando Node.js"
        exit 1
    fi
fi

show_success "Node.js: $(node --version)"
show_success "npm: $(npm --version)"

# Verificar pnpm (opcional)
if ! command -v pnpm &> /dev/null; then
    show_progress "Instalando pnpm (gestor de paquetes optimizado)"
    npm install -g pnpm
    if [ $? -eq 0 ]; then
        show_success "pnpm instalado: $(pnpm --version)"
    else
        echo "⚠️ pnpm opcional no se pudo instalar (usando npm)"
    fi
fi

echo ""
show_progress "Instalando dependencias del proyecto"

# Usar pnpm si está disponible, sino npm
if command -v pnpm &> /dev/null; then
    pnpm install
else
    npm install
fi

if [ $? -ne 0 ]; then
    show_error "Error instalando dependencias"
    exit 1
fi

show_success "Dependencias instaladas correctamente"

echo ""
echo "🎉 ================================================"
echo "🎉         INSTALACIÓN COMPLETADA                "
echo "🎉 ================================================"
echo ""
echo "🚀 Para iniciar Gray Think, ejecuta:"
echo "    ./start-gray-think.sh"
echo ""
echo "📚 Documentación disponible en:"
echo "    - LEEME-FINAL.md"
echo "    - INSTALACION-DETALLADA.md"
echo "    - MANUAL-TECNICO.md"
echo ""
echo "🌐 Versión desplegada: https://bgr0614s1jfe.space.minimax.io"
echo ""
show_success "¡Gray Think listo para usar!"
