#!/bin/bash
# DIRK Protocol Complete Setup Verification & Quick Start
# Tag: #DIRK-MACOS-VERIFICATION-20250709-0001

set -eo pipefail

DIRK_BASE="/Users/izverg/Documents/dirk_protocol"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🏗️ DIRK Protocol Setup Verification & Quick Start${NC}"
echo "=================================================="

# Function to print status
print_status() {
    local status="$1"
    local message="$2"
    
    if [ "$status" = "OK" ]; then
        echo -e "  ${GREEN}✅ $message${NC}"
    elif [ "$status" = "WARN" ]; then
        echo -e "  ${YELLOW}⚠️ $message${NC}"
    else
        echo -e "  ${RED}❌ $message${NC}"
    fi
}

# Verify directory structure
verify_directories() {
    echo ""
    echo "📁 Verifying Directory Structure..."
    
    local required_dirs=(
        "$DIRK_BASE"
        "$DIRK_BASE/design_documents/active"
        "$DIRK_BASE/design_commands/pending"
        "$DIRK_BASE/active_tasks"
        "$DIRK_BASE/completed_tasks"
        "$DIRK_BASE/utilities"
        "$DIRK_BASE/.claude"
        "$DIRK_BASE/.claude/commands"
        "$DIRK_BASE/backups/auto"
        "$DIRK_BASE/context"
    )
    
    local dir_errors=0
    for dir in "${required_dirs[@]}"; do
        if [ -d "$dir" ]; then
            print_status "OK" "Directory exists: $(basename "$dir")"
        else
            print_status "ERROR" "Missing directory: $dir"
            ((dir_errors++))
        fi
    done
    
    if [ $dir_errors -eq 0 ]; then
        print_status "OK" "All required directories present"
    else
        print_status "ERROR" "$dir_errors missing directories"
    fi
}

# Verify dependencies
verify_dependencies() {
    echo ""
    echo "📦 Verifying Dependencies..."
    
    local tools=("gemini" "claude" "jq" "fswatch" "node" "npm")
    local dep_errors=0
    
    for tool in "${tools[@]}"; do
        if command -v "$tool" &> /dev/null; then
            local version=""
            case "$tool" in
                "node") version="$(node --version 2>/dev/null)" ;;
                "npm") version="$(npm --version 2>/dev/null)" ;;
                "jq") version="$(jq --version 2>/dev/null)" ;;
                *) version="installed" ;;
            esac
            print_status "OK" "$tool: $version"
        else
            print_status "ERROR" "$tool not found"
            ((dep_errors++))
        fi
    done
    
    if [ $dep_errors -eq 0 ]; then
        print_status "OK" "All dependencies available"
    else
        print_status "ERROR" "$dep_errors missing dependencies"
    fi
}

# Verify configuration files
verify_configuration() {
    echo ""
    echo "⚙️ Verifying Configuration Files..."
    
    # Check Claude Code settings
    if [ -f "$DIRK_BASE/.claude/settings.json" ]; then
        if jq '.' "$DIRK_BASE/.claude/settings.json" > /dev/null 2>&1; then
            print_status "OK" "Claude Code settings.json valid"
        else
            print_status "ERROR" "Claude Code settings.json invalid JSON"
        fi
    else
        print_status "ERROR" "Claude Code settings.json missing"
    fi
    
    # Check task registry
    if [ -f "$DIRK_BASE/task_registry.json" ]; then
        if jq '.' "$DIRK_BASE/task_registry.json" > /dev/null 2>&1; then
            print_status "OK" "Task registry valid"
        else
            print_status "ERROR" "Task registry invalid JSON"
        fi
    else
        print_status "ERROR" "Task registry missing"
    fi
    
    # Check custom commands
    local command_files=(
        "$DIRK_BASE/.claude/commands/check-dirk-tasks.md"
        "$DIRK_BASE/.claude/commands/consult-gemini.md"
        "$DIRK_BASE/.claude/commands/enforce-standards.md"
        "$DIRK_BASE/.claude/commands/complete-task.md"
    )
    
    local cmd_errors=0
    for cmd_file in "${command_files[@]}"; do
        if [ -f "$cmd_file" ]; then
            print_status "OK" "Command: $(basename "$cmd_file")"
        else
            print_status "ERROR" "Missing command: $(basename "$cmd_file")"
            ((cmd_errors++))
        fi
    done
    
    if [ $cmd_errors -eq 0 ]; then
        print_status "OK" "All custom commands present"
    fi
}

# Verify utilities
verify_utilities() {
    echo ""
    echo "🔧 Verifying Utilities..."
    
    local utilities=(
        "$DIRK_BASE/utilities/create_dirk_task.sh"
        "$DIRK_BASE/utilities/gemini_review.sh"
        "$DIRK_BASE/utilities/dirk_watcher.sh"
    )
    
    local util_errors=0
    for util in "${utilities[@]}"; do
        if [ -f "$util" ] && [ -x "$util" ]; then
            print_status "OK" "Utility: $(basename "$util")"
        else
            print_status "ERROR" "Missing or not executable: $(basename "$util")"
            ((util_errors++))
        fi
    done
    
    if [ $util_errors -eq 0 ]; then
        print_status "OK" "All utilities available and executable"
    fi
}

# Test basic functionality
test_functionality() {
    echo ""
    echo "🧪 Testing Basic Functionality..."
    
    # Test task creation utility
    if "$DIRK_BASE/utilities/create_dirk_task.sh" > /dev/null 2>&1; then
        print_status "OK" "Task creation utility responds"
    else
        print_status "ERROR" "Task creation utility failed"
    fi
    
    # Test review utility
    if "$DIRK_BASE/utilities/gemini_review.sh" status > /dev/null 2>&1; then
        print_status "OK" "Review utility responds"
    else
        print_status "ERROR" "Review utility failed"
    fi
    
    # Test watcher utility
    if "$DIRK_BASE/utilities/dirk_watcher.sh" status > /dev/null 2>&1; then
        print_status "OK" "Watcher utility responds"
    else
        print_status "ERROR" "Watcher utility failed"
    fi
}

