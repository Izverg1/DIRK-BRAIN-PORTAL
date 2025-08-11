#!/bin/bash
# Global DIRK Protocol Setup - Project Agnostic
# Tag: #DIRK-MACOS-GLOBAL-SETUP-20250709-0001

set -eo pipefail

echo "🌐 Converting DIRK Protocol to Global Multi-Project System"
echo "========================================================"

# Create global DIRK configuration
setup_global_dirk() {
    echo "📁 Setting up global DIRK configuration..."
    
    # Create global Claude commands directory
    mkdir -p ~/.claude/commands
    
    # Copy DIRK commands to global location
    echo "📋 Installing global DIRK commands..."
    
    # Global check-dirk-tasks command
    cat > ~/.claude/commands/check-dirk-tasks.md << 'EOF'
---
description: Check for DIRK tasks in current project or global DIRK protocol
---

# Check DIRK Tasks (Global)

## Context
I need to check for DIRK tasks in the current project directory or global DIRK protocol location.

## Instructions
1. Look for DIRK protocol directory in current project:
   - Check for `.dirk/` directory in current location
   - Check for `dirk_protocol/` directory in current location
   - Fall back to global DIRK protocol at `/Users/izverg/Documents/dirk_protocol/`

2. Search for tasks in this priority order:
   - `./dirk_protocol/active_tasks/`
   - `./.dirk/active_tasks/`
   - `/Users/izverg/Documents/dirk_protocol/active_tasks/`

3. For each task found:
   - Read the task specification completely
   - Understand the requirements and acceptance criteria
   - Review any referenced design documents
   - Create an implementation plan
   - Begin implementation according to DIRK standards

## Project Detection Logic
```bash
# Detect DIRK location for current project
if [ -d "./dirk_protocol" ]; then
    DIRK_BASE="./dirk_protocol"
elif [ -d "./.dirk" ]; then
    DIRK_BASE="./.dirk"
else
    DIRK_BASE="/Users/izverg/Documents/dirk_protocol"
fi
```

## CRITICAL DIRK RULES
- NEVER create minimal, demo, or simulated versions
- ALWAYS build real, production-ready implementations
- FOLLOW all TypeScript domain modeling requirements
- RESPECT macOS security constraints
- CREATE comprehensive tests for all functionality

## Action Items
- Detect current project context
- Find appropriate DIRK protocol location
- Read and understand all task requirements
- Begin implementation with proper safety hooks
EOF

    # Global consult-gemini command
    cat > ~/.claude/commands/consult-gemini.md << 'EOF'
---
description: Request consultation from DIRK.g (Gemini) - works in any project
---

# Consult DIRK.g (Global)

## Context
I need architectural guidance from DIRK.g (Gemini) and will create the request in the appropriate location based on current project.

## Instructions
1. Detect DIRK protocol location:
   - Current project: `./dirk_protocol/` or `./.dirk/`
   - Global fallback: `/Users/izverg/Documents/dirk_protocol/`

2. Create consultation request in `{DIRK_BASE}/gemini_consultation_requests/`

3. Include project context:
   - Current working directory
   - Project type detection (from package.json, requirements.txt, etc.)
   - Relevant files in current project
   - Specific architectural challenge

## Request Format
```markdown
# DIRK.g Consultation Request

## Project Context
- **Project Directory**: {PWD}
- **Project Type**: {Detected from files}
- **DIRK Location**: {DIRK_BASE}

## Problem Statement
{Clear description of the challenge}

## Current Implementation Context
{What exists in current project}

## Specific Questions
1. {Architecture question}
2. {Implementation question}

## Files Referenced
{List current project files}
```

## Action Items
- Detect current project and DIRK location
- Create comprehensive consultation request
- Include all relevant project context
- Suggest running Gemini CLI to process request
EOF

    # Global enforce-standards command
    cat > ~/.claude/commands/enforce-standards.md << 'EOF'
---
description: Enforce DIRK standards in any project context
---

# Enforce DIRK Standards (Global)

## Context
As DIRK.c, I must enforce DIRK standards regardless of which project I'm working in.

## Universal DIRK Standards

### IMPLEMENTATION STANDARDS
1. **NEVER SIMULATE ANYTHING** - Always build real, functional code
2. **NO MINIMAL VERSIONS** - Never create "simpler" or "demo" versions  
3. **NO PARTIAL CODE** - Complete all functionality before submission
4. **BUILD PRODUCTION-READY** - Code must be enterprise-grade quality

### PROJECT-AGNOSTIC REQUIREMENTS
1. **Detect Project Type** - Adapt to current project's language/framework
2. **Use Project Standards** - Follow existing code style and patterns
3. **Maintain Safety** - All operations include backup and validation
4. **Document Everything** - Include comprehensive documentation

### QUALITY GATES (Universal)
1. **Functionality** - All features work as specified
2. **Testing** - Comprehensive test coverage
3. **Documentation** - Clear, complete documentation
4. **Integration** - Proper integration with existing codebase

## Instructions
1. Assess current project context and requirements
2. Apply DIRK standards to current project type
3. Ensure all work meets production quality
4. Never compromise on quality regardless of project

## Action Items
- Review current implementation approach
- Apply DIRK standards to current project context
- Ensure production-ready quality
- Document all decisions and implementations
EOF

    # Global complete-task command  
    cat > ~/.claude/commands/complete-task.md << 'EOF'
---
description: Complete DIRK task in current project context
---

# Complete DIRK Task (Global)

## Context
I have finished implementing a task and need to mark it complete, regardless of project location.

## Instructions
1. Detect DIRK protocol location for current project
2. Finalize all implementation work in current project
3. Run comprehensive validation
4. Update task status and move to completed
5. Create implementation summary with project context

## Project-Aware Completion
```bash
# Detect project type and adapt completion process
if [ -f "package.json" ]; then
    PROJECT_TYPE="Node.js/TypeScript"
    RUN_TESTS="npm test"
elif [ -f "requirements.txt" ]; then
    PROJECT_TYPE="Python"
    RUN_TESTS="python -m pytest"
elif [ -f "Cargo.toml" ]; then
    PROJECT_TYPE="Rust"
    RUN_TESTS="cargo test"
else
    PROJECT_TYPE="Generic"
    RUN_TESTS="echo 'No automated tests configured'"
fi
```

## Completion Checklist
- [ ] All functionality implemented in current project
- [ ] Project-specific tests written and passing
- [ ] Documentation updated for current project
- [ ] Integration with existing codebase verified
- [ ] DIRK standards compliance confirmed

## Action Items
- Complete implementation in current project context
- Validate against project-specific requirements
- Move task to completed status
- Generate review documentation
EOF

    echo "✅ Global DIRK commands installed to ~/.claude/commands/"
}

