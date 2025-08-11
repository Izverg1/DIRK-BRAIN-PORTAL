#!/bin/bash

echo "🚀 STARTING IZVERG'S AUTONOMOUS MACOS SETUP"
echo "============================================"

# Make all scripts executable
chmod +x /Users/izverg/Documents/izverg_phase1.sh
chmod +x /Users/izverg/Documents/izverg_phase2.sh  
chmod +x /Users/izverg/Documents/izverg_phase3.sh
chmod +x /Users/izverg/Documents/run_complete_setup.sh

echo "✅ All scripts are now executable"
echo ""
echo "🎯 EXECUTING COMPLETE AUTONOMOUS SETUP..."
echo "This will take approximately 30 minutes"
echo "No further input required!"
echo ""

# Execute the complete setup
exec /Users/izverg/Documents/run_complete_setup.sh
