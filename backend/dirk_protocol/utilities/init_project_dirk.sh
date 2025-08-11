#!/bin/bash
# Initialize DIRK Protocol in Current Project
# Tag: #DIRK-PROJECT-INIT-20250709-0001

set -eo pipefail

PROJECT_DIR=$(pwd)
PROJECT_NAME=$(basename "$PROJECT_DIR")

echo "🎯 Initializing DIRK Protocol for Project: $PROJECT_NAME"
echo "📁 Location: $PROJECT_DIR"

# Create local DIRK structure
mkdir -p .dirk/{active_tasks,completed_tasks,design_commands/{pending,in_progress,completed},context,backups/auto}

# Create project-specific task registry
cat > .dirk/task_registry.json << EOJ
{
  "project_name": "$PROJECT_NAME",
  "project_path": "$PROJECT_DIR",
  "registry_version": "1.0",
  "created_at": "$(date -Iseconds)",
  "last_updated": "$(date -Iseconds)",
  "active_tasks": [],
  "completed_tasks": [],
  "task_counter": 0,
  "project_type": "$(detect_project_type)",
  "global_dirk_link": "/Users/izverg/Documents/dirk_protocol"
}
EOJ

# Create project context file
cat > .dirk/context/PROJECT_DIRK_CONTEXT.md << EOM
# DIRK Protocol Context for $PROJECT_NAME

## Project Information
- **Name**: $PROJECT_NAME
- **Path**: $PROJECT_DIR
- **Type**: $(detect_project_type)
- **Initialized**: $(date -Iseconds)

## DIRK Configuration
- **Local DIRK**: ./.dirk/
- **Global DIRK**: /Users/izverg/Documents/dirk_protocol/
- **Backup Location**: ./.dirk/backups/
- **Task Management**: ./.dirk/active_tasks/

## Project-Specific Notes
[Add project-specific DIRK configuration notes here]

---

## Activity Log
#DIRK-PROJECT-INIT-$(date +%Y%m%d)-0001: DIRK Protocol initialized for $PROJECT_NAME

EOM

# Detect project type
detect_project_type() {
    if [ -f "package.json" ]; then
        echo "Node.js/TypeScript"
    elif [ -f "requirements.txt" ] || [ -f "pyproject.toml" ]; then
        echo "Python"
    elif [ -f "Cargo.toml" ]; then
        echo "Rust"
    elif [ -f "go.mod" ]; then
        echo "Go"
    elif [ -f "pom.xml" ] || [ -f "build.gradle" ]; then
        echo "Java"
    else
        echo "Generic"
    fi
}

# Add .dirk to .gitignore if it exists
if [ -f ".gitignore" ]; then
    if ! grep -q "^\.dirk/" .gitignore; then
        echo ".dirk/" >> .gitignore
        echo "✅ Added .dirk/ to .gitignore"
    fi
fi

echo "✅ DIRK Protocol initialized for $PROJECT_NAME"
echo "🚀 You can now use DIRK commands from anywhere:"
echo "   claude -> /check-dirk-tasks"
echo "   claude -> /consult-gemini"
echo "📁 Local DIRK directory: ./.dirk/"