# Show quick start guide
show_quick_start() {
    echo ""
    echo -e "${BLUE}🚀 DIRK Protocol Quick Start Guide${NC}"
    echo "=================================="
    echo ""
    
    echo -e "${YELLOW}1. Start the Automation Watcher${NC}"
    echo "   cd $DIRK_BASE"
    echo "   ./utilities/dirk_watcher.sh start"
    echo "   (This monitors for new tasks and sends macOS notifications)"
    echo ""
    
    echo -e "${YELLOW}2. Create a Task with Gemini CLI${NC}"
    echo "   ./utilities/create_dirk_task.sh task \"Build user authentication\" \"Implement OAuth2 authentication system with TypeScript\""
    echo "   OR"
    echo "   gemini \"Create a DIRK task to implement user authentication with OAuth2\""
    echo ""
    
    echo -e "${YELLOW}3. Implement with Claude Code${NC}"
    echo "   cd $DIRK_BASE"
    echo "   claude"
    echo "   (In Claude Code, use: /check-dirk-tasks)"
    echo ""
    
    echo -e "${YELLOW}4. Review with Gemini CLI${NC}"
    echo "   ./utilities/gemini_review.sh review"
    echo "   OR"
    echo "   gemini \"Review DIRK completed tasks and provide feedback\""
    echo ""
    
    echo -e "${BLUE}🔧 Available Commands in Claude Code:${NC}"
    echo "   /check-dirk-tasks    - Check for new tasks to implement"
    echo "   /consult-gemini      - Request architectural guidance"
    echo "   /enforce-standards   - Remind about DIRK standards"
    echo "   /complete-task       - Mark task complete and prepare for review"
    echo ""
    
    echo -e "${BLUE}🤖 Gemini CLI Integration:${NC}"
    echo "   gemini \"Create DIRK task for [description]\""
    echo "   gemini \"Review DIRK consultation requests\""
    echo "   gemini \"Check completed DIRK tasks\""
    echo ""
    
    echo -e "${BLUE}🔍 Monitoring & Status:${NC}"
    echo "   ./utilities/dirk_watcher.sh status   - Check watcher status"
    echo "   ./utilities/gemini_review.sh status  - Show protocol status"
    echo "   tail -f $DIRK_BASE/context/DIRK_CONTEXT.md  - View activity log"
    echo ""
    
    echo -e "${BLUE}💾 Safety Features Active:${NC}"
    echo "   ✅ Auto-backup before file changes"
    echo "   ✅ Production file protection"
    echo "   ✅ No minimal/demo version enforcement"
    echo "   ✅ TypeScript validation"
    echo "   ✅ Context logging with unique tags"
    echo ""
    
    echo -e "${GREEN}🎯 Complete Workflow Example:${NC}"
    echo "   1. Gemini creates task: ./utilities/create_dirk_task.sh task \"API endpoints\" \"Build REST API\""
    echo "   2. Watcher notifies: macOS notification appears"
    echo "   3. Claude implements: cd $DIRK_BASE && claude -> /check-dirk-tasks"
    echo "   4. Safety hooks: Auto-backup, validation, logging"
    echo "   5. Task completion: /complete-task in Claude Code"
    echo "   6. Gemini reviews: ./utilities/gemini_review.sh review"
    echo ""
}

# Show system status
show_system_status() {
    echo ""
    echo -e "${BLUE}📊 Current System Status${NC}"
    echo "========================"
    echo ""
    
    # Check if watcher is running
    if [ -f "/tmp/dirk_watcher.pid" ] && kill -0 "$(cat "/tmp/dirk_watcher.pid")" 2>/dev/null; then
        print_status "OK" "Automation watcher is running"
    else
        print_status "WARN" "Automation watcher is not running"
    fi
    
    # Count active tasks
    local active_tasks=$(find "$DIRK_BASE/active_tasks" -name "*.json" -type f 2>/dev/null | wc -l)
    echo -e "  📋 Active Tasks: $active_tasks"
    
    # Count completed tasks
    local completed_tasks=$(find "$DIRK_BASE/completed_tasks" -name "*.json" -type f 2>/dev/null | wc -l)
    echo -e "  ✅ Completed Tasks: $completed_tasks"
    
    # Count consultation requests
    local consultations=$(find "$DIRK_BASE/gemini_consultation_requests" -name "request_*.md" -type f 2>/dev/null | wc -l)
    echo -e "  ❓ Consultation Requests: $consultations"
    
    # Count recent backups
    local backups=$(find "$DIRK_BASE/backups/auto" -name "*.backup" -mtime -1 2>/dev/null | wc -l)
    echo -e "  💾 Recent Backups (24h): $backups"
    
    # Disk usage
    local disk_usage=$(du -sh "$DIRK_BASE" 2>/dev/null | cut -f1)
    echo -e "  💽 Disk Usage: $disk_usage"
}

# Main execution
main() {
    case "${1:-verify}" in
        "verify")
            verify_directories
            verify_dependencies
            verify_configuration
            verify_utilities
            test_functionality
            show_system_status
            show_quick_start
            ;;
        "status")
            show_system_status
            ;;
        "quick-start")
            show_quick_start
            ;;
        *)
            echo "Usage: $0 [verify|status|quick-start]"
            echo "  verify      - Complete system verification (default)"
            echo "  status      - Show current system status"
            echo "  quick-start - Show quick start guide only"
            ;;
    esac
}

main "$@"
