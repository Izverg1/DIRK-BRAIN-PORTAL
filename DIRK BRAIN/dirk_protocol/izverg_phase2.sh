#!/bin/bash
set -e  # Exit on any error

echo "=== IZVERG'S MACOS SETUP - PHASE 2: CONFIGURATION ==="
echo "Configuring applications and development environment..."
echo "Date: $(date)"

# Function to check if application is installed
app_exists() {
    [ -d "/Applications/$1.app" ] || [ -d "/System/Applications/$1.app" ]
}

# Configure VS Code
echo "Configuring Visual Studio Code..."
if app_exists "Visual Studio Code"; then
    # Install essential VS Code extensions
    echo "Installing VS Code extensions..."
    
    # Microsoft and TypeScript extensions
    code --install-extension ms-vscode.vscode-typescript-next
    code --install-extension ms-vscode.PowerShell
    code --install-extension ms-dotnettools.csharp
    code --install-extension ms-dotnettools.csdevkit
    
    # C++ extensions
    code --install-extension ms-vscode.cpptools
    code --install-extension ms-vscode.cpptools-extension-pack
    code --install-extension ms-vscode.cmake-tools
    code --install-extension twxs.cmake
    code --install-extension ms-vscode.makefile-tools
    code --install-extension llvm-vs-code-extensions.vscode-clangd
    
    # AI and productivity extensions
    code --install-extension GitHub.copilot
    code --install-extension GitHub.copilot-chat
    
    # Utility extensions
    code --install-extension bradlc.vscode-tailwindcss
    code --install-extension ms-vscode.azure-tools
    code --install-extension ms-azuretools.vscode-docker
    code --install-extension ms-python.python
    
    # Documentation and formatting
    code --install-extension cschlosser.doxdocgen
    code --install-extension jeff-hykin.better-cpp-syntax
    code --install-extension vadimcn.vscode-lldb
    
    # Create VS Code settings
    mkdir -p ~/Library/Application\ Support/Code/User
    
    cat > ~/Library/Application\ Support/Code/User/settings.json << 'EOF'
{
    "editor.fontSize": 17,
    "editor.fontFamily": "MesloLGM Nerd Font, 'Courier New', monospace",
    "editor.lineHeight": 1.05,
    "editor.wordWrap": "on",
    "editor.wordWrapColumn": 120,
    "editor.rulers": [80, 120],
    "editor.tabSize": 4,
    "editor.insertSpaces": true,
    "editor.detectIndentation": true,
    "editor.renderWhitespace": "all",
    "editor.minimap.enabled": true,
    "workbench.colorTheme": "Default Light+",
    "workbench.preferredDarkColorTheme": "Default Dark+",
    "window.autoDetectColorScheme": true,
    "terminal.integrated.fontSize": 16,
    "terminal.integrated.fontFamily": "MesloLGM Nerd Font",
    "files.autoSave": "onFocusChange",
    "files.trimTrailingWhitespace": true,
    "files.insertFinalNewline": true,
    "C_Cpp.default.cppStandard": "c++23",
    "C_Cpp.default.cStandard": "c17",
    "C_Cpp.default.compilerPath": "/opt/homebrew/bin/g++",
    "C_Cpp.default.intelliSenseMode": "macos-gcc-arm64",
    "cmake.configureOnOpen": true,
    "cmake.generator": "Ninja",
    "typescript.preferences.quoteStyle": "double",
    "javascript.preferences.quoteStyle": "double",
    "powershell.integratedConsole.showOnStartup": false,
    "git.enableSmartCommit": true,
    "git.confirmSync": false,
    "extensions.autoUpdate": true
}
EOF

    echo "✓ VS Code configured with extensions and settings"
else
    echo "⚠ VS Code not found, skipping configuration"
fi

# Configure Cursor (similar to VS Code but separate)
echo "Configuring Cursor..."
if app_exists "Cursor"; then
    # Cursor uses similar configuration to VS Code
    mkdir -p ~/Library/Application\ Support/Cursor/User
    
    # Copy VS Code settings to Cursor
    cp ~/Library/Application\ Support/Code/User/settings.json ~/Library/Application\ Support/Cursor/User/settings.json
    
    echo "✓ Cursor configured"
else
    echo "⚠ Cursor not found, skipping configuration"
fi

# Set up dotfiles
echo "Setting up dotfiles..."
if [ ! -d ~/.dotfiles ]; then
    echo "Cloning dotfiles repository..."
    git clone https://github.com/motlin/dotfiles ~/.dotfiles
    cd ~/.dotfiles
    ./install mac
    echo "✓ Dotfiles installed"
else
    echo "✓ Dotfiles already exist"
fi

# Configure Git
echo "Configuring Git..."
git config --global user.name "Izverg"
git config --global init.defaultBranch main
git config --global core.editor "code --wait"
git config --global merge.tool "vscode"
git config --global mergetool.vscode.cmd 'code --wait $MERGED'
git config --global diff.tool "vscode"
git config --global difftool.vscode.cmd 'code --wait --diff $LOCAL $REMOTE'

