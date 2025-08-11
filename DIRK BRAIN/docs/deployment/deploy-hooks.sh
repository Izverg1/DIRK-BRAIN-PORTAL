#!/bin/bash

# 🔧 Quality Hooks Deployment Script
# Deploy automated quality assurance and validation hooks
# Part of the DIRK BRAIN Framework deployment system

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_PATH="${1:-$(pwd)}"
DIRK_HOOKS_DIR="$PROJECT_PATH/.dirk/hooks"
DIRK_CONFIG_DIR="$PROJECT_PATH/.dirk/config"

echo -e "${PURPLE}🔧 DIRK Quality Hooks Deployment${NC}"
echo -e "${BLUE}======================================${NC}"
echo -e "Target Project: ${GREEN}$PROJECT_PATH${NC}"
echo -e "Hooks Directory: ${GREEN}$DIRK_HOOKS_DIR${NC}"
echo ""

# Validate project path
if [[ ! -d "$PROJECT_PATH" ]]; then
    echo -e "${RED}❌ Error: Project path does not exist: $PROJECT_PATH${NC}"
    exit 1
fi

# Create hooks directory structure
echo -e "${YELLOW}📁 Creating hooks directory structure...${NC}"
mkdir -p "$DIRK_HOOKS_DIR/pre-commit"
mkdir -p "$DIRK_HOOKS_DIR/pre-push"
mkdir -p "$DIRK_HOOKS_DIR/post-commit"
mkdir -p "$DIRK_HOOKS_DIR/continuous"
mkdir -p "$DIRK_CONFIG_DIR"

# Hook 1: Pre-Commit Security Scanner
echo -e "${YELLOW}🔒 Installing Pre-Commit Security Scanner...${NC}"
cat > "$DIRK_HOOKS_DIR/pre-commit/security-scan.sh" << 'EOF'
#!/bin/bash
# DIRK Hook: Pre-Commit Security Scanner
# Scans for security vulnerabilities before commit

echo "🔒 DIRK Security Scan: Checking for vulnerabilities..."

# Check for secrets and credentials
if command -v git-secrets >/dev/null 2>&1; then
    git secrets --scan
    if [[ $? -ne 0 ]]; then
        echo "❌ Security scan failed: Potential secrets detected"
        exit 1
    fi
fi

# Check for common security patterns
SECURITY_PATTERNS=(
    "password\s*=\s*['\"][^'\"]*['\"]"
    "api_key\s*=\s*['\"][^'\"]*['\"]"
    "secret\s*=\s*['\"][^'\"]*['\"]"
    "token\s*=\s*['\"][^'\"]*['\"]"
    "private_key"
    "-----BEGIN.*PRIVATE KEY-----"
)

for pattern in "${SECURITY_PATTERNS[@]}"; do
    if git diff --cached | grep -qiE "$pattern"; then
        echo "❌ Security scan failed: Potential credential found matching pattern: $pattern"
        exit 1
    fi
done

echo "✅ Security scan passed"
EOF

# Hook 2: Code Quality Validator
echo -e "${YELLOW}📊 Installing Code Quality Validator...${NC}"
cat > "$DIRK_HOOKS_DIR/pre-commit/quality-check.sh" << 'EOF'
#!/bin/bash
# DIRK Hook: Code Quality Validator
# Validates code quality standards before commit

echo "📊 DIRK Quality Check: Validating code standards..."

# TypeScript/JavaScript quality checks
if [[ -f "package.json" ]]; then
    # Check if ESLint is configured
    if [[ -f ".eslintrc.js" || -f ".eslintrc.json" || -f "eslint.config.js" ]]; then
        echo "🔍 Running ESLint..."
        if command -v npx >/dev/null 2>&1; then
            npx eslint $(git diff --cached --name-only | grep -E '\.(ts|tsx|js|jsx)$' | tr '\n' ' ')
            if [[ $? -ne 0 ]]; then
                echo "❌ ESLint checks failed"
                exit 1
            fi
        fi
    fi
    
    # Check if Prettier is configured
    if [[ -f ".prettierrc" || -f ".prettierrc.js" || -f ".prettierrc.json" ]]; then
        echo "💄 Running Prettier check..."
        if command -v npx >/dev/null 2>&1; then
            npx prettier --check $(git diff --cached --name-only | grep -E '\.(ts|tsx|js|jsx|json|md)$' | tr '\n' ' ')
            if [[ $? -ne 0 ]]; then
                echo "❌ Prettier formatting checks failed"
                echo "💡 Run 'npx prettier --write .' to fix formatting"
                exit 1
            fi
        fi
    fi
fi

# Python quality checks
if [[ -f "requirements.txt" || -f "pyproject.toml" || -f "setup.py" ]]; then
    # Check if Black is available
    if command -v black >/dev/null 2>&1; then
        echo "🐍 Running Black formatter check..."
        black --check $(git diff --cached --name-only | grep '\.py$' | tr '\n' ' ')
        if [[ $? -ne 0 ]]; then
            echo "❌ Black formatting checks failed"
            echo "💡 Run 'black .' to fix formatting"
            exit 1
        fi
    fi
    
    # Check if flake8 is available
    if command -v flake8 >/dev/null 2>&1; then
        echo "🔍 Running flake8 linting..."
        flake8 $(git diff --cached --name-only | grep '\.py$' | tr '\n' ' ')
        if [[ $? -ne 0 ]]; then
            echo "❌ flake8 linting failed"
            exit 1
        fi
    fi
fi

echo "✅ Code quality checks passed"
EOF

# Hook 3: Enterprise Standards Validator
echo -e "${YELLOW}🏢 Installing Enterprise Standards Validator...${NC}"
cat > "$DIRK_HOOKS_DIR/pre-commit/enterprise-standards.sh" << 'EOF'
#!/bin/bash
# DIRK Hook: Enterprise Standards Validator
# Ensures compliance with enterprise development standards

echo "🏢 DIRK Enterprise Standards: Validating compliance..."

# Check for required documentation
REQUIRED_DOCS=("README.md" "CHANGELOG.md")
for doc in "${REQUIRED_DOCS[@]}"; do
    if [[ ! -f "$doc" ]]; then
        echo "❌ Missing required documentation: $doc"
        exit 1
    fi
done

# Validate commit message format
COMMIT_MSG_FILE="$1"
if [[ -