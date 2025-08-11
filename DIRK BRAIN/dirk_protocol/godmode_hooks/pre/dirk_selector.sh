#!/bin/bash
# DIRK Selector Hook - Intelligent DIRK variant selection

select_dirk() {
    local task="$1"
    local complexity_score=0
    
    # Analyze task complexity
    [[ "$task" =~ (implement|build|create|code) ]] && ((complexity_score+=2))
    [[ "$task" =~ (architect|design|plan) ]] && ((complexity_score+=3))
    [[ "$task" =~ (review|validate|test) ]] && ((complexity_score+=1))
    [[ "$task" =~ (full-stack|microservice|distributed) ]] && ((complexity_score+=5))
    
    # Select based on complexity
    if [ $complexity_score -ge 5 ]; then
        echo "MULTI-DIRK"
    elif [[ "$task" =~ (implement|code) ]]; then
        echo "DIRK.c"
    elif [[ "$task" =~ (architect|plan) ]]; then
        echo "DIRK.desktop"
    elif [[ "$task" =~ (review|validate) ]]; then
        echo "DIRK.g"
    else
        echo "DIRK.c"  # Default
    fi
}

# Export for use
select_dirk "$@"
