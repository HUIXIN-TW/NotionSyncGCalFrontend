#!/usr/bin/env bash
set -euo pipefail

TOKEN="${1:-}"

if [ -z "$TOKEN" ]; then
  echo "Usage: $0 <NOTION_ACCESS_TOKEN>"
  exit 1
fi

# Colors for output
GREEN="\033[0;32m"
YELLOW="\033[1;33m"
NC="\033[0m"

echo -e "${YELLOW}Verifying Notion token...${NC}"
USER_JSON=$(curl -s -X GET "https://api.notion.com/v1/users/me" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Notion-Version: 2022-06-28")

echo "$USER_JSON" | jq .

# Extract and display bot and workspace info
WORKSPACE=$(echo "$USER_JSON" | jq -r '.bot.workspace_name // empty')
BOT_NAME=$(echo "$USER_JSON" | jq -r '.name // empty')

echo -e "\n${GREEN}Bot:${NC} $BOT_NAME"
echo -e "${GREEN}Workspace:${NC} $WORKSPACE\n"

echo -e "${YELLOW}Listing accessible databases...${NC}"
curl -s -X POST "https://api.notion.com/v1/search" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -H "Notion-Version: 2022-06-28" \
  -d '{"filter":{"property":"object","value":"database"}}' \
  | jq -r '.results[] | "🗂  \(.title[0].plain_text)  (\(.id))"' || echo "No accessible databases."

echo -e "\n${YELLOW}Tip:${NC} To add access, open a Notion database → Share → Invite → select your integration."
