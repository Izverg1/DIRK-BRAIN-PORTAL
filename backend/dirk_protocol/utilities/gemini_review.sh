#!/bin/bash
# Gemini CLI Review System for DIRK Protocol
# Tag: #DIRK-MACOS-GEMINI-REVIEW-20250709-0001

set -eo pipefail

DIRK_BASE="/Users/izverg/Documents/dirk_protocol"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Function to review completed tasks
review_completed_tasks() {
    echo "🔍 DIRK.g reviewing completed tasks..."
    
    local completed_tasks=$(find "$DIRK_BASE/completed_tasks" -name "*.json" -type f 2>/dev/null)
    
    if [ -z "$completed_tasks" ]; then
        echo "📝 No completed tasks found for review."
        return 0
    fi
    
    # Generate review summary
    cat > "$DIRK_BASE/gemini_consultation_requests/review_summary_$TIMESTAMP.md" << 'EOF'
# DIRK.g Task Review Summary

## Review Session Information
- **Reviewer**: DIRK.g (Gemini CLI)
- **Review Date**: $(date -Iseconds)
- **Session ID**: DIRK-REVIEW-$TIMESTAMP

## Tasks Under Review

EOF

    # Process each completed task
    local task_count=0
    for task_file in $completed_tasks; do
        ((task_count++))
        local task_id=$(basename "$task_file" .json)
        local task_title=$(jq -r '.title // "Unknown"' "$task_file" 2>/dev/null)
        local task_status=$(jq -r '.status // "Unknown"' "$task_file" 2>/dev/null)
        
        cat >> "$DIRK_BASE/gemini_consultation_requests/review_summary_$TIMESTAMP.md" << EOF

### Task $task_count: $task_id
- **Title**: $task_title
- **Status**: $task_status
- **File**: \`$task_file\`
- **Implementation Summary**: [To be reviewed by DIRK.g]

**Review Checklist**:
- [ ] Meets design specifications
- [ ] Follows DIRK standards (no minimal versions)
- [ ] TypeScript domain modeling implemented
- [ ] Comprehensive testing included
- [ ] macOS integration proper
- [ ] Security requirements met
- [ ] Documentation complete
- [ ] Performance acceptable

**Review Notes**: [DIRK.g to add detailed review]

EOF
    done
    
    cat >> "$DIRK_BASE/gemini_consultation_requests/review_summary_$TIMESTAMP.md" << 'EOF'

## Overall Assessment
[DIRK.g to provide overall assessment of implementation quality]

## Recommendations
[DIRK.g to provide specific recommendations for improvements]

## Approval Status
- [ ] Approved for production
- [ ] Requires minor modifications
- [ ] Requires major rework
- [ ] Rejected

## Next Steps
[DIRK.g to specify next steps for each task]

EOF

    echo "✅ Review summary generated: $DIRK_BASE/gemini_consultation_requests/review_summary_$TIMESTAMP.md"
    echo "🤖 Run: gemini \"Review the DIRK task summary and provide detailed feedback\""
}

# Function to check consultation requests
check_consultation_requests() {
    echo "📋 Checking for consultation requests..."
    
    local requests=$(find "$DIRK_BASE/gemini_consultation_requests" -name "request_*.md" -type f 2>/dev/null)
    
    if [ -z "$requests" ]; then
        echo "📝 No consultation requests found."
        return 0
    fi
    
    echo "🔍 Found consultation requests:"
    for request in $requests; do
        local filename=$(basename "$request")
        echo "  - $filename"
    done
    
    echo ""
    echo "🤖 Run: gemini \"Review DIRK consultation requests and provide architectural guidance\""
}

# Function to process design command responses
process_design_responses() {
    echo "📝 Processing design command responses..."
    
    # Create response template for Gemini
    cat > "$DIRK_BASE/gemini_consultation_requests/design_response_template_$TIMESTAMP.md" << 'EOF'
# DIRK.d Design Response Template

## Response Information
- **Responder**: DIRK.d (Gemini)
- **Response Date**: $(date -Iseconds)
- **Session ID**: DIRK-RESPONSE-$TIMESTAMP

## Design Commands to Address

### Pending Commands
[List of pending design commands requiring response]

### Response Format for Each Command

#### Command ID: [COMMAND_ID]
**Status**: APPROVED / REJECTED / MODIFIED

**Implementation Guidance**:
- [Specific implementation instructions]
- [Architectural patterns to follow]
- [Technology stack decisions]
- [Integration requirements]

**Quality Requirements**:
- [Performance criteria]
- [Security requirements]
- [Testing standards]
- [Documentation requirements]

**Acceptance Criteria Updates**:
- [Any modifications to acceptance criteria]

**Risk Assessment**:
- [Potential risks and mitigation strategies]

**Timeline Expectations**:
- [Expected completion timeline]

EOF

    echo "✅ Design response template generated"
}

# Function to show status
show_status() {
    echo "📊 DIRK Protocol Status Summary"
    echo "==============================="
    echo ""
    
    # Active tasks
    local active_count=$(find "$DIRK_BASE/active_tasks" -name "*.json" -type f 2>/dev/null | wc -l)
    echo "📋 Active Tasks: $active_count"
    
    # Completed tasks
    local completed_count=$(find "$DIRK_BASE/completed_tasks" -name "*.json" -type f 2>/dev/null | wc -l)
    echo "✅ Completed Tasks: $completed_count"
    
    # Pending design commands
    local pending_commands=$(find "$DIRK_BASE/design_commands/pending" -name "*.json" -type f 2>/dev/null | wc -l)
    echo "📋 Pending Design Commands: $pending_commands"
    
    # Consultation requests
    local consultation_requests=$(find "$DIRK_BASE/gemini_consultation_requests" -name "request_*.md" -type f 2>/dev/null | wc -l)
    echo "❓ Consultation Requests: $consultation_requests"
    
    # Recent backups
    local backup_count=$(find "$DIRK_BASE/backups/auto" -name "*.backup" -mtime -1 2>/dev/null | wc -l)
    echo "💾 Recent Backups (24h): $backup_count"
    
    echo ""
    echo "🕐 Last Updated: $(date)"
}

# Function to provide usage help
show_usage() {
    echo "🤖 DIRK Gemini Review System"
    echo "Usage:"
    echo "  $0 review          - Review completed tasks"
    echo "  $0 consult         - Check consultation requests"
    echo "  $0 design          - Process design responses"
    echo "  $0 status          - Show protocol status"
    echo ""
    echo "Integration with Gemini CLI:"
    echo '  gemini "Review DIRK completed tasks and provide feedback"'
    echo '  gemini "Check DIRK consultation requests and provide guidance"'
    echo '  gemini "Create new DIRK task for implementing user authentication"'
}

# Main execution
main() {
    if [ $# -eq 0 ]; then
        show_usage
        exit 1
    fi
    
    case "$1" in
        "review")
            review_completed_tasks
            ;;
        "consult")
            check_consultation_requests
            ;;
        "design")
            process_design_responses
            ;;
        "status")
            show_status
            ;;
        *)
            echo "❌ Error: Unknown action '$1'"
            show_usage
            exit 1
            ;;
    esac
}

main "$@"
