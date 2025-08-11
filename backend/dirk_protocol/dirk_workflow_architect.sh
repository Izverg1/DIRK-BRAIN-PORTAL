#!/bin/bash
# DIRK Automated Workflow Architecture Setup
# Tag: #DIRK-MACOS-WORKFLOW-ARCHITECT-20250708-0001

set -eo pipefail

echo "🏗️ DIRK Automated Workflow Architecture Setup"
echo "============================================="

# Environment detection
MACOS_VERSION=$(sw_vers -productVersion)
ARCHITECTURE=$(uname -m)
SHELL_TYPE="$SHELL"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "📋 Environment Detection:"
echo "  macOS Version: $MACOS_VERSION"
echo "  Architecture: $ARCHITECTURE"
echo "  Shell: $SHELL_TYPE"
echo "  Timestamp: $TIMESTAMP"
echo ""

# Create DIRK protocol directory structure
create_dirk_structure() {
    echo "📁 Creating DIRK protocol directory structure..."
    
    local base_dir="$HOME/Documents/dirk_protocol"
    
    mkdir -p "$base_dir"/{design_documents/{active,archived,templates},design_commands/{pending,in_progress,completed},active_tasks,completed_tasks,verification_reports,gemini_consultation_requests,claude_responses,hooks_logs,backups/{daily,critical,auto},utilities,context}
    
    # Create .claude directory for Claude Code configuration
    mkdir -p "$base_dir/.claude"/{commands,hooks}
    
    echo "✅ Directory structure created at: $base_dir"
}

# Install required dependencies
install_dependencies() {
    echo "📦 Installing required dependencies..."
    
    # Check and install jq if not present
    if ! command -v jq &> /dev/null; then
        echo "Installing jq..."
        brew install jq
    else
        echo "✅ jq already installed: $(which jq)"
    fi
    
    # Check and install fswatch for file monitoring
    if ! command -v fswatch &> /dev/null; then
        echo "Installing fswatch..."
        brew install fswatch
    else
        echo "✅ fswatch already installed: $(which fswatch)"
    fi
    
    # Verify Gemini CLI
    if command -v gemini &> /dev/null; then
        echo "✅ Gemini CLI found: $(which gemini)"
    else
        echo "❌ Gemini CLI not found. Please install it first."
        exit 1
    fi
    
    # Verify Claude Code
    if command -v claude &> /dev/null; then
        echo "✅ Claude Code found: $(which claude)"
    else
        echo "❌ Claude Code not found. Please install it first."
        exit 1
    fi
}

# Create task registry system
create_task_registry() {
    echo "📋 Creating task registry system..."
    
    local registry_file="$HOME/Documents/dirk_protocol/task_registry.json"
    
    cat > "$registry_file" << 'EOF'
{
  "registry_version": "1.0",
  "created_at": "$(date -Iseconds)",
  "last_updated": "$(date -Iseconds)",
  "active_tasks": [],
  "completed_tasks": [],
  "failed_tasks": [],
  "task_counter": 0,
  "statistics": {
    "total_tasks_created": 0,
    "total_tasks_completed": 0,
    "total_tasks_failed": 0,
    "average_completion_time": null
  },
  "agents": {
    "dirk_d": {
      "status": "available",
      "last_activity": null,
      "tasks_assigned": 0
    },
    "dirk_c": {
      "status": "available", 
      "last_activity": null,
      "tasks_assigned": 0
    },
    "dirk_g": {
      "status": "available",
      "last_activity": null,
      "tasks_assigned": 0
    }
  }
}
EOF
    
    echo "✅ Task registry created at: $registry_file"
}

# Main execution
main() {
    echo "🚀 Starting DIRK Workflow Architecture Setup..."
    
    create_dirk_structure
    install_dependencies
    create_task_registry
    
    echo ""
    echo "✅ DIRK Workflow Architecture base setup complete!"
    echo "📍 Protocol location: ~/Documents/dirk_protocol/"
    echo "🔄 Next: Run setup_claude_hooks.sh to configure Claude Code hooks"
    echo ""
}

main "$@"
