#!/bin/bash
# DIRK Protocol Environment Setup
# Tag: #DIRK-MACOS-ENV-SETUP-20250709-0001

# Set proper environment variables
export HOME=/Users/izverg
export PATH="/opt/homebrew/bin:$PATH"

# Function to run DIRK command with proper environment
run_dirk_command() {
    local command="$1"
    shift
    
    cd /Users/izverg/Documents/dirk_protocol
    
    case "$command" in
        "create-task")
            ./utilities/create_dirk_task.sh "$@"
            ;;
        "review")
            ./utilities/gemini_review.sh "$@"
            ;;
        "watch")
            ./utilities/dirk_watcher.sh "$@"
            ;;
        "verify")
            ./utilities/dirk_verify.sh "$@"
            ;;
        "claude")
            echo "🚀 Starting Claude Code in DIRK protocol directory..."
            claude
            ;;
        "status")
            ./utilities/dirk_verify.sh status
            ;;
        *)
            echo "Unknown command: $command"
            echo "Available commands: create-task, review, watch, verify, claude, status"
            ;;
    esac
}

# If script is called directly, run the command
if [ "${BASH_SOURCE[0]}" == "${0}" ]; then
    run_dirk_command "$@"
fi
