#!/usr/bin/env bash

# ============================================
# OpenWork Backup Script
# ============================================
# This script creates a timestamped backup of important OpenWork files
# Run this manually or via cron for automated backups

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ============================================
# Configuration
# ============================================

# Backup directory (can be overridden by BACKUP_PATH env var)
BACKUP_DIR="${BACKUP_PATH:-$HOME/backups}"

# Project root (assume this script is in scripts/ directory)
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Business directory
BUSINESS_DIR="$HOME/business"

# Timestamp for backup filename
TIMESTAMP=$(date +"%Y%m%d-%H%M%S")

# Backup filename
BACKUP_NAME="openwork-backup-${TIMESTAMP}.tar.gz"
BACKUP_PATH="${BACKUP_DIR}/${BACKUP_NAME}"

# Temporary directory for staging backup
TEMP_DIR=$(mktemp -d)

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

cleanup() {
    if [ -d "$TEMP_DIR" ]; then
        rm -rf "$TEMP_DIR"
    fi
}

# Cleanup on exit
trap cleanup EXIT

# ============================================
# Pre-flight Checks
# ============================================

print_info "OpenWork Backup Script"
print_info "======================================"
echo ""

# Check if business directory exists
if [ ! -d "$BUSINESS_DIR" ]; then
    print_warning "Business directory not found: $BUSINESS_DIR"
    print_info "Creating business directory..."
    mkdir -p "$BUSINESS_DIR"
fi

# Create backup directory if it doesn't exist
if [ ! -d "$BACKUP_DIR" ]; then
    print_info "Creating backup directory: $BACKUP_DIR"
    mkdir -p "$BACKUP_DIR"
fi

# ============================================
# Create Backup Staging Area
# ============================================

print_info "Preparing backup in temporary directory..."

STAGING_DIR="${TEMP_DIR}/openwork-backup"
mkdir -p "$STAGING_DIR"

# ============================================
# Backup agent.md
# ============================================

print_info "Backing up agent.md..."

if [ -f "$BUSINESS_DIR/agent.md" ]; then
    cp "$BUSINESS_DIR/agent.md" "$STAGING_DIR/agent.md"
    print_success "Backed up: agent.md"
else
    print_warning "agent.md not found at $BUSINESS_DIR/agent.md"
fi

# ============================================
# Backup business/ directory
# ============================================

print_info "Backing up business/ directory..."

if [ -d "$BUSINESS_DIR" ]; then
    # Copy entire business directory
    cp -r "$BUSINESS_DIR" "$STAGING_DIR/business"
    print_success "Backed up: business/ directory"

    # Count files backed up
    FILE_COUNT=$(find "$STAGING_DIR/business" -type f | wc -l)
    print_info "Total files in business/: $FILE_COUNT"
else
    print_warning "Business directory not found: $BUSINESS_DIR"
fi

# ============================================
# Backup .env file (optional)
# ============================================

print_info "Backing up .env file..."

if [ -f "$PROJECT_ROOT/.env" ]; then
    # Only backup if user confirms (contains sensitive data)
    print_warning "The .env file contains sensitive API keys."
    print_info "Include .env in backup? [y/N]"

    # Check if running in cron (no TTY)
    if [ -t 0 ]; then
        read -r BACKUP_ENV
    else
        # In cron, default to yes for .env backup
        BACKUP_ENV="y"
    fi

    if [[ "$BACKUP_ENV" =~ ^[Yy]$ ]]; then
        cp "$PROJECT_ROOT/.env" "$STAGING_DIR/.env"
        chmod 600 "$STAGING_DIR/.env"
        print_success "Backed up: .env (secured with chmod 600)"
    else
        print_info "Skipping .env backup"
    fi
else
    print_warning ".env file not found at $PROJECT_ROOT/.env"
fi

# ============================================
# Backup sessions/ directory (optional)
# ============================================

print_info "Backing up sessions..."

SESSIONS_DIR="${PROJECT_ROOT}/sessions"

if [ -d "$SESSIONS_DIR" ]; then
    SESSION_COUNT=$(find "$SESSIONS_DIR" -type f | wc -l)

    if [ "$SESSION_COUNT" -gt 0 ]; then
        print_info "Found $SESSION_COUNT session files"
        print_info "Include sessions in backup? [y/N]"

        # Check if running in cron (no TTY)
        if [ -t 0 ]; then
            read -r BACKUP_SESSIONS
        else
            # In cron, default to no for sessions (can be large)
            BACKUP_SESSIONS="n"
        fi

        if [[ "$BACKUP_SESSIONS" =~ ^[Yy]$ ]]; then
            cp -r "$SESSIONS_DIR" "$STAGING_DIR/sessions"
            print_success "Backed up: sessions/ directory"
        else
            print_info "Skipping sessions backup"
        fi
    fi
else
    print_info "No sessions directory found"
fi

# ============================================
# Backup ecosystem.config.cjs
# ============================================

