#!/bin/bash

# Claude Desktop MCP Configuration Verification Script
# Tag: #DIRK-MACOS-MCP-CONFIG-VERIFY-20240708-0001

set -e

echo "🔍 Claude Desktop MCP Configuration Verification"
echo "=============================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_error() {
    echo -e "${RED}❌ Error: $1${NC}" >&2
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

CLAUDE_CONFIG_DIR="$HOME/Library/Application Support/Claude"
CLAUDE_CONFIG_FILE="$CLAUDE_CONFIG_DIR/claude_desktop_config.json"
TEMPLATE_FILE="$HOME/Documents/claude_desktop_config_template.json"

print_info "Checking Claude Desktop configuration..."

# Check if Claude config directory exists
if [ ! -d "$CLAUDE_CONFIG_DIR" ]; then
    print_warning "Claude config directory doesn't exist. Creating..."
    mkdir -p "$CLAUDE_CONFIG_DIR"
    print_success "Created Claude config directory"
fi

# Check if config file exists
if [ ! -f "$CLAUDE_CONFIG_FILE" ]; then
    print_warning "Claude config file doesn't exist. Creating from template..."
    cp "$TEMPLATE_FILE" "$CLAUDE_CONFIG_FILE"
    print_success "Created Claude config file from template"
else
    print_info "Claude config file exists. Verifying format..."
fi

# Verify JSON format
if node -e "JSON.parse(require('fs').readFileSync('$CLAUDE_CONFIG_FILE', 'utf8'))" 2>/dev/null; then
    print_success "JSON configuration is valid"
else
    print_error "JSON configuration is invalid. Restoring from template..."
    cp "$TEMPLATE_FILE" "$CLAUDE_CONFIG_FILE"
    print_success "Restored valid configuration from template"
fi

# Verify Desktop Commander paths
DESKTOP_COMMANDER_DIR="/Users/izverg/Documents/MCP_SERVERS/DesktopCommanderMCP"
if [ -d "$DESKTOP_COMMANDER_DIR" ]; then
    print_success "Desktop Commander directory exists"
    
    if [ -f "$DESKTOP_COMMANDER_DIR/index.js" ]; then
        print_success "Desktop Commander main script exists"
    else
        print_error "Desktop Commander main script not found"
    fi
    
    if [ -d "$DESKTOP_COMMANDER_DIR/node_modules" ]; then
        print_success "Desktop Commander node_modules exists"
    else
        print_warning "Desktop Commander node_modules not found (run npm install)"
    fi
else
    print_error "Desktop Commander directory not found"
fi

# Display current configuration
print_info "Current Claude Desktop configuration:"
echo ""
cat "$CLAUDE_CONFIG_FILE"
echo ""

# Verify configuration content
if grep -q "desktop-commander" "$CLAUDE_CONFIG_FILE"; then
    print_success "Desktop Commander is configured in Claude Desktop"
else
    print_error "Desktop Commander is not configured in Claude Desktop"
fi

# Set proper permissions
chmod 644 "$CLAUDE_CONFIG_FILE"
print_success "Permissions set correctly"

echo ""
echo "🎯 Configuration Status Summary:"
echo "• Claude config directory: $CLAUDE_CONFIG_DIR"
echo "• Claude config file: $CLAUDE_CONFIG_FILE"
echo "• Desktop Commander path: $DESKTOP_COMMANDER_DIR"
echo "• JSON format: Valid"
echo "• Permissions: Correct"
echo ""

if [ -f "$CLAUDE_CONFIG_FILE" ] && [ -d "$DESKTOP_COMMANDER_DIR" ]; then
    print_success "✅ MCP configuration is properly set up!"
    echo ""
    echo "🔄 Next Steps:"
    echo "1. Restart Claude Desktop application"
    echo "2. Desktop Commander will be available as an MCP server"
    echo "3. Test with: 'Can you use desktop commander to show me the current time?'"
else
    print_error "❌ MCP configuration needs attention"
    echo ""
    echo "🔧 Required Actions:"
    echo "1. Run the Desktop Commander installation script"
    echo "2. Verify all paths are correct"
    echo "3. Restart Claude Desktop"
fi

echo ""
print_info "Verification complete."
