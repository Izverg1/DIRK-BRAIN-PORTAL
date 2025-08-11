#!/bin/bash
set -e  # Exit on any error

echo "=== IZVERG'S MACOS SETUP - PHASE 3: FINAL CONFIGURATION ==="
echo "Applying system settings and final optimizations..."
echo "Date: $(date)"

# System Settings (macOS System Preferences via defaults)
echo "Configuring system settings..."

# Trackpad settings
echo "Configuring trackpad..."
defaults write NSGlobalDomain com.apple.trackpad.scaling -float 3.0
defaults write com.apple.AppleMultitouchTrackpad TrackpadThreeFingerDrag -bool true
defaults write com.apple.driver.AppleBluetoothMultitouch.trackpad TrackpadThreeFingerDrag -bool true
defaults write com.apple.AppleMultitouchTrackpad Clicking -bool true
defaults write com.apple.driver.AppleBluetoothMultitouch.trackpad Clicking -bool true

# Mouse settings - disable acceleration
defaults write NSGlobalDomain com.apple.mouse.scaling -1

# Keyboard settings
echo "Configuring keyboard..."
defaults write NSGlobalDomain com.apple.keyboard.fnState -bool true

# Function key mappings for Mission Control
defaults write com.apple.symbolichotkeys AppleSymbolicHotKeys -dict-add 79 "
<dict>
  <key>enabled</key><true/>
  <key>value</key><dict>
    <key>type</key><string>standard</string>
    <key>parameters</key>
    <array>
      <integer>65535</integer>
      <integer>107</integer>
      <integer>8388608</integer>
    </array>
  </dict>
</dict>"

defaults write com.apple.symbolichotkeys AppleSymbolicHotKeys -dict-add 81 "
<dict>
  <key>enabled</key><true/>
  <key>value</key><dict>
    <key>type</key><string>standard</string>
    <key>parameters</key>
    <array>
      <integer>65535</integer>
      <integer>113</integer>
      <integer>8388608</integer>
    </array>
  </dict>
</dict>"

# Disable hot corners
defaults write com.apple.dock wvous-tl-corner -int 1
defaults write com.apple.dock wvous-tr-corner -int 1
defaults write com.apple.dock wvous-bl-corner -int 1
defaults write com.apple.dock wvous-br-corner -int 1

# Clock settings - show time only (HH:MM)
defaults write com.apple.menuextra.clock DateFormat -string "HH:mm"
defaults write com.apple.menuextra.clock FlashDateSeparators -bool false
defaults write com.apple.menuextra.clock IsAnalog -bool false

# Accessibility settings
echo "Configuring accessibility..."
# Larger pointer
defaults write com.apple.universalaccess mouseDriverCursorSize -float 2.0

# Scroll speed adjustments
defaults write NSGlobalDomain com.apple.scrollwheel.scaling -float 0.6875

# Show hidden files in Finder
defaults write com.apple.finder AppleShowAllFiles -bool true

# Finder settings
echo "Configuring Finder..."
# Show path bar
defaults write com.apple.finder ShowPathbar -bool true
# Show status bar  
defaults write com.apple.finder ShowStatusBar -bool true
# Default to list view
defaults write com.apple.finder FXPreferredViewStyle -string "Nlsv"

# Add ~/projects and ~ to Finder sidebar
echo "Adding directories to Finder sidebar..."
# This requires more complex AppleScript or manual addition

# Activity Monitor - show CPU history in dock
defaults write com.apple.ActivityMonitor IconType -int 5
defaults write com.apple.ActivityMonitor DockIcon -int 2

# Configure Dock
echo "Configuring Dock..."
# Remove default apps from dock
defaults write com.apple.dock persistent-apps -array

# Restart affected services
echo "Restarting system services..."
killall Dock
killall Finder
killall SystemUIServer

# Install Raycast extensions (requires manual setup)
echo "Setting up Raycast extensions..."
# Note: These need to be installed manually through Raycast UI

# Configure steermouse if installed
echo "Configuring mouse software..."
if [ -d "/Applications/SteerMouse.app" ]; then
    echo "SteerMouse found - configure manually for button mappings"
else
    echo "Installing SteerMouse..."
    brew install --cask steermouse
fi

# Set up backup configurations
echo "Configuring backup solutions..."

