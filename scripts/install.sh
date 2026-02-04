#!/bin/bash
# OpenWork Installation Script
# For Linux and macOS

set -e  # Exit on error

echo "================================="
echo "  OpenWork Installation Script"
echo "================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Bun is installed
echo "Checking for Bun..."
if ! command -v bun &> /dev/null; then
    echo -e "${RED}Error: Bun is not installed${NC}"
    echo ""
    echo "Please install Bun first:"
    echo "  curl -fsSL https://bun.sh/install | bash"
    echo ""
    echo "After installation, restart your terminal and run this script again."
    exit 1
fi

BUN_VERSION=$(bun --version)
echo -e "${GREEN}✓ Bun ${BUN_VERSION} found${NC}"
echo ""

# Check Node.js version (optional but recommended)
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✓ Node.js ${NODE_VERSION} found${NC}"
else
    echo -e "${YELLOW}⚠ Node.js not found (optional)${NC}"
fi
echo ""

# Install dependencies
echo "Installing dependencies..."
bun install

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Dependencies installed${NC}"
else
    echo -e "${RED}✗ Failed to install dependencies${NC}"
    exit 1
fi
echo ""

# Build the project
echo "Building OpenWork..."
bun run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Build completed${NC}"
else
    echo -e "${RED}✗ Build failed${NC}"
    exit 1
fi
echo ""

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file from template..."
    cp .env.example .env
    echo -e "${GREEN}✓ .env file created${NC}"
    echo ""
    echo -e "${YELLOW}IMPORTANT: You must edit .env with your API keys!${NC}"
    echo ""
else
    echo -e "${YELLOW}⚠ .env file already exists, skipping...${NC}"
    echo ""
fi

# Create agent.md if it doesn't exist
if [ ! -f agent.md ]; then
    echo "Creating agent.md template..."
    cat > agent.md << 'EOF'
# My OpenWork Assistant

## Identity
You are my personal AI assistant via Telegram. Be helpful, concise, and proactive.

## Rules
- Always ask before deleting files
- Prefer bullet points over long paragraphs
- Use a friendly, professional tone
- Ask for clarification when instructions are unclear

## Preferences
(You will learn my preferences over time and add them here)

## Working Directory
You have access to files in: ~/business/

## Current Context
(You will track ongoing tasks and context here)
EOF
    echo -e "${GREEN}✓ agent.md template created${NC}"
    echo ""
else
    echo -e "${YELLOW}⚠ agent.md already exists, skipping...${NC}"
    echo ""
fi

# Create business directory structure
echo "Creating business directory structure..."
mkdir -p ~/business/{plans,clients,marketing,finance,notes}
echo -e "${GREEN}✓ Business directories created in ~/business/${NC}"
echo ""

# Display next steps
echo "================================="
echo "  Installation Complete!"
echo "================================="
echo ""
echo "Next steps:"
echo ""
echo "1. Edit your .env file with your API keys:"
echo "   ${YELLOW}nano .env${NC}  # or use your preferred editor"
echo ""
echo "   Required variables:"
echo "   - ANTHROPIC_API_KEY=sk-ant-your-api-key-here"
echo "   - TELEGRAM_BOT_TOKEN=your-bot-token-here"
echo "   - ALLOWED_USER_IDS=your-telegram-user-id"
echo ""
echo "2. Get your Telegram User ID:"
echo "   Send /start to @userinfobot on Telegram"
echo ""
echo "3. Create a Telegram Bot:"
echo "   Send /newbot to @BotFather on Telegram"
echo ""
echo "4. Start OpenWork:"
echo "   ${GREEN}bun run start${NC}"
echo ""
echo "5. Test by sending a message to your bot on Telegram!"
echo ""
echo "Documentation: https://github.com/aissential-pro/openwork"
echo "Issues: https://github.com/aissential-pro/openwork/issues"
echo ""
