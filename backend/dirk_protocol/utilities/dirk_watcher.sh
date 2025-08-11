#!/bin/bash
# DIRK Protocol Automation Watcher
# Tag: #DIRK-MACOS-AUTOMATION-WATCHER-20250709-0001

set -eo pipefail

DIRK_BASE="/Users/izverg/Documents/dirk_protocol"
WATCH_INTERVAL=5
PID_FILE="/tmp/dirk_watcher.pid"

# Function to send macOS notification
send_notification() {
    local title="$1"
    local message="$2"
    local sound="${3:-default}"
    
    osascript -e "display notification \"$message\" with title \"DIRK Protocol: $title\" sound name \"$sound\""
}

# Function to check for new tasks
check_new_tasks() {
    local new_tasks=$(find "$DIRK_BASE/active_tasks" -name "*.json" -newer "$DIRK_BASE/.last_task_check" 2>/dev/null || echo "")
    
    if [ -n "$new_tasks" ]; then
        local task_count=$(echo "$new_tasks" | wc -l)
        echo "🎯 Found $task_count new task(s)"
        
        for task_file in $new_tasks; do
            local task_id=$(basename "$task_file" .json)
            local task_title=$(jq -r '.title // "Unknown Task"' "$task_file" 2>/dev/null)
            
            echo "  - $task_id: $task_title"
            send_notification "New Task Assigned" "Task: $task_title\nID: $task_id\nRun Claude Code to start implementation"
        done
        
        echo ""
        echo "🚀 Start implementation with: cd $DIRK_BASE && claude"
        echo "🔧 Use '/check-dirk-tasks' command in Claude Code"
    fi
    
    touch "$DIRK_BASE/.last_task_check"
}

# Function to check for consultation requests
check_consultation_requests() {
    local new_requests=$(find "$DIRK_BASE/gemini_consultation_requests" -name "request_*.md" -newer "$DIRK_BASE/.last_consult_check" 2>/dev/null || echo "")
    
    if [ -n "$new_requests" ]; then
        local request_count=$(echo "$new_requests" | wc -l)
        echo "❓ Found $request_count new consultation request(s)"
        
        for request_file in $new_requests; do
            local request_name=$(basename "$request_file")
            echo "  - $request_name"
        done
        
        send_notification "Consultation Needed" "DIRK.c has $request_count consultation request(s)\nRun Gemini CLI to provide guidance"
        echo ""
        echo "🤖 Process with: gemini \"Review DIRK consultation requests and provide guidance\""
    fi
    
    touch "$DIRK_BASE/.last_consult_check"
}

# Function to check for completed tasks
check_completed_tasks() {
    local completed_tasks=$(find "$DIRK_BASE/completed_tasks" -name "*.json" -newer "$DIRK_BASE/.last_review_check" 2>/dev/null || echo "")
    
    if [ -n "$completed_tasks" ]; then
        local completed_count=$(echo "$completed_tasks" | wc -l)
        echo "✅ Found $completed_count completed task(s) for review"
        
        for task_file in $completed_tasks; do
            local task_id=$(basename "$task_file" .json)
            local task_title=$(jq -r '.title // "Unknown Task"' "$task_file" 2>/dev/null)
            echo "  - $task_id: $task_title"
        done
        
        send_notification "Tasks Ready for Review" "$completed_count task(s) completed\nRun DIRK.g review process"
        echo ""
        echo "🔍 Review with: $DIRK_BASE/utilities/gemini_review.sh review"
    fi
    
    touch "$DIRK_BASE/.last_review_check"
}

# Function to monitor system health
check_system_health() {
    # Check if backup directory is growing too large (>1GB)
    local backup_size=$(du -s "$DIRK_BASE/backups" 2>/dev/null | awk '{print $1}' || echo "0")
    
    if [ "$backup_size" -gt 1048576 ]; then  # 1GB in KB
        echo "⚠️ Backup directory size: ${backup_size}KB (>1GB)"
        send_notification "Storage Warning" "DIRK backups exceed 1GB\nConsider cleanup"
    fi
    
    # Check for stale tasks (>7 days old)
    local stale_tasks=$(find "$DIRK_BASE/active_tasks" -name "*.json" -mtime +7 2>/dev/null | wc -l)
    
    if [ "$stale_tasks" -gt 0 ]; then
        echo "⏰ Found $stale_tasks stale task(s) (>7 days old)"
        send_notification "Stale Tasks" "$stale_tasks task(s) are overdue\nReview and update"
    fi
}

