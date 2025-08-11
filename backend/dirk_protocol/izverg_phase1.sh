#!/bin/bash
set -e  # Exit on any error

echo "=== IZVERG'S MACOS SETUP - PHASE 1: FOUNDATION ==="
echo "Starting autonomous setup..."
echo "Date: $(date)"

# Create essential directories
echo "Creating directory structure..."
mkdir -p ~/projects
mkdir -p ~/.config
mkdir -p ~/.local/bin

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Install Homebrew if not present
if ! command_exists brew; then
    echo "Installing Homebrew..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    
    # Add Homebrew to PATH for Apple Silicon Macs
    echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
    eval "$(/opt/homebrew/bin/brew shellenv)"
else
    echo "✓ Homebrew already installed"
fi

# Update Homebrew
echo "Updating Homebrew..."
brew update

# Install essential CLI tools
echo "Installing essential CLI tools..."
brew install git zsh curl wget tree jq fd ripgrep bat
brew install python@3.12 node npm

# Install terminal applications
echo "Installing terminal applications..."
brew install --cask iterm2

# Install essential development tools
echo "Installing core development tools..."
brew install cmake ninja pkg-config autoconf automake libtool

# Install text editors and IDEs
echo "Installing development environments..."
brew install --cask visual-studio-code
brew install --cask cursor

# Install version control tools
echo "Installing version control tools..."
brew install --cask github-desktop

# Install Docker
echo "Installing Docker..."
brew install --cask docker
brew install docker-compose

# Install C++ development environment
echo "Installing C++ development stack..."
brew install gcc llvm
brew install vcpkg conan
brew install boost eigen fmt spdlog catch2
brew install cppcheck clang-format
brew install gdb lldb

# Install Microsoft development stack
echo "Installing Microsoft development stack..."
brew install dotnet powershell azure-cli

# Install additional development tools
echo "Installing additional development tools..."
brew install doxygen graphviz
brew install google-benchmark protobuf grpc

# Install media and utility applications
echo "Installing utility applications..."
brew install --cask raycast
brew install --cask google-chrome
brew install --cask steam
brew install --cask little-snitch
brew install --cask veracrypt
brew install --cask backblaze
brew install --cask iina

# Install system utilities
brew install --cask automounter
brew install --cask stats

# Install Python development tools
echo "Installing Python development tools..."
pip3 install --user uv

# Use uv to install Python tools
echo "Installing Python applications with uv..."
uv tool install aider-chat
uv tool install files-to-prompt
uv tool install llm
uv tool install playwright

# Install Gemini CLI
echo "Installing Gemini CLI..."
pip3 install --user google-generativeai

# Install Google Cloud SDK
echo "Installing Google Cloud SDK..."
brew install --cask google-cloud-sdk

# Install Firebase CLI
echo "Installing Firebase CLI..."
npm install -g firebase-tools

# Create basic development directories
echo "Creating development directory structure..."
mkdir -p ~/projects/cpp-templates/{cmake-basic,cmake-vcpkg,cmake-conan}
mkdir -p ~/projects/dotnet
mkdir -p ~/projects/typescript
mkdir -p ~/projects/python

# Set up Git configuration (will need user input)
echo "Setting up Git configuration..."
echo "Note: You'll need to configure Git with your credentials later"

# Install 1Password CLI
echo "Installing 1Password CLI..."
brew install 1password-cli

echo ""
echo "=== PHASE 1 COMPLETE ==="
echo "✓ Homebrew installed and updated"
echo "✓ Essential CLI tools installed"
echo "✓ Development environments: VS Code, Cursor"
echo "✓ C++ development stack complete"
echo "✓ Microsoft development stack installed"
echo "✓ Docker and containerization tools"
echo "✓ Version control tools"
echo "✓ System utilities and applications"
echo "✓ Python development environment"
echo "✓ Directory structure created"
echo ""
echo "Next: Run Phase 2 script for configuration and setup"
echo "Applications installed that may need manual setup:"
echo "- Little Snitch (requires reboot for kernel extension)"
echo "- VeraCrypt (requires reboot for FUSE extension)"
echo "- Docker Desktop (first launch setup)"
echo "- VS Code (extension installation and configuration)"
echo ""