# Time Machine exclusions
sudo tmutil addexclusion ~/.cache
sudo tmutil addexclusion ~/projects/*/node_modules

# Create backup verification script
cat > ~/.local/bin/verify-backups << 'EOF'
#!/bin/bash
echo "=== Backup Status Check ==="
echo "Time Machine:"
tmutil latestbackup
echo ""
echo "Backblaze (check status manually in app)"
EOF
chmod +x ~/.local/bin/verify-backups

# Performance optimizations
echo "Applying performance optimizations..."

# Docker Desktop settings (via plist if running)
if pgrep "Docker Desktop" > /dev/null; then
    echo "Docker Desktop is running - consider configuring resource limits"
fi

# Set up development shortcuts
echo "Creating development shortcuts..."

# Script to quickly open common projects
cat > ~/.local/bin/dev << 'EOF'
#!/bin/bash
if [ "$1" = "cpp" ]; then
    cd ~/projects && code .
elif [ "$1" = "new-cpp" ]; then
    read -p "Project name: " name
    cp -r ~/projects/cpp-templates/cmake-basic ~/projects/$name
    cd ~/projects/$name && code .
elif [ "$1" = "new-vcpkg" ]; then
    read -p "Project name: " name
    cp -r ~/projects/cpp-templates/cmake-vcpkg ~/projects/$name
    cd ~/projects/$name && code .
else
    echo "Usage: dev [cpp|new-cpp|new-vcpkg]"
fi
EOF
chmod +x ~/.local/bin/dev

# System maintenance script
cat > ~/.local/bin/maintain-system << 'EOF'
#!/bin/bash
echo "=== System Maintenance ==="
echo "Updating Homebrew..."
brew update && brew upgrade
echo "Cleaning up..."
brew cleanup
echo "Updating npm packages..."
npm update -g
echo "Updating Python packages..."
pip3 list --outdated --format=freeze | grep -v '^\-e' | cut -d = -f 1 | xargs -n1 pip3 install -U
echo "Updating uv tools..."
uv tool upgrade --all
echo "System maintenance complete!"
EOF
chmod +x ~/.local/bin/maintain-system

# Create project initialization script
cat > ~/.local/bin/init-project << 'EOF'
#!/bin/bash
case "$1" in
    "cpp")
        cp -r ~/projects/cpp-templates/cmake-basic ./
        echo "C++ project initialized"
        ;;
    "cpp-vcpkg")
        cp -r ~/projects/cpp-templates/cmake-vcpkg ./
        echo "C++ project with vcpkg initialized"
        ;;
    "dotnet")
        dotnet new console -n "$2"
        echo ".NET project initialized: $2"
        ;;
    "node")
        npm init -y
        npm install --save-dev typescript @types/node ts-node
        echo "Node.js/TypeScript project initialized"
        ;;
    *)
        echo "Usage: init-project [cpp|cpp-vcpkg|dotnet|node] [name]"
        ;;
esac
EOF
chmod +x ~/.local/bin/init-project

# Verification script
echo "Creating system verification script..."
cat > ~/.local/bin/verify-setup << 'EOF'
#!/bin/bash
echo "=== IZVERG'S SYSTEM VERIFICATION ==="
echo ""

# Check essential tools
echo "Checking essential tools..."
tools=("brew" "git" "code" "cursor" "docker" "cmake" "ninja" "gcc" "g++" "clang" "node" "npm" "python3" "dotnet")
for tool in "${tools[@]}"; do
    if command -v "$tool" > /dev/null; then
        echo "✓ $tool installed"
    else
        echo "✗ $tool missing"
    fi
done

echo ""
echo "Checking applications..."
apps=("Visual Studio Code" "Cursor" "Docker" "GitHub Desktop" "iTerm" "Google Chrome")
for app in "${apps[@]}"; do
    if [ -d "/Applications/$app.app" ]; then
        echo "✓ $app installed"
    else
        echo "✗ $app missing"
    fi
done

echo ""
echo "Checking development environment..."
echo "GCC version: $(gcc --version | head -1)"
echo "Clang version: $(clang --version | head -1)"
echo "CMake version: $(cmake --version | head -1)"
echo "Node version: $(node --version)"
echo "Python version: $(python3 --version)"
echo ".NET version: $(dotnet --version)"

echo ""
echo "Checking C++ libraries..."
libs=("boost" "eigen" "fmt" "spdlog")
for lib in "${libs[@]}"; do
    if brew list "$lib" > /dev/null 2>&1; then
        echo "✓ $lib installed"
    else
        echo "✗ $lib missing"
    fi
done

echo ""
echo "System verification complete!"
EOF
chmod +x ~/.local/bin/verify-setup

# Final system refresh
source ~/.zshrc

echo ""
echo "=== PHASE 3 COMPLETE ==="
echo "✓ System settings configured"
echo "✓ Trackpad and mouse optimized"
echo "✓ Keyboard and shortcuts set up"
echo "✓ Finder and Dock configured"
echo "✓ Development shortcuts created"
echo "✓ Maintenance scripts installed"
echo "✓ Backup configurations applied"
echo ""
echo "=== SETUP COMPLETE! ==="
echo ""
echo "Your development environment is ready with:"
echo "• Visual Studio Code + Cursor with C++ and Microsoft extensions"
echo "• Complete C++ development stack (GCC, Clang, CMake, vcpkg)"
echo "• Microsoft development tools (.NET, PowerShell, Azure CLI)"
echo "• Docker and containerization"
echo "• Python and Node.js environments"
echo "• System optimized for development workflow"
echo ""
echo "Useful commands:"
echo "• verify-setup - Check installation status"
echo "• maintain-system - Update all packages"
echo "• dev cpp - Open projects in VS Code"
echo "• init-project cpp myproject - Create new C++ project"
echo ""
echo "Manual steps remaining:"
echo "1. Sign into applications (Chrome, GitHub Desktop, VS Code)"
echo "2. Configure GitHub authentication: gh auth login"
echo "3. Set Git email: git config --global user.email 'your@email.com'"
echo "4. Launch and configure Little Snitch, VeraCrypt"
echo "5. Set up Backblaze and Time Machine destinations"
echo ""
echo "System restart recommended to complete all configurations."