print_info "Backing up PM2 configuration..."

if [ -f "$PROJECT_ROOT/ecosystem.config.cjs" ]; then
    cp "$PROJECT_ROOT/ecosystem.config.cjs" "$STAGING_DIR/ecosystem.config.cjs"
    print_success "Backed up: ecosystem.config.cjs"
fi

# ============================================
# Create metadata file
# ============================================

print_info "Creating backup metadata..."

cat > "$STAGING_DIR/BACKUP_INFO.txt" << EOF
OpenWork Backup Information
====================================

Backup Date: $(date)
Backup Name: ${BACKUP_NAME}
Hostname: $(hostname)
User: $(whoami)

Backed Up Items:
- agent.md: $([ -f "$STAGING_DIR/agent.md" ] && echo "Yes" || echo "No")
- business/ directory: $([ -d "$STAGING_DIR/business" ] && echo "Yes" || echo "No")
- .env file: $([ -f "$STAGING_DIR/.env" ] && echo "Yes" || echo "No")
- sessions/: $([ -d "$STAGING_DIR/sessions" ] && echo "Yes" || echo "No")
- ecosystem.config.cjs: $([ -f "$STAGING_DIR/ecosystem.config.cjs" ] && echo "Yes" || echo "No")

Business Directory Stats:
- Total files: $([ -d "$STAGING_DIR/business" ] && find "$STAGING_DIR/business" -type f | wc -l || echo "0")
- Total size: $([ -d "$STAGING_DIR/business" ] && du -sh "$STAGING_DIR/business" | cut -f1 || echo "0")

Restore Instructions:
1. Extract this archive: tar -xzf ${BACKUP_NAME}
2. Copy files to appropriate locations:
   - cp agent.md ~/business/agent.md
   - cp -r business/* ~/business/
   - cp .env [project-root]/.env (if included)
   - cp ecosystem.config.cjs [project-root]/
3. Restart OpenWork services

EOF

print_success "Created backup metadata"

# ============================================
# Create Compressed Archive
# ============================================

print_info "Creating compressed archive..."

cd "$TEMP_DIR"
tar -czf "$BACKUP_PATH" openwork-backup/

if [ $? -eq 0 ]; then
    BACKUP_SIZE=$(du -h "$BACKUP_PATH" | cut -f1)
    print_success "Backup created: $BACKUP_PATH"
    print_info "Backup size: $BACKUP_SIZE"
else
    print_error "Failed to create backup archive"
    exit 1
fi

# ============================================
# Cleanup Old Backups (keep last 7 days)
# ============================================

print_info "Cleaning up old backups..."

# Count existing backups
BACKUP_COUNT=$(ls -1 "$BACKUP_DIR"/openwork-backup-*.tar.gz 2>/dev/null | wc -l)

if [ "$BACKUP_COUNT" -gt 7 ]; then
    print_info "Found $BACKUP_COUNT backups. Keeping only the 7 most recent..."

    # Delete backups older than 7 days
    find "$BACKUP_DIR" -name "openwork-backup-*.tar.gz" -type f -mtime +7 -delete

    NEW_COUNT=$(ls -1 "$BACKUP_DIR"/openwork-backup-*.tar.gz 2>/dev/null | wc -l)
    DELETED_COUNT=$((BACKUP_COUNT - NEW_COUNT))

    if [ "$DELETED_COUNT" -gt 0 ]; then
        print_success "Deleted $DELETED_COUNT old backup(s)"
    fi
else
    print_info "Current backup count: $BACKUP_COUNT (keeping all)"
fi

# ============================================
# Summary
# ============================================

echo ""
print_success "======================================"
print_success "Backup Complete!"
print_success "======================================"
echo ""
print_info "Backup location: $BACKUP_PATH"
print_info "Backup size: $BACKUP_SIZE"
echo ""
print_info "To restore from this backup:"
echo "  cd ~"
echo "  tar -xzf $BACKUP_PATH"
echo "  # Then copy files to appropriate locations"
echo ""
print_info "To list backup contents:"
echo "  tar -tzf $BACKUP_PATH"
echo ""

# ============================================
# Optional: Upload to Remote Storage
# ============================================

# Uncomment and configure this section if you want to upload backups to remote storage
# Example: S3, Google Drive, rsync to another server, etc.

# print_info "Upload backup to remote storage? [y/N]"
# if [ -t 0 ]; then
#     read -r UPLOAD_BACKUP
# else
#     UPLOAD_BACKUP="n"
# fi
#
# if [[ "$UPLOAD_BACKUP" =~ ^[Yy]$ ]]; then
#     print_info "Uploading to remote storage..."
#     # Add your upload command here
#     # Example: rclone copy "$BACKUP_PATH" remote:backups/
#     # Example: aws s3 cp "$BACKUP_PATH" s3://your-bucket/backups/
#     print_success "Backup uploaded to remote storage"
# fi

exit 0