# Function to start monitoring
start_watcher() {
    echo "🔄 Starting DIRK Protocol Automation Watcher"
    echo "📁 Monitoring: $DIRK_BASE"
    echo "⏰ Check interval: ${WATCH_INTERVAL}s"
    echo "🆔 PID: $$"
    
    # Save PID for stop function
    echo $$ > "$PID_FILE"
    
    # Initialize check files
    touch "$DIRK_BASE/.last_task_check"
    touch "$DIRK_BASE/.last_consult_check" 
    touch "$DIRK_BASE/.last_review_check"
    
    # Log start
    echo "#DIRK-WATCHER-START-$(date +%Y%m%d_%H%M%S): Automation watcher started" >> "$DIRK_BASE/context/DIRK_CONTEXT.md"
    
    send_notification "Watcher Started" "DIRK automation monitoring active"
    
    # Main monitoring loop
    while true; do
        echo "🔍 Checking DIRK protocol status... $(date '+%H:%M:%S')"
        
        check_new_tasks
        check_consultation_requests
        check_completed_tasks
        check_system_health
        
        echo "✅ Check complete, sleeping ${WATCH_INTERVAL}s..."
        echo ""
        
        sleep $WATCH_INTERVAL
    done
}

# Function to stop monitoring
stop_watcher() {
    if [ -f "$PID_FILE" ]; then
        local pid=$(cat "$PID_FILE")
        if kill -0 "$pid" 2>/dev/null; then
            echo "🛑 Stopping DIRK watcher (PID: $pid)"
            kill "$pid"
            rm -f "$PID_FILE"
            
            # Log stop
            echo "#DIRK-WATCHER-STOP-$(date +%Y%m%d_%H%M%S): Automation watcher stopped" >> "$DIRK_BASE/context/DIRK_CONTEXT.md"
            
            send_notification "Watcher Stopped" "DIRK automation monitoring disabled"
            echo "✅ DIRK watcher stopped"
        else
            echo "❌ Watcher process not found"
            rm -f "$PID_FILE"
        fi
    else
        echo "❌ No watcher PID file found"
    fi
}

# Function to show watcher status
show_watcher_status() {
    if [ -f "$PID_FILE" ]; then
        local pid=$(cat "$PID_FILE")
        if kill -0 "$pid" 2>/dev/null; then
            echo "✅ DIRK watcher is running (PID: $pid)"
            echo "📊 Process info:"
            ps -p "$pid" -o pid,ppid,time,command 2>/dev/null || echo "   Process details unavailable"
        else
            echo "❌ DIRK watcher is not running (stale PID file)"
            rm -f "$PID_FILE"
        fi
    else
        echo "❌ DIRK watcher is not running"
    fi
}

# Function to show usage
show_usage() {
    echo "🔄 DIRK Protocol Automation Watcher"
    echo "Usage:"
    echo "  $0 start    - Start monitoring DIRK protocol"
    echo "  $0 stop     - Stop monitoring"
    echo "  $0 status   - Show watcher status"
    echo "  $0 once     - Run checks once (no continuous monitoring)"
    echo ""
    echo "Monitoring Features:"
    echo "  - New task assignments from DIRK.d"
    echo "  - Consultation requests from DIRK.c"
    echo "  - Completed tasks ready for review"
    echo "  - System health and storage warnings"
    echo "  - macOS notifications for all events"
}

# Function to run checks once
run_once() {
    echo "🔍 Running DIRK protocol checks once..."
    
    # Initialize check files if they don't exist
    [ ! -f "$DIRK_BASE/.last_task_check" ] && touch "$DIRK_BASE/.last_task_check"
    [ ! -f "$DIRK_BASE/.last_consult_check" ] && touch "$DIRK_BASE/.last_consult_check"
    [ ! -f "$DIRK_BASE/.last_review_check" ] && touch "$DIRK_BASE/.last_review_check"
    
    check_new_tasks
    check_consultation_requests
    check_completed_tasks
    check_system_health
    
    echo "✅ Single check complete"
}

# Main execution
main() {
    # Ensure DIRK directory exists
    if [ ! -d "$DIRK_BASE" ]; then
        echo "❌ DIRK protocol directory not found: $DIRK_BASE"
        echo "🔧 Run setup first: ~/Documents/dirk_workflow_architect.sh"
        exit 1
    fi
    
    case "${1:-}" in
        "start")
            if [ -f "$PID_FILE" ] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then
                echo "❌ DIRK watcher is already running"
                exit 1
            fi
            start_watcher
            ;;
        "stop")
            stop_watcher
            ;;
        "status")
            show_watcher_status
            ;;
        "once")
            run_once
            ;;
        *)
            show_usage
            exit 1
            ;;
    esac
}

main "$@"
