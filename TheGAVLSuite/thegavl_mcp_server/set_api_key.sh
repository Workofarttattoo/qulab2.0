#!/bin/bash
# Copyright (c) 2025 Joshua Hendricks Cole (DBA: Corporation of Light). All Rights Reserved. PATENT PENDING.
#
# Helper script to set GAVL API key for Claude Desktop MCP integration

CONFIG_FILE="$HOME/Library/Application Support/Claude/mcp_config.json"

echo "═══════════════════════════════════════════════════════"
echo "  GAVL MCP Server - API Key Configuration"
echo "═══════════════════════════════════════════════════════"
echo ""

# Check if API key is provided as argument
if [ -n "$1" ]; then
    API_KEY="$1"
else
    # Prompt for API key
    echo "Enter your GAVL API key (or press Enter to use DEMO mode):"
    read -r API_KEY

    if [ -z "$API_KEY" ]; then
        API_KEY="DEMO-MODE-REPLACE-WITH-YOUR-KEY"
        echo ""
        echo "⚠️  Using DEMO mode (no API key)"
        echo "   The server will return simulated verdicts for testing."
        echo ""
    fi
fi

# Create config directory if it doesn't exist
mkdir -p "$(dirname "$CONFIG_FILE")"

# Backup existing config if it exists
if [ -f "$CONFIG_FILE" ]; then
    cp "$CONFIG_FILE" "$CONFIG_FILE.backup.$(date +%s)"
    echo "✅ Backed up existing config"
fi

# Create new config with API key
cat > "$CONFIG_FILE" << EOF
{
  "mcpServers": {
    "gavl": {
      "command": "python",
      "args": ["/Users/noone/TheGAVLSuite/thegavl_mcp_server/server.py"],
      "env": {
        "GAVL_API_KEY": "$API_KEY",
        "GAVL_API_URL": "https://api.thegavl.com/v1",
        "GAVL_ANONYMIZE": "true",
        "GAVL_LOG_LEVEL": "INFO"
      }
    }
  }
}
EOF

echo "✅ API key configured"
echo ""
echo "Configuration saved to:"
echo "  $CONFIG_FILE"
echo ""
echo "Next steps:"
echo "  1. Restart Claude Desktop"
echo "  2. Look for 'gavl' in the MCP tools menu"
echo "  3. Try: 'Analyze this contract dispute: [case details]'"
echo ""
echo "═══════════════════════════════════════════════════════"
