#!/usr/bin/env bash

# ============================================
# OpenWork Setup Script
# ============================================
# This script prepares the OpenWork environment for deployment
# Run this script after cloning the repository

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ============================================
# Helper Functions
# ============================================

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# ============================================
# Check System Requirements
# ============================================

print_info "Checking system requirements..."

# Check Node.js version
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -ge 22 ]; then
        print_success "Node.js version: $(node --version)"
    else
        print_warning "Node.js version $(node --version) detected. Node 22+ is recommended."
    fi
else
    print_warning "Node.js not found. It's recommended to have Node 22+ installed."
fi

# Check Bun installation
if command -v bun &> /dev/null; then
    print_success "Bun version: $(bun --version)"
    BUN_INSTALLED=true
else
    print_warning "Bun not found."
    BUN_INSTALLED=false
fi

# ============================================
# Install Bun (if not present)
# ============================================

if [ "$BUN_INSTALLED" = false ]; then
    print_info "Would you like to install Bun? (recommended) [y/N]"
    read -r INSTALL_BUN

    if [[ "$INSTALL_BUN" =~ ^[Yy]$ ]]; then
        print_info "Installing Bun..."
        curl -fsSL https://bun.sh/install | bash

        # Add Bun to PATH for this script
        export PATH="$HOME/.bun/bin:$PATH"

        if command -v bun &> /dev/null; then
            print_success "Bun installed successfully: $(bun --version)"
            BUN_INSTALLED=true
        else
            print_error "Bun installation failed. Please install manually."
            exit 1
        fi
    else
        print_warning "Skipping Bun installation. You'll need Node.js 22+ to run OpenWork."
    fi
fi

# ============================================
# Install Dependencies
# ============================================

print_info "Installing dependencies..."

if [ "$BUN_INSTALLED" = true ]; then
    print_info "Using Bun to install dependencies..."
    bun install
else
    print_info "Using npm to install dependencies..."
    npm install
fi

print_success "Dependencies installed successfully."

# ============================================
# Create Required Directories
# ============================================

print_info "Creating required directories..."

# Create logs directory
mkdir -p logs
print_success "Created: logs/"

# Create sessions directory
mkdir -p sessions
print_success "Created: sessions/"

# Create backups directory
mkdir -p ~/backups
print_success "Created: ~/backups/"

# Create business directory structure
mkdir -p ~/business/{plans,clients,marketing,finance,templates,reports,drafts}
print_success "Created: ~/business/ with subdirectories"

# ============================================
# Setup Environment File
# ============================================

print_info "Setting up environment file..."

if [ -f ".env" ]; then
    print_warning ".env file already exists. Skipping..."
else
    if [ -f ".env.example" ]; then
        cp .env.example .env
        print_success "Created .env from .env.example"
        print_warning "IMPORTANT: Please edit .env and add your API keys!"
        print_info "Required variables:"
        echo "  - ANTHROPIC_API_KEY"
        echo "  - TELEGRAM_BOT_TOKEN"
        echo "  - ALLOWED_USER_IDS"
    else
        print_error ".env.example not found. Please create .env manually."
    fi
fi

# ============================================
# Setup agent.md
# ============================================

print_info "Setting up agent.md..."

if [ -f ~/business/agent.md ]; then
    print_warning "~/business/agent.md already exists. Skipping..."
else
    cat > ~/business/agent.md << 'EOF'
# Agent Operating Manual

## Identity
You are my executive AI assistant for managing business operations.
You have the power to spawn specialized sub-agents whenever needed.

## STRICT RULES (Never Break)
1. Always ask before spending money or making external commitments
2. Never delete files without explicit approval
3. Always save drafts before finalizing documents
4. Check existing files before creating new ones
5. Update this file when you learn important preferences

## My Preferences
- Concise documents (max 5 pages for plans)
- Bullet points over long paragraphs
- Always include actionable next steps
- Professional but conversational tone

## Business Context
- Industry: [Add your industry]
- Current priorities: [Add your priorities]
- Key clients: [Add your key clients]

## Document Locations
- Business plans: ~/business/plans/
- Client files: ~/business/clients/
- Marketing: ~/business/marketing/
- Financial: ~/business/finance/
- Templates: ~/business/templates/
- Reports: ~/business/reports/
- Drafts: ~/business/drafts/

## How to Spawn Sub-Agents
When spawning a sub-agent, provide:
1. Clear role (researcher, analyst, writer, etc.)
2. Specific instructions for this task
3. Access to relevant files
4. Clear deliverable expectations

## Memory: What I've Learned
- [The agent will add observations here over time]
EOF
    print_success "Created ~/business/agent.md"
    print_info "Please customize ~/business/agent.md with your preferences!"
fi

# ============================================
# Set Permissions
# ============================================

print_info "Setting permissions..."

# Make scripts executable
chmod +x scripts/*.sh 2>/dev/null || true
print_success "Made scripts executable"

# Secure .env file
if [ -f ".env" ]; then
    chmod 600 .env
    print_success "Secured .env file (chmod 600)"
fi

# ============================================
# PM2 Setup (Optional)
# ============================================

if command -v pm2 &> /dev/null; then
    print_success "PM2 is already installed: $(pm2 --version)"
else
    print_info "PM2 not found. Would you like to install it? (recommended for production) [y/N]"
    read -r INSTALL_PM2

    if [[ "$INSTALL_PM2" =~ ^[Yy]$ ]]; then
        print_info "Installing PM2..."
        npm install -g pm2
        print_success "PM2 installed successfully"
    else
        print_info "Skipping PM2 installation."
    fi
fi

# ============================================
# Final Summary
# ============================================

echo ""
print_success "============================================"
print_success "OpenWork Setup Complete!"
print_success "============================================"
echo ""

print_info "Next steps:"
echo "  1. Edit .env and add your API keys:"
echo "     - ANTHROPIC_API_KEY"
echo "     - TELEGRAM_BOT_TOKEN"
echo "     - ALLOWED_USER_IDS"
echo ""
echo "  2. Customize ~/business/agent.md with your preferences"
echo ""
echo "  3. Test the application:"
echo "     bun run dev"
echo ""
echo "  4. Start the gateway:"
echo "     cd packages/gateway && bun src/index.ts"
echo ""
echo "  5. For production, use PM2:"
echo "     pm2 start ecosystem.config.cjs"
echo "     pm2 save"
echo "     pm2 startup"
echo ""

print_info "For more information, see: docs/deployment.md"
echo ""
