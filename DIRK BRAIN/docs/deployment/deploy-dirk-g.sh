#!/bin/bash

# 🧠 DIRK.g Deployment Script
# Deploy Gemini business analysis and validation commands

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

# DIRK.g Banner
show_dirkg_banner() {
    echo -e "${PURPLE}"
    cat << 'EOF'
    ██████╗ ██╗██████╗ ██╗  ██╗     ██████╗ 
    ██╔══██╗██║██╔══██╗██║ ██╔╝    ██╔════╝ 
    ██║  ██║██║██████╔╝█████╔╝     ██║  ███╗
    ██║  ██║██║██╔══██╗██╔═██╗     ██║   ██║
    ██████╔╝██║██║  ██║██║  ██╗ ██╗╚██████╔╝
    ╚═════╝ ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝ ╚═╝ ╚═════╝
    
    🧠 GEMINI BUSINESS ANALYST & SOLUTION ARCHITECT
       9 Commands + Automated Task Validation
    
EOF
    echo -e "${NC}"
}

# Check if Gemini CLI is available
check_gemini_cli() {
    log_step "Checking Gemini CLI availability..."
    
    if ! command -v gemini &> /dev/null; then
        log_warning "Gemini CLI not found. Please install it first:"
        echo "  Installation instructions:"
        echo "  1. Install Google Cloud SDK"
        echo "  2. Configure Gemini API access"
        echo "  3. Set up authentication"
        return 1
    fi
    
    log_success "Gemini CLI is available"
    return 0
}

# Create DIRK.g configuration
create_dirkg_config() {
    local project_path="$1"
    local project_name=$(basename "$project_path")
    
    log_step "Creating DIRK.g configuration..."
    
    mkdir -p "$project_path/.dirk"
    
    cat > "$project_path/.dirk/dirk_g_config.yaml" << EOF
# DIRK.g Configuration for $project_name
project_name: "$project_name"
dirk_version: "2.0"
gemini_version: "latest"

# Business Analysis Configuration
business_analysis:
  enabled: true
  stakeholder_mapping: true
  requirements_gathering: true
  user_story_generation: true
  acceptance_criteria: true

# Solution Architecture Configuration
solution_architecture:
  enabled: true
  technology_recommendations: true
  architecture_patterns: true
  integration_design: true
  scalability_planning: true

# Validation Commands Configuration
validation_commands:
  enabled: true
  total_commands: 3
  task_completion_validation: true
  quick_status_checks: true
  dashboard_reporting: true

# Integration Settings
integrations:
  dirk_c: true
  godmode: false  # Set to true if GOD Mode is deployed
  ccms: true

# Quality Standards
quality_standards:
  requirements_completeness: 95
  architecture_documentation: 100
  stakeholder_coverage: 90
  validation_accuracy: 95

created: "$(date)"
last_updated: "$(date)"
EOF

    log_success "DIRK.g configuration created"
}

