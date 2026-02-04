# OpenWork Installation Script
# For Windows PowerShell

Write-Host "=================================" -ForegroundColor Cyan
Write-Host "  OpenWork Installation Script" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Check if Bun is installed
Write-Host "Checking for Bun..." -ForegroundColor Yellow
try {
    $bunVersion = & bun --version 2>$null
    Write-Host "✓ Bun $bunVersion found" -ForegroundColor Green
} catch {
    Write-Host "✗ Error: Bun is not installed" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Bun first:" -ForegroundColor Yellow
    Write-Host "  powershell -c `"irm bun.sh/install.ps1 | iex`"" -ForegroundColor White
    Write-Host ""
    Write-Host "After installation, restart PowerShell and run this script again." -ForegroundColor Yellow
    exit 1
}
Write-Host ""

# Check Node.js (optional)
try {
    $nodeVersion = & node --version 2>$null
    Write-Host "✓ Node.js $nodeVersion found" -ForegroundColor Green
} catch {
    Write-Host "⚠ Node.js not found (optional)" -ForegroundColor Yellow
}
Write-Host ""

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Yellow
& bun install

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Dependencies installed" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to install dependencies" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Build the project
Write-Host "Building OpenWork..." -ForegroundColor Yellow
& bun run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Build completed" -ForegroundColor Green
} else {
    Write-Host "✗ Build failed" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Create .env file if it doesn't exist
if (-not (Test-Path .env)) {
    Write-Host "Creating .env file from template..." -ForegroundColor Yellow
    Copy-Item .env.example .env
    Write-Host "✓ .env file created" -ForegroundColor Green
    Write-Host ""
    Write-Host "IMPORTANT: You must edit .env with your API keys!" -ForegroundColor Yellow
    Write-Host ""
} else {
    Write-Host "⚠ .env file already exists, skipping..." -ForegroundColor Yellow
    Write-Host ""
}

# Create agent.md if it doesn't exist
if (-not (Test-Path agent.md)) {
    Write-Host "Creating agent.md template..." -ForegroundColor Yellow

    $agentTemplate = @'
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
'@

    $agentTemplate | Out-File -FilePath agent.md -Encoding UTF8
    Write-Host "✓ agent.md template created" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "⚠ agent.md already exists, skipping..." -ForegroundColor Yellow
    Write-Host ""
}

# Create business directory structure
Write-Host "Creating business directory structure..." -ForegroundColor Yellow
$businessDir = "$env:USERPROFILE\business"
$null = New-Item -ItemType Directory -Force -Path "$businessDir\plans"
$null = New-Item -ItemType Directory -Force -Path "$businessDir\clients"
$null = New-Item -ItemType Directory -Force -Path "$businessDir\marketing"
$null = New-Item -ItemType Directory -Force -Path "$businessDir\finance"
$null = New-Item -ItemType Directory -Force -Path "$businessDir\notes"
Write-Host "✓ Business directories created in $businessDir" -ForegroundColor Green
Write-Host ""

# Display next steps
Write-Host "=================================" -ForegroundColor Cyan
Write-Host "  Installation Complete!" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor White
Write-Host ""
Write-Host "1. Edit your .env file with your API keys:" -ForegroundColor White
Write-Host "   notepad .env  # or use your preferred editor" -ForegroundColor Yellow
Write-Host ""
Write-Host "   Required variables:" -ForegroundColor White
Write-Host "   - ANTHROPIC_API_KEY=sk-ant-your-api-key-here" -ForegroundColor Gray
Write-Host "   - TELEGRAM_BOT_TOKEN=your-bot-token-here" -ForegroundColor Gray
Write-Host "   - ALLOWED_USER_IDS=your-telegram-user-id" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Get your Telegram User ID:" -ForegroundColor White
Write-Host "   Send /start to @userinfobot on Telegram" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Create a Telegram Bot:" -ForegroundColor White
Write-Host "   Send /newbot to @BotFather on Telegram" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Start OpenWork:" -ForegroundColor White
Write-Host "   bun run start" -ForegroundColor Green
Write-Host ""
Write-Host "5. Test by sending a message to your bot on Telegram!" -ForegroundColor White
Write-Host ""
Write-Host "Documentation: https://github.com/aissential-pro/openwork" -ForegroundColor Cyan
Write-Host "Issues: https://github.com/aissential-pro/openwork/issues" -ForegroundColor Cyan
Write-Host ""