echo "Note: You'll need to set up your Git email and GitHub authentication later"

# Configure iTerm2 if available
echo "Configuring iTerm2..."
if app_exists "iTerm"; then
    # Set iTerm2 to use zsh
    defaults write com.googlecode.iterm2 "Default Bookmark Guid" -string "default"
    echo "✓ iTerm2 basic configuration applied"
fi

# Set up development environment variables
echo "Setting up development environment..."
cat >> ~/.zshrc << 'EOF'

# Development environment setup
export EDITOR="code --wait"
export VISUAL="code"

# C++ development
export CC=/opt/homebrew/bin/gcc-13
export CXX=/opt/homebrew/bin/g++-13
export CMAKE_GENERATOR=Ninja

# vcpkg
export VCPKG_ROOT=/opt/homebrew/share/vcpkg

# .NET
export DOTNET_CLI_TELEMETRY_OPTOUT=1

# Node.js
export NODE_OPTIONS="--max-old-space-size=4096"

# Python
export PYTHONPATH="$HOME/.local/lib/python3.12/site-packages:$PYTHONPATH"

# Add local bin to PATH
export PATH="$HOME/.local/bin:$PATH"

# uv tools
export PATH="$HOME/.local/share/uv/tools/bin:$PATH"

EOF

# Create C++ project templates
echo "Creating C++ project templates..."

# Basic CMake template
mkdir -p ~/projects/cpp-templates/cmake-basic
cat > ~/projects/cpp-templates/cmake-basic/CMakeLists.txt << 'EOF'
cmake_minimum_required(VERSION 3.20)
project(MyProject VERSION 1.0.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 23)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

add_executable(${PROJECT_NAME} src/main.cpp)

target_include_directories(${PROJECT_NAME} PRIVATE include)

# Compiler-specific options
if(CMAKE_CXX_COMPILER_ID STREQUAL "GNU")
    target_compile_options(${PROJECT_NAME} PRIVATE -Wall -Wextra -Wpedantic)
elseif(CMAKE_CXX_COMPILER_ID STREQUAL "Clang")
    target_compile_options(${PROJECT_NAME} PRIVATE -Wall -Wextra -Wpedantic)
endif()
EOF

mkdir -p ~/projects/cpp-templates/cmake-basic/{src,include}
cat > ~/projects/cpp-templates/cmake-basic/src/main.cpp << 'EOF'
#include <iostream>

int main() {
    std::cout << "Hello, C++23 World!" << std::endl;
    return 0;
}
EOF

# vcpkg template
mkdir -p ~/projects/cpp-templates/cmake-vcpkg
cat > ~/projects/cpp-templates/cmake-vcpkg/CMakeLists.txt << 'EOF'
cmake_minimum_required(VERSION 3.20)
project(MyVcpkgProject VERSION 1.0.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 23)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

find_package(fmt CONFIG REQUIRED)
find_package(spdlog CONFIG REQUIRED)

add_executable(${PROJECT_NAME} src/main.cpp)
target_link_libraries(${PROJECT_NAME} PRIVATE fmt::fmt spdlog::spdlog)
EOF

cat > ~/projects/cpp-templates/cmake-vcpkg/vcpkg.json << 'EOF'
{
  "name": "my-vcpkg-project",
  "version": "1.0.0",
  "dependencies": [
    "fmt",
    "spdlog"
  ]
}
EOF

# Configure 1Password CLI for GitHub
echo "Setting up 1Password CLI..."
if command -v op >/dev/null 2>&1; then
    echo "1Password CLI installed. You can run 'op plugin init gh' to set up GitHub integration"
else
    echo "⚠ 1Password CLI not found"
fi

# Set up Google Cloud SDK
echo "Configuring Google Cloud SDK..."
if command -v gcloud >/dev/null 2>&1; then
    # Install crcmod for better performance
    python3 -m pip install --user crcmod
    echo "✓ Google Cloud SDK configured"
else
    echo "⚠ Google Cloud SDK not found"
fi

echo ""
echo "=== PHASE 2 COMPLETE ==="
echo "✓ VS Code configured with extensions"
echo "✓ Cursor configured"
echo "✓ Git configured"
echo "✓ Development environment variables set"
echo "✓ C++ project templates created"
echo "✓ iTerm2 basic configuration"
echo "✓ Python and Node.js environments ready"
echo ""
echo "Manual steps still needed:"
echo "- Configure GitHub authentication (gh auth login)"
echo "- Set up Git email (git config --global user.email)"
echo "- Configure 1Password CLI (op plugin init gh)"
echo "- Sign into applications (Chrome, VS Code, etc.)"
echo "- Run Phase 3 script for final configuration"
echo ""