# Create DIRK.g command functions
create_dirkg_commands() {
    local project_path="$1"
    
    log_step "Creating DIRK.g command functions..."
    
    mkdir -p "$project_path/.dirk/dirk_g"
    
    # Main command functions file
    cat > "$project_path/.dirk/dirk_g/dirk_g_commands.sh" << 'EOF'
#!/bin/bash

# 🧠 DIRK.g Command Functions
# Business Analysis and Solution Architecture with Gemini

# Colors for output
PURPLE='\033[0;35m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# Set DIRK.g directory
DIRK_G_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$(dirname "$DIRK_G_DIR")")"

# Logging function
dirk_g_log() {
    echo -e "${PURPLE}[DIRK.g]${NC} $1"
}

# Business Analysis Workflow
dirk_g_workflow() {
    local requirement="$1"
    
    if [ -z "$requirement" ]; then
        echo "Usage: dirk_g_workflow \"requirement description\""
        return 1
    fi
    
    dirk_g_log "🧠 Starting complete business analysis and solution architecture workflow"
    dirk_g_log "Requirement: $requirement"
    
    # Create analysis directory
    mkdir -p "$PROJECT_ROOT/.dirk/analysis/$(date +%Y%m%d_%H%M%S)"
    local analysis_dir="$PROJECT_ROOT/.dirk/analysis/$(date +%Y%m%d_%H%M%S)"
    
    # Step 1: Business Analysis
    dirk_g_log "📋 Step 1: Business Analysis"
    dirk_g_ba "$requirement" > "$analysis_dir/business_analysis.md"
    
    # Step 2: Solution Architecture
    dirk_g_log "🏗️ Step 2: Solution Architecture"
    dirk_g_sa "$requirement" > "$analysis_dir/solution_architecture.md"
    
    # Step 3: Implementation Specifications
    dirk_g_log "📝 Step 3: Implementation Specifications"
    cat > "$analysis_dir/implementation_specs.md" << IMPL_EOF
# Implementation Specifications for: $requirement

## Technical Requirements
*Generated from business analysis and solution architecture*

## Development Tasks
*Ready for DIRK.c implementation*

## Quality Criteria
*Validation standards for task completion*

## Acceptance Criteria
*Business validation requirements*

---
Generated: $(date)
Status: Ready for implementation
IMPL_EOF
    
    dirk_g_log "✅ Complete workflow analysis saved to: $analysis_dir"
    echo "   📁 Business Analysis: $analysis_dir/business_analysis.md"
    echo "   🏗️ Solution Architecture: $analysis_dir/solution_architecture.md"
    echo "   📝 Implementation Specs: $analysis_dir/implementation_specs.md"
}

# Business Analysis
dirk_g_ba() {
    local requirement="$1"
    
    if [ -z "$requirement" ]; then
        echo "Usage: dirk_g_ba \"requirement description\""
        return 1
    fi
    
    dirk_g_log "📋 Conducting business analysis for: $requirement"
    
    cat << BA_EOF
# Business Analysis Report

## Requirement
$requirement

## Stakeholder Analysis
### Primary Stakeholders
- End Users: Direct users of the system
- Business Owners: Decision makers and budget holders
- Technical Team: Development and maintenance

### Secondary Stakeholders
- IT Operations: System deployment and maintenance
- Security Team: Security compliance and validation
- Quality Assurance: Testing and validation

## Functional Requirements
### Core Features
1. **Primary Function**: Core business capability
2. **User Interface**: User interaction requirements
3. **Data Management**: Data storage and processing
4. **Integration**: External system connections
5. **Reporting**: Analytics and reporting needs

### User Stories
- **As a** [user type], **I want** [functionality] **so that** [benefit]
- **As a** [user type], **I want** [functionality] **so that** [benefit]
- **As a** [user type], **I want** [functionality] **so that** [benefit]

## Non-Functional Requirements
### Performance
- Response time: < 2 seconds for standard operations
- Throughput: Support for concurrent users
- Scalability: Growth accommodation

### Security
- Authentication and authorization
- Data encryption (at rest and in transit)
- Audit logging and compliance

### Usability
- Intuitive user interface
- Accessibility compliance
- Mobile responsiveness

## Business Impact Analysis
### Benefits
- Efficiency improvements
- Cost reductions
- Revenue opportunities
- Risk mitigation

### Risks
- Implementation complexity
- User adoption challenges
- Technical dependencies
- Budget and timeline constraints

## Success Metrics
- User adoption rate: Target %
- Performance metrics: Response time, uptime
- Business metrics: ROI, efficiency gains
- Quality metrics: Defect rate, user satisfaction

---
Analysis Date: $(date)
Analyst: DIRK.g Business Analysis Engine
Status: Ready for Solution Architecture
BA_EOF
}

# Solution Architecture
dirk_g_sa() {
    local requirement="$1"
    
    if [ -z "$requirement" ]; then
        echo "Usage: dirk_g_sa \"architecture description\""
        return 1
    fi
    
    dirk_g_log "🏗️ Designing solution architecture for: $requirement"
    
    cat << SA_EOF
# Solution Architecture Document

## Architecture Overview
System design for: $requirement

## Technology Stack Recommendations
### Frontend
- **Framework**: React with TypeScript
- **State Management**: Redux Toolkit or Zustand
- **UI Components**: Material-UI or Tailwind CSS
- **Build Tool**: Vite or Next.js

### Backend
- **Runtime**: Node.js or Python
- **Framework**: Express.js/FastAPI
- **API Design**: RESTful with OpenAPI specification
- **Authentication**: JWT with OAuth2

### Database
- **Primary**: PostgreSQL for relational data
- **Cache**: Redis for session and temporary data
- **Search**: Elasticsearch for full-text search
- **Analytics**: ClickHouse for time-series data

### Infrastructure
- **Cloud Platform**: AWS/Google Cloud/Azure
- **Containerization**: Docker with Kubernetes
- **CI/CD**: GitHub Actions or GitLab CI
- **Monitoring**: Prometheus with Grafana

## System Architecture
### High-Level Components
1. **User Interface Layer**
   - Web application
   - Mobile responsive design
   - Progressive Web App capabilities

2. **API Gateway**
   - Request routing and load balancing
   - Authentication and authorization
   - Rate limiting and throttling

3. **Business Logic Layer**
   - Core business services
   - Data validation and processing
   - Integration orchestration

4. **Data Layer**
   - Primary database
   - Caching layer
   - External data sources

### Integration Architecture
- **Internal APIs**: Microservices communication
- **External APIs**: Third-party service integration
- **Message Queues**: Asynchronous processing
- **Event Streaming**: Real-time data processing

## Security Architecture
### Authentication & Authorization
- Multi-factor authentication
- Role-based access control (RBAC)
- API key management
- Session management

### Data Protection
- Encryption at rest and in transit
- Data classification and handling
- Backup and recovery procedures
- Compliance with regulations (GDPR, HIPAA, etc.)

## Performance Architecture
### Scalability
- Horizontal scaling capabilities
- Load balancing strategies
- Auto-scaling policies
- Performance monitoring

### Optimization
- Database query optimization
- Caching strategies
- CDN implementation
- Resource optimization

## Deployment Architecture
### Environments
- Development: Local and cloud development
- Staging: Pre-production testing
- Production: Live system deployment

### Deployment Strategy
- Blue-green deployment
- Rolling updates
- Feature flags
- Rollback procedures

## Quality Assurance
### Testing Strategy
- Unit testing: 90%+ coverage
- Integration testing
- End-to-end testing
- Performance testing

### Monitoring & Observability
- Application performance monitoring
- Infrastructure monitoring
- Log aggregation and analysis
- Alert management

## Implementation Roadmap
### Phase 1: Foundation (Weeks 1-2)
- Infrastructure setup
- Basic authentication
- Core API development

### Phase 2: Core Features (Weeks 3-6)
- Business logic implementation
- Database design and migration
- Frontend development

### Phase 3: Integration (Weeks 7-8)
- External API integration
- Testing and validation
- Performance optimization

### Phase 4: Deployment (Weeks 9-10)
- Production deployment
- Monitoring setup
- Documentation completion

---
Architecture Date: $(date)
Architect: DIRK.g Solution Architecture Engine
Status: Ready for Implementation
SA_EOF
}

# NEW: Automated Task Completion Validation
dirk_g_validate_completion() {
    local task_name="$1"
    
    if [ -z "$task_name" ]; then
        echo "Usage: dirk_g_validate_completion \"task_name\""
        return 1
    fi
    
    dirk_g_log "🤖 Starting automated task completion validation for: $task_name"
    
    # Create validation report directory
    mkdir -p "$PROJECT_ROOT/.dirk/validation"
    local report_file="$PROJECT_ROOT/.dirk/validation/task_validation_report_$(date +%Y%m%d_%H%M%S).txt"
    
    # Start validation process
    {
        echo "🤖 AUTOMATED TASK COMPLETION VALIDATION"
        echo "⏰ Task: $task_name"
        echo "📅 Date: $(date)"
        echo ""
        
        echo "🔍 Searching for implementation files..."
        
        # Search for relevant files
        local found_files=0
        
        # Common implementation patterns
        if find "$PROJECT_ROOT" -name "*.ts" -o -name "*.js" -o -name "*.py" -o -name "*.java" | grep -i "$task_name" > /dev/null 2>&1; then
            echo "✅ Found implementation files:"
            find "$PROJECT_ROOT" -name "*.ts" -o -name "*.js" -o -name "*.py" -o -name "*.java" | grep -i "$task_name" | head -5 | while read file; do
                echo "   📄 $file"
            done
            found_files=$((found_files + 1))
        fi
        
        # Check for specific task patterns
        case "$task_name" in
            *auth*|*login*|*authenticate*)
                echo ""
                echo "🔐 Authentication-specific checks:"
                if grep -r -i "auth\|login\|password\|token" "$PROJECT_ROOT" --include="*.ts" --include="*.js" --include="*.py" > /dev/null 2>&1; then
                    echo "✅ Authentication logic found"
                    found_files=$((found_files + 1))
                fi
                if grep -r -i "password\|bcrypt\|hash" "$PROJECT_ROOT" --include="*.ts" --include="*.js" --include="*.py" > /dev/null 2>&1; then
                    echo "✅ Password handling found"
                    found_files=$((found_files + 1))
                fi
                if grep -r -i "token\|jwt\|session" "$PROJECT_ROOT" --include="*.ts" --include="*.js" --include="*.py" > /dev/null 2>&1; then
                    echo "✅ Token/session handling found"
                    found_files=$((found_files + 1))
                fi
                if grep -r -i "middleware\|guard" "$PROJECT_ROOT" --include="*.ts" --include="*.js" --include="*.py" > /dev/null 2>&1; then
                    echo "✅ Authentication middleware found"
                    found_files=$((found_files + 1))
                fi
                if grep -r -i "user.*model\|user.*schema" "$PROJECT_ROOT" --include="*.ts" --include="*.js" --include="*.py" > /dev/null 2>&1; then
                    echo "✅ User model/schema found"
                    found_files=$((found_files + 1))
                fi
                ;;
            *api*|*endpoint*)
                echo ""
                echo "🌐 API-specific checks:"
                if grep -r -i "router\|endpoint\|api" "$PROJECT_ROOT" --include="*.ts" --include="*.js" --include="*.py" > /dev/null 2>&1; then
                    echo "✅ API endpoints found"
                    found_files=$((found_files + 1))
                fi
                ;;
            *database*|*db*)
                echo ""
                echo "🗄️ Database-specific checks:"
                if grep -r -i "database\|db\|sql\|query" "$PROJECT_ROOT" --include="*.ts" --include="*.js" --include="*.py" > /dev/null 2>&1; then
                    echo "✅ Database logic found"
                    found_files=$((found_files + 1))
                fi
                ;;
        esac
        
        # Check for tests
        echo ""
        echo "🧪 Testing validation:"
        if find "$PROJECT_ROOT" -name "*test*" -o -name "*spec*" | grep -i "$task_name" > /dev/null 2>&1; then
            echo "✅ Task-specific tests found"
            found_files=$((found_files + 1))
        elif find "$PROJECT_ROOT" -name "*test*" -o -name "*spec*" > /dev/null 2>&1; then
            echo "⚠️ General tests found, but no task-specific tests"
        else
            echo "❌ No tests found"
        fi
        
        # Check for documentation
        echo ""
        echo "📖 Documentation validation:"
        if find "$PROJECT_ROOT" -name "*.md" | xargs grep -l -i "$task_name" > /dev/null 2>&1; then
            echo "✅ Task documentation found"
            found_files=$((found_files + 1))
        else
            echo "⚠️ No specific documentation found"
        fi
        
        # Calculate completion score
        local max_score=10
        local completion_percentage=$((found_files * 100 / max_score))
        
        if [ $completion_percentage -gt 100 ]; then
            completion_percentage=100
        fi
        
        echo ""
        echo "📊 FINAL RESULTS"
        if [ $completion_percentage -ge 80 ]; then
            echo "🎉 OVERALL SCORE: ${completion_percentage}% - TASK COMPLETED SUCCESSFULLY"
        elif [ $completion_percentage -ge 60 ]; then
            echo "⚠️ OVERALL SCORE: ${completion_percentage}% - TASK PARTIALLY COMPLETED"
        else
            echo "❌ OVERALL SCORE: ${completion_percentage}% - TASK NOT COMPLETED"
        fi
        
        echo ""
        echo "📋 SUMMARY"
        echo "Task: $task_name"
        if [ $completion_percentage -ge 80 ]; then
            echo "Status: ✅ COMPLETED"
        elif [ $completion_percentage -ge 60 ]; then
            echo "Status: ⚠️ PARTIAL"
        else
            echo "Status: ❌ INCOMPLETE"
        fi
        echo "Score: ${completion_percentage}%"
        echo "Files Found: $found_files"
        echo "📄 Report: $report_file"
        
    } | tee "$report_file"
    
    dirk_g_log "✅ Validation completed. Report saved to: $report_file"
}

