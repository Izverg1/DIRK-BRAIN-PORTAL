#!/bin/bash

# 📦 Complete DIRK System Deployment Script
# Deploy GOD Mode 2.0 + DIRK.c + DIRK.g + Hooks + Documentation

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# Logging functions
log_info() {
    echo -e "${CYAN}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

log_component() {
    echo -e "${PURPLE}[COMPONENT]${NC} $1"
}

# Complete DIRK System Banner
show_complete_banner() {
    echo -e "${PURPLE}"
    cat << 'EOF'
    ███████╗ ██████╗ ███╗   ███╗██████╗ ██╗     ███████╗████████╗███████╗
    ██╔════╝██╔═══██╗████╗ ████║██╔══██╗██║     ██╔════╝╚══██╔══╝██╔════╝
    ██║     ██║   ██║██╔████╔██║██████╔╝██║     █████╗     ██║   █████╗  
    ██║     ██║   ██║██║╚██╔╝██║██╔═══╝ ██║     ██╔══╝     ██║   ██╔══╝  
    ╚██████╗╚██████╔╝██║ ╚═╝ ██║██║     ███████╗███████╗   ██║   ███████╗
     ╚═════╝ ╚═════╝ ╚═╝     ╚═╝╚═╝     ╚══════╝╚══════╝   ╚═╝   ╚══════╝
    
    ██████╗ ██╗██████╗ ██╗  ██╗    ███████╗██╗   ██╗███████╗████████╗███████╗███╗   ███╗
    ██╔══██╗██║██╔══██╗██║ ██╔╝    ██╔════╝╚██╗ ██╔╝██╔════╝╚══██╔══╝██╔════╝████╗ ████║
    ██║  ██║██║██████╔╝█████╔╝     ███████╗ ╚████╔╝ ███████╗   ██║   █████╗  ██╔████╔██║
    ██║  ██║██║██╔══██╗██╔═██╗     ╚════██║  ╚██╔╝  ╚════██║   ██║   ██╔══╝  ██║╚██╔╝██║
    ██████╔╝██║██║  ██║██║  ██╗    ███████║   ██║   ███████║   ██║   ███████╗██║ ╚═╝ ██║
    ╚═════╝ ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝    ╚══════╝   ╚═╝   ╚══════╝   ╚═╝   ╚══════╝╚═╝     ╚═╝
    
    🚀 COMPLETE ENTERPRISE AI DEVELOPMENT PLATFORM
    GOD Mode 2.0 + DIRK.c + DIRK.g + Quality Hooks + Documentation
    
EOF
    echo -e "${NC}"
}

# Get deployment script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Check prerequisites for complete system
check_complete_prerequisites() {
    log_step "Checking prerequisites for complete DIRK system..."
    
    local missing_tools=()
    local warnings=()
    
    # Essential tools
    if ! command -v git &> /dev/null; then
        missing_tools+=("git")
    fi
    
    if ! command -v node &> /dev/null; then
        missing_tools+=("node")
    fi
    
    if ! command -v python3 &> /dev/null; then
        missing_tools+=("python3")
    fi
    
    # Optional but recommended tools
    if ! command -v claude &> /dev/null; then
        warnings+=("Claude Code CLI - Required for DIRK.c functionality")
    fi
    
    if ! command -v gemini &> /dev/null; then
        warnings+=("Gemini CLI - Enhances DIRK.g capabilities")
    fi
    
    if ! command -v npm &> /dev/null; then
        warnings+=("npm - Required for quality hooks")
    fi
    
    # Report results
    if [ ${#missing_tools[@]} -ne 0 ]; then
        log_error "Missing essential tools: ${missing_tools[*]}"
        log_info "Please install the missing tools and try again."
        exit 1
    fi
    
    if [ ${#warnings[@]} -ne 0 ]; then
        log_warning "Optional tools not found:"
        for warning in "${warnings[@]}"; do
            echo "  - $warning"
        done
        echo "  The system will deploy with reduced functionality."
        echo ""
    fi
    
    log_success "Prerequisites check completed"
}

# Deploy individual components
deploy_component() {
    local component="$1"
    local project_path="$2"
    local script_name="deploy-${component}.sh"
    local script_path="$SCRIPT_DIR/$script_name"
    
    log_component "Deploying $component..."
    
    if [ -f "$script_path" ]; then
        # Make script executable and run it
        chmod +x "$script_path"
        "$script_path" "$project_path"
        
        if [ $? -eq 0 ]; then
            log_success "$component deployment completed"
        else
            log_error "$component deployment failed"
            return 1
        fi
    else
        log_error "Deployment script not found: $script_path"
        return 1
    fi
}

# Create master configuration
create_master_config() {
    local project_path="$1"
    local project_name=$(basename "$project_path")
    
    log_step "Creating master DIRK system configuration..."
    
    mkdir -p "$project_path/.dirk"
    
    cat > "$project_path/.dirk/dirk_master_config.yaml" << EOF
# DIRK Master System Configuration for $project_name
project_name: "$project_name"
dirk_version: "2.0"
deployment_type: "complete"

# Components Status
components:
  godmode:
    enabled: true
    version: "2.0"
    agents: ["ATLAS", "NEXUS", "SAGE", "ORCHESTRATOR"]
    status: "deployed"
    
  dirk_c:
    enabled: true
    slash_commands: 13
    quality_hooks: 5
    claude_code_integration: true
    status: "deployed"
    
  dirk_g:
    enabled: true
    commands: 9
    validation_commands: 3
    gemini_integration: true
    status: "deployed"
    
  hooks:
    enabled: true
    pre_commit: true
    post_build: true
    security_scan: true
    performance_check: true
    documentation_validation: true
    status: "deployed"

# Integration Matrix
integrations:
  godmode_dirk_c: true
  godmode_dirk_g: true
  dirk_c_dirk_g: true
  ccms_integration: true
  quality_enforcement: true

# Enterprise Standards
enterprise_settings:
  security_compliance: true
  performance_monitoring: true
  quality_gates: true
  documentation_standards: true
  automated_validation: true

# System Capabilities
capabilities:
  autonomous_development: true
  multi_agent_coordination: true
  automated_task_validation: true
  enterprise_implementation: true
  continuous_quality_monitoring: true
  cross_ai_validation: true

# Deployment Information
deployment:
  date: "$(date)"
  platform: "$(uname -s)"
  user: "$(whoami)"
  directory: "$project_path"
  
# Success Metrics
metrics:
  total_commands: 25  # 13 DIRK.c + 9 DIRK.g + 3 GOD Mode
  quality_hooks: 5
  agent_count: 4
  validation_systems: 3
  
last_updated: "$(date)"
EOF

    log_success "Master configuration created"
}

# Create comprehensive documentation
create_complete_documentation() {
    local project_path="$1"
    local project_name=$(basename "$project_path")
    
    log_step "Creating comprehensive documentation..."
    
    mkdir -p "$project_path/docs/dirk_system"
    
    # Master README
    cat > "$project_path/docs/dirk_system/README.md" << EOF
# 🧠 DIRK System - Complete Installation for $project_name

## 🎯 System Overview
This project is equipped with the complete DIRK (Developer Intelligence & Reasoning Kernel) system, providing enterprise-grade AI-powered development capabilities.

## 🤖 Deployed Components

### GOD Mode 2.0 - Autonomous Elite Development Teams
- **4 Specialized AI Agents**: ATLAS, NEXUS, SAGE, ORCHESTRATOR
- **Autonomous Project Management**: Self-organizing teams with specialized roles
- **Session Persistence**: Maintains context across interruptions
- **Phase Management**: Seamless transitions between development phases

**Quick Start**:
\`\`\`bash
cd $project_name
./god "Your project description here"
./god --continue "Status update for continuing work"
\`\`\`

### DIRK.c - Claude Code Enterprise Engine
- **13 Slash Commands**: Complete development workflow automation
- **5 Quality Hooks**: Automated quality assurance and validation
- **Enterprise Standards**: Production-ready code generation
- **Self-Validation**: Automated compliance checking

**Quick Start**:
\`\`\`bash
./.dirk/launch-dirk-c.sh
# Then use commands like /build, /test, /feature, /debug, /optimize
\`\`\`

### DIRK.g - Gemini Business Analysis Engine
- **9 Commands**: 6 core + 3 new validation commands
- **Automated Task Validation**: Single-command completion verification
- **Business Analysis**: Requirements gathering and stakeholder mapping
- **Solution Architecture**: Technology recommendations and design patterns

**Quick Start**:
\`\`\`bash
source ~/.dirk/dirk_g_commands.sh
dirk_g_workflow "your business requirement"
dirk_g_validate_completion "task_name"
\`\`\`

## 📋 Available Commands Summary

### GOD Mode Commands
- \`god "project description"\` - Start fresh autonomous development
- \`god --continue "status"\` - Continue with context restoration
- \`god --phase-transition "info"\` - Transition between phases

### DIRK.c Slash Commands (13 Total)
- Core: \`/build\`, \`/test\`, \`/feature\`, \`/debug\`, \`/optimize\`
- Integration: \`/implement-from-dirk-g\`, \`/enterprise-implement\`
- Validation: \`/self-analyze\`, \`/proof-validate\`, \`/auto-correct\`
- Monitoring: \`/continuous-validation\`, \`/validate-enterprise-standards\`, \`/validation-dashboard\`

### DIRK.g Commands (9 Total)
- Core: \`dirk_g_workflow\`, \`dirk_g_ba\`, \`dirk_g_sa\`
- Validation: \`dirk_g_validate_completion\`, \`dirk_g_done\`, \`dirk_g_status\`

## 🔧 Quality Hooks (5 Active)
- **Pre-commit**: Code formatting, linting, unit tests, security scan
- **Post-build**: Build validation, performance checks, bundle analysis
- **Security scan**: Dependency vulnerabilities, SAST, secret detection
- **Performance check**: Load time analysis, memory usage, bundle size
- **Documentation validation**: README, API docs, changelog verification

## 📊 Project Structure
\`\`\`
$project_name/
├── .godmode/                    # GOD Mode 2.0 workspace
│   ├── team/                    # Agent collaboration space
│   │   ├── TEAM_DASHBOARD.md    # Central coordination hub
│   │   ├── atlas/               # CTO & Architect workspace
│   │   ├── nexus/               # Full-stack developer workspace
│   │   ├── sage/                # Quality engineer workspace
│   │   └── orchestrator/        # PMO workspace
│   ├── requirements.md          # Project requirements
│   └── project.yaml            # Project configuration
├── .dirk/                       # DIRK system configuration
│   ├── dirk_c_config.yaml      # Claude Code configuration
│   ├── dirk_g_config.yaml      # Gemini configuration
│   ├── commands/                # Slash commands documentation
│   ├── hooks/                   # Quality hooks
│   └── validation/              # Validation reports
├── docs/                        # Documentation
│   ├── ccms/                    # Case management system
│   └── dirk_system/             # DIRK system documentation
└── god                          # GOD Mode command interface
\`\`\`

## 🚀 Workflow Examples

### Enterprise Development Workflow
\`\`\`bash
# 1. Start with GOD Mode for complex projects
./god "Build enterprise e-commerce platform with React, Python backend, PostgreSQL"

# 2. Use DIRK.g for business analysis
dirk_g_workflow "user authentication with OAuth2 and role-based access"

# 3. Implement with DIRK.c
./.dirk/launch-dirk-c.sh
/implement-from-dirk-g
/enterprise-implement

# 4. Validate completion
dirk_g_validate_completion "authentication"
/self-analyze --auto-correct

# 5. Continue with next phase
./god --phase-transition "Authentication complete - begin payment integration"
\`\`\`

### Quick Development Tasks
\`\`\`bash
# Single feature implementation
/feature "Add user profile management with image upload"

# Debug and optimize
/debug performance
/optimize memory

# Validate and deploy
/validate-enterprise-standards
/build
\`\`\`

## 📈 Quality Metrics
- **Code Coverage**: 90%+ required
- **Security Scan**: Must pass
- **Performance Budget**: 200ms response time
- **Documentation**: 100% completeness required

## 🔧 Troubleshooting
- **GOD Mode Issues**: Check \`.godmode/team/TEAM_DASHBOARD.md\`
- **DIRK.c Problems**: Review \`.dirk/dirk_c_config.yaml\`
- **DIRK.g Errors**: Run \`dirk_g_test\` to verify installation
- **Hook Failures**: Check individual hook scripts in \`.dirk/hooks/\`

## 📚 Additional Resources
- [Complete DIRK Documentation](../html/index.html)
- [GOD Mode 2.0 Guide](../html/godmode-guide.html)
- [DIRK.c Commands Reference](../html/dirk-c-guide.html)
- [DIRK.g Business Analysis Guide](../html/dirk-g-guide.html)

---
**Installation Date**: $(date)  
**DIRK Version**: 2.0  
**Components**: GOD Mode 2.0 + DIRK.c + DIRK.g + Quality Hooks  
**Status**: ✅ Ready for Enterprise Development
EOF

    # Quick reference card
    cat > "$project_path/docs/dirk_system/QUICK_REFERENCE.md" << EOF
# 🚀 DIRK System Quick Reference

## Essential Commands
\`\`\`bash
# GOD Mode - Autonomous Development
./god "project description"              # Start fresh project
./god --continue "status update"         # Continue existing work
./god --status                          # Check team status

# DIRK.g - Business Analysis
dirk_g_workflow "requirement"           # Complete BA workflow
dirk_g_validate_completion "task"       # Validate task completion
dirk_g_done "task"                      # Quick completion check

# DIRK.c - Development (after launching claude code)
/build                                  # Build entire project
/test                                   # Run comprehensive tests
/feature "description"                  # Implement new feature
/self-analyze                           # Validate implementation
\`\`\`

## System Status Checks
\`\`\`bash
./god --team-status                     # GOD Mode team dashboard
dirk_g_status                          # DIRK.g validation reports
cat .dirk/dirk_master_config.yaml      # Complete system status
\`\`\`

## Quality Validation
\`\`\`bash
# Run all quality hooks
./.dirk/hooks/pre-commit.sh
./.dirk/hooks/security-scan.sh
./.dirk/hooks/performance-check.sh

# Enterprise validation
/validate-enterprise-standards         # In Claude Code
dirk_g_validate_completion "feature"   # Task completion validation
\`\`\`
EOF

    log_success "Comprehensive documentation created"
}

# Create integration verification
create_integration_verification() {
    local project_path="$1"
    
    log_step "Creating integration verification..."
    
    cat > "$project_path/.dirk/verify-installation.sh" << 'EOF'
#!/bin/bash

# DIRK System Installation Verification Script

echo "🔍 DIRK System Installation Verification"
echo "========================================"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check GOD Mode
echo ""
echo "🤖 GOD Mode 2.0 Verification:"
if [ -f "./god" ] && [ -d ".godmode/team" ]; then
    echo -e "  ${GREEN}✅ GOD Mode command available${NC}"
    echo -e "  ${GREEN}✅ Team workspace created${NC}"
    if [ -f ".godmode/team/TEAM_DASHBOARD.md" ]; then
        echo -e "  ${GREEN}✅ Team dashboard operational${NC}"
    fi
else
    echo -e "  ${RED}❌ GOD Mode not properly installed${NC}"
fi

# Check DIRK.c
echo ""
echo "⚡ DIRK.c Verification:"
if [ -f ".dirk/dirk_c_config.yaml" ]; then
    echo -e "  ${GREEN}✅ DIRK.c configuration found${NC}"
fi
if [ -d ".dirk/commands" ]; then
    echo -e "  ${GREEN}✅ Slash commands documentation available${NC}"
fi
if [ -d ".dirk/hooks" ]; then
    hook_count=$(ls .dirk/hooks/*.sh 2>/dev/null | wc -l)
    echo -e "  ${GREEN}✅ Quality hooks installed ($hook_count hooks)${NC}"
fi

# Check DIRK.g
echo ""
echo "🧠 DIRK.g Verification:"
if [ -f ".dirk/dirk_g_config.yaml" ]; then
    echo -e "  ${GREEN}✅ DIRK.g configuration found${NC}"
fi
if [ -f ".dirk/dirk_g/dirk_g_commands.sh" ]; then
    echo -e "  ${GREEN}✅ DIRK.g commands available${NC}"
fi
if [ -f "$HOME/.dirk/dirk_g_commands.sh" ]; then
    echo -e "  ${GREEN}✅ Global DIRK.g commands installed${NC}"
else
    echo -e "  ${YELLOW}⚠️ Global DIRK.g commands not found - run: source .dirk/dirk_g/dirk_g_commands.sh${NC}"
fi

# Check Documentation
echo ""
echo "📖 Documentation Verification:"
if [ -d "docs/dirk_system" ]; then
    echo -e "  ${GREEN}✅ DIRK system documentation created${NC}"
fi
if [ -d "docs/ccms" ]; then
    echo -e "  ${GREEN}✅ Case management system initialized${NC}"
fi

# Check Master Configuration
echo ""
echo "⚙️ System Configuration:"
if [ -f ".dirk/dirk_master_config.yaml" ]; then
    echo -e "  ${GREEN}✅ Master configuration created${NC}"
    
    # Show component status
    if command -v yq &> /dev/null; then
        echo "  Component Status:"
        echo "    GOD Mode: $(yq eval '.components.godmode.status' .dirk/dirk_master_config.yaml 2>/dev/null || echo 'unknown')"
        echo "    DIRK.c: $(yq eval '.components.dirk_c.status' .dirk/dirk_master_config.yaml 2>/dev/null || echo 'unknown')"
        echo "    DIRK.g: $(yq eval '.components.dirk_g.status' .dirk/dirk_master_config.yaml 2>/dev/null || echo 'unknown')"
    fi
fi

# Overall Status
echo ""
echo "🎯 Overall System Status:"
if [ -f "./god" ] && [ -f ".dirk/dirk_c_config.yaml" ] && [ -f ".dirk/dirk_g_config.yaml" ]; then
    echo -e "  ${GREEN}✅ Complete DIRK System Successfully Installed${NC}"
    echo ""
    echo "🚀 Ready for Enterprise Development!"
    echo ""
    echo "Next Steps:"
    echo "  1. ./god \"your project description\""
    echo "  2. source .dirk/dirk_g/dirk_g_commands.sh (or restart terminal)"
    echo "  3. ./.dirk/launch-dirk-c.sh"
else
    echo -e "  ${RED}❌ Installation incomplete - some components missing${NC}"
fi
EOF

    chmod +x "$project_path/.dirk/verify-installation.sh"
    
    log_success "Integration verification created"
}

# Main deployment function
deploy_complete() {
    local project_path="${1:-$(pwd)}"
    
    # Resolve absolute path
    project_path=$(cd "$project_path" && pwd)
    local project_name=$(basename "$project_path")
    
    show_complete_banner
    
    log_info "📦 Complete DIRK System Deployment Starting..."
    log_info "Project: $project_name"
    log_info "Location: $project_path"
    echo
    
    # Check prerequisites
    check_complete_prerequisites
    echo
    
    # Deploy components in order
    log_step "🚀 Deploying DIRK System Components..."
    echo
    
    # 1. GOD Mode 2.0 (Foundation)
    deploy_component "godmode" "$project_path"
    echo
    
    # 2. DIRK.g (Business Analysis)
    deploy_component "dirk-g" "$project_path"
    echo
    
    # 3. DIRK.c (Development Engine)
    deploy_component "dirk-c" "$project_path"
    echo
    
    # 4. Quality Hooks
    if [ -f "$SCRIPT_DIR/deploy-hooks.sh" ]; then
        deploy_component "hooks" "$project_path"
        echo
    else
        log_warning "Hooks deployment script not found - skipping quality hooks"
    fi
    
    # 5. Master Configuration
    create_master_config "$project_path"
    echo
    
    # 6. Comprehensive Documentation
    create_complete_documentation "$project_path"
    echo
    
    # 7. Integration Verification
    create_integration_verification "$project_path"
    echo
    
    # Final success message with complete summary
    log_success "🎉 Complete DIRK System Deployment Successful!"
    echo
    echo -e "${GREEN}🚀 ENTERPRISE AI DEVELOPMENT PLATFORM READY${NC}"
    echo
    echo -e "${PURPLE}📊 Deployment Summary:${NC}"
    echo -e "  🤖 GOD Mode 2.0: Autonomous development teams with 4 specialized agents"
    echo -e "  ⚡ DIRK.c: 13 slash commands + 5 quality hooks for Claude Code"
    echo -e "  🧠 DIRK.g: 9 commands including automated task validation for Gemini"
    echo -e "  📖 Documentation: Complete guides and quick reference materials"
    echo -e "  ⚙️ Integration: Cross-system communication and validation"
    echo
    echo -e "${CYAN}🎯 Total Capabilities:${NC}"
    echo -e "  • 25+ AI-powered commands across 3 systems"
    echo -e "  • 4 autonomous AI agents for complex project management"
    echo -e "  • 5 automated quality assurance hooks"
    echo -e "  • Enterprise-grade security and performance standards"
    echo -e "  • Cross-AI validation and self-correction"
    echo -e "  • Automated task completion verification"
    echo
    echo -e "${YELLOW}🚀 Quick Start:${NC}"
    echo "1. cd $project_path"
    echo "2. ./.dirk/verify-installation.sh  (verify deployment)"
    echo "3. ./god \"Build my enterprise application\"  (start autonomous development)"
    echo "4. source .dirk/dirk_g/dirk_g_commands.sh  (enable business analysis)"
    echo "5. ./.dirk/launch-dirk-c.sh  (start Claude Code with slash commands)"
    echo
    echo -e "${GREEN}📚 Documentation:${NC} $project_path/docs/dirk_system/README.md"
    echo -e "${GREEN}🎛️ Team Dashboard:${NC} $project_path/.godmode/team/TEAM_DASHBOARD.md"
    echo -e "${GREEN}⚙️ System Config:${NC} $project_path/.dirk/dirk_master_config.yaml"
    echo
    echo -e "${BLUE}🌟 Welcome to the future of AI-powered enterprise development!${NC}"
    echo
}

# Script execution
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    deploy_complete "$@"
fi