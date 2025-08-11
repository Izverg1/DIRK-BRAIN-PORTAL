#!/bin/bash
set -e  # Exit on any error

echo "==========================================="
echo "    IZVERG'S COMPLETE MACOS SETUP"
echo "    Autonomous Development Environment"
echo "==========================================="
echo "Date: $(date)"
echo ""

# Make all scripts executable
echo "Setting up execution permissions..."
chmod +x /Users/izverg/Documents/izverg_phase1.sh
chmod +x /Users/izverg/Documents/izverg_phase2.sh  
chmod +x /Users/izverg/Documents/izverg_phase3.sh

echo "✓ All scripts are executable"
echo ""

# Execute Phase 1
echo "🚀 STARTING PHASE 1: FOUNDATION SETUP"
echo "This will install Homebrew, development tools, and applications..."
echo "Estimated time: 15-20 minutes"
echo ""
/Users/izverg/Documents/izverg_phase1.sh

if [ $? -eq 0 ]; then
    echo "✅ PHASE 1 COMPLETED SUCCESSFULLY!"
else
    echo "❌ PHASE 1 FAILED - Check output above"
    exit 1
fi

echo ""
echo "⏱️  Waiting 5 seconds before Phase 2..."
sleep 5

# Execute Phase 2  
echo "🔧 STARTING PHASE 2: CONFIGURATION"
echo "This will configure applications and development environment..."
echo "Estimated time: 5-10 minutes"
echo ""
/Users/izverg/Documents/izverg_phase2.sh

if [ $? -eq 0 ]; then
    echo "✅ PHASE 2 COMPLETED SUCCESSFULLY!"
else
    echo "❌ PHASE 2 FAILED - Check output above"
    exit 1
fi

echo ""
echo "⏱️  Waiting 5 seconds before Phase 3..."
sleep 5

# Execute Phase 3
echo "⚙️  STARTING PHASE 3: FINAL OPTIMIZATION"
echo "This will apply system settings and final configurations..."
echo "Estimated time: 5 minutes"
echo ""
/Users/izverg/Documents/izverg_phase3.sh

if [ $? -eq 0 ]; then
    echo "✅ PHASE 3 COMPLETED SUCCESSFULLY!"
else
    echo "❌ PHASE 3 FAILED - Check output above"
    exit 1
fi

echo ""
echo "🎉 ALL PHASES COMPLETED!"
echo ""
echo "==========================================="
echo "     SETUP COMPLETE!"
echo "==========================================="
echo ""
echo "Your macOS development environment is now fully configured with:"
echo ""
echo "📦 SOFTWARE INSTALLED:"
echo "  • Visual Studio Code + Cursor (with extensions)"
echo "  • Complete C++ development stack"
echo "  • Microsoft development tools (.NET, PowerShell, Azure CLI)"
echo "  • Docker Desktop + GitHub Desktop"
echo "  • Python development environment"
echo "  • Node.js and TypeScript environment"
echo "  • System utilities and productivity apps"
echo ""
echo "⚙️  SYSTEM CONFIGURED:"
echo "  • Trackpad, mouse, and keyboard optimized"
echo "  • Development environment variables set"
echo "  • C++ project templates created"
echo "  • Git and version control configured"
echo "  • System preferences optimized"
echo ""
echo "🛠️  DEVELOPMENT SHORTCUTS:"
echo "  • verify-setup - Check installation status"
echo "  • maintain-system - Update all packages"
echo "  • dev cpp - Open projects in VS Code"
echo "  • init-project cpp myproject - Create new C++ project"
echo ""
echo "📋 REMAINING MANUAL STEPS:"
echo "  1. Set your Git email: git config --global user.email 'your@email.com'"
echo "  2. Sign into applications (Chrome, GitHub Desktop, VS Code)"
echo "  3. Configure GitHub authentication: gh auth login"
echo "  4. Launch and configure Little Snitch, VeraCrypt"
echo "  5. Set up Backblaze and Time Machine destinations"
echo ""
echo "🔄 SYSTEM RESTART RECOMMENDED"
echo "A restart will complete all system configurations."
echo ""
echo "Run 'verify-setup' to check that everything is working correctly!"
echo ""