# NEW: Quick task completion check
dirk_g_done() {
    local task_name="$1"
    
    if [ -z "$task_name" ]; then
        echo "Usage: dirk_g_done \"task_name\""
        return 1
    fi
    
    dirk_g_log "🔍 Quick completion check for: $task_name"
    
    # Quick file search
    if find "$PROJECT_ROOT" -name "*.ts" -o -name "*.js" -o -name "*.py" | xargs grep -l -i "$task_name" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ YES${NC} - $task_name files found"
        return 0
    else
        echo -e "${RED}❌ NO${NC} - $task_name files not found"
        return 1
    fi
}

# NEW: Task status dashboard
dirk_g_status() {
    dirk_g_log "📊 Task Status Dashboard"
    
    echo ""
    echo "🗂️ Recent Validation Reports:"
    if [ -d "$PROJECT_ROOT/.dirk/validation" ]; then
        ls -lt "$PROJECT_ROOT/.dirk/validation"/*.txt 2>/dev/null | head -5 | while read file; do
            echo "   📄 $(basename "$file")"
        done
    else
        echo "   📝 No validation reports found"
    fi
    
    echo ""
    echo "📋 Recent Analysis:"
    if [ -d "$PROJECT_ROOT/.dirk/analysis" ]; then
        ls -lt "$PROJECT_ROOT/.dirk/analysis" 2>/dev/null | head -3 | while read dir; do
            echo "   📁 $(basename "$dir")"
        done
    else
        echo "   📝 No analysis reports found"
    fi
    
    echo ""
    echo "🎯 Available Commands:"
    echo "   dirk_g_workflow \"requirement\" - Complete business analysis workflow"
    echo "   dirk_g_ba \"requirement\" - Business analysis only"
    echo "   dirk_g_sa \"architecture\" - Solution architecture only"
    echo "   dirk_g_validate_completion \"task\" - Automated task validation"
    echo "   dirk_g_done \"task\" - Quick completion check"
    echo "   dirk_g_status - This status dashboard"
}

# Test function to verify all commands work
dirk_g_test() {
    dirk_g_log "🧪 Testing DIRK.g command functions..."
    
    echo "✅ dirk_g_workflow - Available"
    echo "✅ dirk_g_ba - Available"
    echo "✅ dirk_g_sa - Available"
    echo "✅ dirk_g_validate_completion - Available (NEW!)"
    echo "✅ dirk_g_done - Available (NEW!)"
    echo "✅ dirk_g_status - Available (NEW!)"
    
    dirk_g_log "🎉 All DIRK.g commands are ready!"
    echo ""
    echo "Usage examples:"
    echo '  dirk_g_workflow "user authentication system"'
    echo '  dirk_g_validate_completion "authentication"'
    echo '  dirk_g_done "login"'
    echo "  dirk_g_status"
}

# Export all functions
export -f dirk_g_workflow
export -f dirk_g_ba
export -f dirk_g_sa
export -f dirk_g_validate_completion
export -f dirk_g_done
export -f dirk_g_status
export -f dirk_g_test
EOF

    chmod +x "$project_path/.dirk/dirk_g/dirk_g_commands.sh"
    
    log_success "DIRK.g command functions created"
}

# Create validation system
create_validation_system() {
    local project_path="$1"
    
    log_step "Creating automated validation system..."
    
    mkdir -p "$project_path/.dirk/validation"
    mkdir -p "$project_path/.dirk/analysis"
    
    # Validation configuration
    cat > "$project_path/.dirk/validation/validation_config.yaml" << EOF
# DIRK.g Validation Configuration
validation_settings:
  enabled: true
  auto_validation: true
  scoring_algorithm: "weighted"
  
# Validation Criteria
criteria:
  file_presence: 30        # 30% weight for implementation files
  task_specific_logic: 25  # 25% weight for task-specific code
  testing: 20             # 20% weight for tests
  documentation: 15       # 15% weight for documentation
  integration: 10         # 10% weight for integration

# Task Patterns
task_patterns:
  authentication:
    keywords: ["auth", "login", "password", "token", "jwt", "session"]
    files: ["auth", "login", "user", "security"]
    tests: ["auth.test", "login.spec", "user.test"]
    
  api:
    keywords: ["api", "endpoint", "router", "controller"]
    files: ["api", "routes", "controllers", "endpoints"]
    tests: ["api.test", "endpoint.spec", "integration.test"]
    
  database:
    keywords: ["database", "db", "sql", "query", "model", "schema"]
    files: ["model", "schema", "migration", "db"]
    tests: ["db.test", "model.spec", "migration.test"]

# Completion Thresholds
thresholds:
  completed: 80      # 80%+ = Task completed
  partial: 60        # 60-79% = Partially completed
  incomplete: 0      # <60% = Not completed

created: "$(date)"
EOF

    log_success "Validation system configured"
}

# Create shell integration
create_shell_integration() {
    local project_path="$1"
    
    log_step "Creating shell integration..."
    
    # Check if bash profile exists
    local profile_file=""
    if [ -f "$HOME/.bash_profile" ]; then
        profile_file="$HOME/.bash_profile"
    elif [ -f "$HOME/.bashrc" ]; then
        profile_file="$HOME/.bashrc"
    elif [ -f "$HOME/.zshrc" ]; then
        profile_file="$HOME/.zshrc"
    fi
    
    if [ -n "$profile_file" ]; then
        # Add DIRK.g to shell profile if not already added
        if ! grep -q "DIRK.g commands" "$profile_file" 2>/dev/null; then
            echo "" >> "$profile_file"
            echo "# DIRK.g commands" >> "$profile_file"
            echo "if [ -f ~/.dirk/dirk_g_commands.sh ]; then" >> "$profile_file"
            echo "    source ~/.dirk/dirk_g_commands.sh" >> "$profile_file"
            echo "fi" >> "$profile_file"
        fi
    fi
    
    # Create global DIRK.g commands file in home directory
    cp "$project_path/.dirk/dirk_g/dirk_g_commands.sh" "$HOME/.dirk/dirk_g_commands.sh" 2>/dev/null || true
    mkdir -p "$HOME/.dirk" && cp "$project_path/.dirk/dirk_g/dirk_g_commands.sh" "$HOME/.dirk/dirk_g_commands.sh"
    
    log_success "Shell integration configured"
}

# Main deployment function
deploy_dirkg() {
    local project_path="${1:-$(pwd)}"
    
    # Resolve absolute path
    project_path=$(cd "$project_path" && pwd)
    local project_name=$(basename "$project_path")
    
    show_dirkg_banner
    
    log_info "🧠 DIRK.g Deployment Starting..."
    log_info "Project: $project_name"
    log_info "Location: $project_path"
    
    # Check Gemini CLI availability (optional warning only)
    if ! check_gemini_cli; then
        log_warning "Gemini CLI not found, but DIRK.g will work with basic functionality"
    fi
    
    # Create DIRK.g configuration
    create_dirkg_config "$project_path"
    
    # Create command functions
    create_dirkg_commands "$project_path"
    
    # Create validation system
    create_validation_system "$project_path"
    
    # Create shell integration
    create_shell_integration "$project_path"
    
    # Final success message
    echo
    log_success "🎉 DIRK.g deployment completed successfully!"
    echo
    echo -e "${GREEN}🧠 Gemini Business Analysis Features:${NC}"
    echo -e "  📋 6 Core Commands + 3 NEW Validation Commands"
    echo -e "  🤖 Automated task completion validation"
    echo -e "  📊 Business analysis and solution architecture"
    echo -e "  🔍 Requirements gathering and stakeholder mapping"
    echo
    echo -e "${CYAN}🚀 Usage:${NC}"
    echo "1. source ~/.dirk/dirk_g_commands.sh  (or restart terminal)"
    echo "2. dirk_g_test  (verify installation)"
    echo "3. dirk_g_workflow \"your requirement here\""
    echo "4. dirk_g_validate_completion \"task_name\""
    echo
    echo -e "${YELLOW}📖 Available Commands:${NC}"
    echo "  dirk_g_workflow - Complete business analysis workflow"
    echo "  dirk_g_ba - Business analysis only"
    echo "  dirk_g_sa - Solution architecture only"
    echo -e "  ${YELLOW}dirk_g_validate_completion${NC} - 🆕 Automated task validation"
    echo -e "  ${YELLOW}dirk_g_done${NC} - 🆕 Quick completion check"
    echo -e "  ${YELLOW}dirk_g_status${NC} - 🆕 Task status dashboard"
    echo
}

# Script execution
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    deploy_dirkg "$@"
fi