# Create global DIRK settings template
setup_global_settings() {
    echo "⚙️ Setting up global DIRK settings..."
    
    # Create global Claude settings with DIRK hooks
    cat > ~/.claude/settings.json << 'EOF'
{
  "hooks": {
    "PreToolUse": [
      {
        "name": "dirk_global_backup",
        "matcher": "Write",
        "hooks": [
          {
            "type": "command",
            "command": "DIRK_BASE=\"./dirk_protocol\"; [ ! -d \"$DIRK_BASE\" ] && DIRK_BASE=\"./.dirk\"; [ ! -d \"$DIRK_BASE\" ] && DIRK_BASE=\"/Users/izverg/Documents/dirk_protocol\"; mkdir -p \"$DIRK_BASE/backups/auto/$(date +%Y%m%d)\" && if [ -f \"$CLAUDE_FILE_PATHS\" ]; then cp \"$CLAUDE_FILE_PATHS\" \"$DIRK_BASE/backups/auto/$(date +%Y%m%d)/$(basename \"$CLAUDE_FILE_PATHS\")-$(date +%H%M%S).backup\" 2>/dev/null && echo '💾 DIRK: Global backup created'; fi"
          }
        ]
      },
      {
        "name": "dirk_global_standards_enforcement",
        "matcher": "Write", 
        "hooks": [
          {
            "type": "command",
            "command": "if echo \"$CLAUDE_FILE_PATHS\" | grep -E '(minimal|simple|demo|mock)' && ! echo \"$CLAUDE_FILE_PATHS\" | grep -E '\\.(test|spec)\\.' ; then echo '🚫 DIRK GLOBAL VIOLATION: No minimal/demo versions allowed in any project.' && exit 1; fi"
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "name": "dirk_global_context_logging",
        "matcher": "Write",
        "hooks": [
          {
            "type": "command", 
            "command": "DIRK_BASE=\"./dirk_protocol\"; [ ! -d \"$DIRK_BASE\" ] && DIRK_BASE=\"./.dirk\"; [ ! -d \"$DIRK_BASE\" ] && DIRK_BASE=\"/Users/izverg/Documents/dirk_protocol\"; echo \"#DIRK-GLOBAL-$(date +%Y%m%d)-$(printf '%04d' $RANDOM): File modified: $CLAUDE_FILE_PATHS in project: $(pwd) at $(date -Iseconds)\" >> \"$DIRK_BASE/context/DIRK_CONTEXT.md\""
          }
        ]
      }
    ]
  },
  "permissions": {
    "allow": [
      "Bash(npm run *)",
      "Bash(git *)", 
      "Bash(python3 *)",
      "Bash(cargo *)",
      "Read(*)",
      "Write(*)"
    ],
    "deny": [
      "Bash(rm -rf *)",
      "Bash(sudo *)",
      "Write(*.production.*)"
    ]
  }
}
EOF

    echo "✅ Global DIRK settings created at ~/.claude/settings.json"
}

# Create project initialization script
create_project_init() {
    echo "🚀 Creating project initialization script..."
    
    cat > /Users/izverg/Documents/dirk_protocol/utilities/init_project_dirk.sh << 'EOF'
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
EOF

    chmod +x /Users/izverg/Documents/dirk_protocol/utilities/init_project_dirk.sh
    echo "✅ Project initialization script created"
}

# Main execution
main() {
    setup_global_dirk
    setup_global_settings
    create_project_init
    
    echo ""
    echo "🎉 DIRK Protocol is now GLOBAL and PROJECT-AGNOSTIC!"
    echo ""
    echo "📋 What Changed:"
    echo "  ✅ DIRK commands available globally (anywhere you run Claude)"
    echo "  ✅ Safety hooks work in any project"
    echo "  ✅ Auto-detects project type and adapts"
    echo "  ✅ Can use local .dirk/ or global protocol"
    echo ""
    echo "🚀 Usage:"
    echo "  1. For existing projects: cd /path/to/your/project && claude"
    echo "  2. For new projects: cd /path/to/project && /Users/izverg/Documents/dirk_protocol/utilities/init_project_dirk.sh"
    echo "  3. Commands work everywhere: /check-dirk-tasks, /consult-gemini, etc."
    echo ""
    echo "🕷️ For CrawlZilla:"
    echo "  cd /path/to/crawlzilla && claude"
    echo "  All DIRK commands will work automatically!"
}

main "$@"
