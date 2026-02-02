# Google Drive MCP Setup Guide

This guide explains how to set up the Model Context Protocol (MCP) server for Google Drive integration with OpenWork, enabling your AI agent to read and write files directly to your Google Drive.

## Overview

MCP (Model Context Protocol) allows OpenWork to connect to external services like Google Drive. Once configured, your agent can:
- Read documents from Google Drive
- Create and update files
- Search for documents
- List folder contents
- Move and organize files

## Prerequisites

- Node.js 18+ or Bun installed
- A Google Cloud account
- Google Drive API enabled
- OAuth 2.0 credentials

## Step 1: Set Up Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Drive API:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Google Drive API"
   - Click "Enable"

## Step 2: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Select "Desktop app" as the application type
4. Name it "OpenWork Drive Access"
5. Click "Create"
6. Download the credentials JSON file
7. Save it as `google-drive-credentials.json` in a secure location

## Step 3: Install MCP Server for Google Drive

There are several Google Drive MCP server implementations. We recommend:

```bash
# Using npm
npm install -g @modelcontextprotocol/server-gdrive

# Or using bun
bun add -g @modelcontextprotocol/server-gdrive
```

**Note:** If the official MCP server isn't available yet, you can use community implementations:
- [mcp-server-gdrive](https://github.com/examples/mcp-server-gdrive) (check npm for latest)

## Step 4: Configure MCP in OpenWork

Add the Google Drive MCP server to your OpenWork configuration file.

### Location of Config File

The configuration file location depends on your setup:
- **Development:** `~/.openwork/config.json`
- **Production:** `/etc/openwork/config.json` or as specified in your deployment

### Configuration Format

Add this to your `config.json`:

```json
{
  "mcpServers": {
    "gdrive": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-gdrive",
        "--credentials",
        "/path/to/google-drive-credentials.json"
      ],
      "env": {
        "GDRIVE_ROOT_FOLDER": "OpenWork"
      }
    }
  }
}
```

**Configuration Options:**

- `credentials`: Path to your OAuth credentials JSON file
- `GDRIVE_ROOT_FOLDER`: (Optional) Restrict access to a specific folder in your Drive

## Step 5: Authenticate

The first time OpenWork uses the Google Drive MCP server, you'll need to authenticate:

1. Start OpenWork
2. The MCP server will provide an authentication URL
3. Open the URL in your browser
4. Grant permissions to your Google Drive
5. Copy the authorization code back to the prompt
6. The server will save your authentication token

**Token Storage:**
- Tokens are typically stored in `~/.config/mcp-server-gdrive/tokens/`
- Keep these secure as they provide access to your Drive

## Step 6: Verify Setup

Test the integration by asking OpenWork to access your Drive:

```
You: "List the files in my Google Drive OpenWork folder"

OpenWork: [Uses MCP to access Drive and lists files]
```

## Usage Examples

Once configured, you can ask OpenWork to:

- **Read documents:** "Read the business plan from my Drive"
- **Create documents:** "Create a new marketing proposal in Drive"
- **Search:** "Find all invoices from 2025 in Drive"
- **Update files:** "Update the Q1 report with the new financial data"
- **Organize:** "Move all client proposals to the Clients folder"

## Updating agent.md

Update your `agent.md` file to include your Google Drive folder structure:

```markdown
## Document Locations
- Business plans: ~/business/plans/ (local) or Drive://OpenWork/Plans
- Client files: ~/business/clients/ (local) or Drive://OpenWork/Clients
- Marketing: ~/business/marketing/ (local) or Drive://OpenWork/Marketing
- Google Drive root: Drive://OpenWork/
```

## Security Best Practices

1. **Restrict folder access:** Use `GDRIVE_ROOT_FOLDER` to limit access
2. **Secure credentials:** Store credentials in a secure location, not in version control
3. **Use service accounts:** For production, consider using Google Service Accounts instead of OAuth
4. **Review permissions:** Regularly audit which files the agent has accessed
5. **Backup important files:** Always maintain backups outside of Drive

## Troubleshooting

### "Cannot find credentials file"
- Check the path in your config.json
- Use absolute paths, not relative paths
- Ensure the file has proper read permissions

### "Authentication failed"
- Delete stored tokens: `rm -rf ~/.config/mcp-server-gdrive/tokens/`
- Re-authenticate from scratch
- Check that the Google Drive API is enabled

### "Permission denied"
- Verify OAuth scopes include Drive access
- Re-generate credentials with proper scopes
- Check folder sharing settings in Drive

### "MCP server not found"
- Ensure the MCP server package is installed globally
- Check that npx or bun can find the executable
- Try using full path to the MCP server binary

## Alternative: Local Sync

If you prefer not to use MCP, you can set up Google Drive sync:

1. Install Google Drive desktop app
2. Sync your OpenWork folder locally
3. Point agent.md to the local sync folder

This approach is simpler but doesn't allow the agent to access Drive directly.

## Resources

- [MCP Documentation](https://modelcontextprotocol.io)
- [Google Drive API Reference](https://developers.google.com/drive/api/guides/about-sdk)
- [OpenWork Configuration Guide](./configuration.md)

## Support

If you encounter issues:
1. Check the OpenWork logs for MCP connection errors
2. Verify your Google Cloud project setup
3. Test the MCP server independently
4. Consult the MCP server repository for server-specific issues
