#!/bin/bash
# Gemini CLI Task Creator for DIRK Protocol
# Tag: #DIRK-MACOS-GEMINI-TASK-CREATOR-20250709-0001

set -eo pipefail

DIRK_BASE="/Users/izverg/Documents/dirk_protocol"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
TASK_ID="DIRK-TASK-$TIMESTAMP"

# Function to create a new DIRK task
create_dirk_task() {
    local task_title="$1"
    local task_description="$2"
    local priority="${3:-MEDIUM}"
    local language="${4:-TypeScript}"
    
    echo "🎯 Creating DIRK task: $task_title"
    
    # Create task JSON
    cat > "$DIRK_BASE/active_tasks/$TASK_ID.json" << EOF
{
  "task_id": "$TASK_ID",
  "title": "$task_title",
  "description": "$task_description",
  "creator": "DIRK.d (Gemini)",
  "assignee": "DIRK.c (Claude Code)",
  "status": "ASSIGNED",
  "priority": "$priority",
  "created_at": "$(date -Iseconds)",
  "deadline": "$(date -v+7d -Iseconds)",
  "language": "$language",
  "requirements": [
    "Build real, production-ready implementation",
    "No minimal or demo versions",
    "Include comprehensive TypeScript types",
    "Add complete test coverage",
    "Follow macOS integration patterns",
    "Include proper error handling",
    "Generate comprehensive documentation"
  ],
  "acceptance_criteria": [
    "All functionality works as specified",
    "TypeScript compilation passes without errors",
    "All tests pass",
    "Code follows DIRK standards",
    "Documentation is complete and accurate",
    "macOS integration is properly implemented"
  ],
  "architecture_spec": {
    "language": "$language",
    "platform": "macOS",
    "patterns": ["Domain Modeling", "Safety First", "Enterprise Grade"],
    "constraints": ["No simulations", "Production ready", "Full implementation"]
  },
  "cognitive_focuses": [
    "Foundational Reasoning",
    "Formal Logic", 
    "Empirical Grounding",
    "Abstraction",
    "Best Explanation"
  ],
  "context_refs": [],
  "progress_log": [],
  "verification_status": "PENDING"
}
EOF

    # Update task registry
    if [ -f "$DIRK_BASE/task_registry.json" ]; then
        jq --arg task_id "$TASK_ID" '.active_tasks += [$task_id] | .task_counter += 1 | .statistics.total_tasks_created += 1' \
          "$DIRK_BASE/task_registry.json" > /tmp/task_registry.tmp && \
          mv /tmp/task_registry.tmp "$DIRK_BASE/task_registry.json"
    fi
    
    # Log task creation
    echo "#DIRK-MACOS-$TIMESTAMP: Task created by DIRK.d - $task_title" >> "$DIRK_BASE/context/DIRK_CONTEXT.md"
    
    echo "✅ Task created: $TASK_ID"
    echo "📁 Location: $DIRK_BASE/active_tasks/$TASK_ID.json"
    echo "🔄 Next: Run Claude Code with '/check-dirk-tasks' to start implementation"
}

# Function to create design command
create_design_command() {
    local command_description="$1"
    local design_doc_ref="$2"
    local command_type="${3:-IMPLEMENT}"
    local priority="${4:-HIGH}"
    
    local cmd_id="DSGN-CMD-$TIMESTAMP"
    
    echo "📋 Creating design command: $command_description"
    
    cat > "$DIRK_BASE/design_commands/pending/$cmd_id.json" << EOF
{
  "command_id": "$cmd_id",
  "source_document": "$design_doc_ref",
  "command_type": "$command_type",
  "priority": "$priority",
  "issued_at": "$(date -Iseconds)",
  "deadline": "$(date -v+3d -Iseconds)",
  "description": "$command_description",
  "directives": [
    "Follow design document specifications exactly",
    "Implement using TypeScript domain modeling",
    "Include comprehensive error handling",
    "Add proper macOS integration",
    "Build production-ready implementation"
  ],
  "references": {
    "design_sections": [],
    "related_code_files": []
  },
  "verification_checklist": [
    "Implementation matches design specifications",
    "All interfaces properly defined",
    "Error handling follows patterns",
    "Performance meets requirements",
    "Security considerations addressed"
  ],
  "status": "PENDING"
}
EOF

    echo "✅ Design command created: $cmd_id"
    echo "📁 Location: $DIRK_BASE/design_commands/pending/$cmd_id.json"
}

# Function to provide usage help
show_usage() {
    echo "🕷️ DIRK Gemini Task Creator"
    echo "Usage:"
    echo "  $0 task \"Task Title\" \"Task Description\" [priority] [language]"
    echo "  $0 command \"Command Description\" \"Design Doc Reference\" [type] [priority]"
    echo ""
    echo "Examples:"
    echo "  $0 task \"Implement user authentication\" \"Build OAuth2 authentication system\" HIGH TypeScript"
    echo "  $0 command \"Create data models\" \"USER-AUTH-DESIGN-001\" IMPLEMENT HIGH"
}

# Main execution
main() {
    if [ $# -eq 0 ]; then
        show_usage
        exit 1
    fi
    
    case "$1" in
        "task")
            if [ $# -lt 3 ]; then
                echo "❌ Error: Task requires title and description"
                show_usage
                exit 1
            fi
            create_dirk_task "$2" "$3" "$4" "$5"
            ;;
        "command")
            if [ $# -lt 3 ]; then
                echo "❌ Error: Command requires description and design doc reference"
                show_usage
                exit 1
            fi
            create_design_command "$2" "$3" "$4" "$5"
            ;;
        *)
            echo "❌ Error: Unknown action '$1'"
            show_usage
            exit 1
            ;;
    esac
}

main "$@"
