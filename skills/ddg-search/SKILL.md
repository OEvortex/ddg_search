---
name: ddg-search
description: Search the web and get AI-generated answers using DuckDuckGo, IAsk AI, or Monica AI. Use when the user wants to search the internet, find information online, look up current events, research a topic, get AI-powered answers from the web, or perform any web research task. Supports both standard search results and AI-generated comprehensive answers.
---

# DDG Search

Search the web via CLI or MCP. No API keys required.

## CLI Usage

```bash
# Basic search (DuckDuckGo)
ddg "search query"

# Get more results
ddg "search query" -n 10

# AI-generated answer (IAsk)
ddg "search query" -m ai

# AI-generated answer (Monica)
ddg "search query" -m ai -b monica

# IAsk with options
ddg "search query" -m ai --iask-mode academic --detail-level comprehensive
```

### Flags

| Flag | Description |
|------|-------------|
| `-m, --mode <web\|ai>` | Search mode (default: web) |
| `-b, --backend <iask\|monica>` | AI backend (default: iask) |
| `-n, --num-results <1-20>` | Number of web results (default: 3) |
| `--iask-mode <mode>` | IAsk mode: question/academic/forums/wiki/thinking |
| `--detail-level <level>` | IAsk detail: concise/detailed/comprehensive |

## Programmatic Usage

```javascript
import { searchDuckDuckGo } from '@oevortex/ddg_search/src/utils/search.js';
import { searchIAsk } from '@oevortex/ddg_search/src/utils/search_iask.js';
import { searchMonica } from '@oevortex/ddg_search/src/utils/search_monica.js';

// DuckDuckGo search
const results = await searchDuckDuckGo("query", 5);

// IAsk AI answer
const answer = await searchIAsk("query", "thinking", null);

// Monica AI answer
const answer = await searchMonica("query");
```

## MCP Server

```bash
# Start MCP server (stdio)
ddg --server
```

MCP config for Claude Desktop / OpenCode:

```json
{
  "mcpServers": {
    "ddg-search": {
      "command": "npx",
      "args": ["-y", "@oevortex/ddg_search@latest"]
    }
  }
}
```

## Tool Schema (MCP)

Single tool `web-search` with these parameters:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `query` | string | required | Search query |
| `mode` | "web" \| "ai" | "web" | DuckDuckGo results or AI answer |
| `backend` | "iask" \| "monica" | "iask" | AI backend (when mode=ai) |
| `numResults` | integer | 3 | Number of results (web mode, 1-20) |
| `iaskMode` | string | "thinking" | IAsk mode (when backend=iask) |
| `detailLevel` | string | — | IAsk detail level (when backend=iask) |

## Proxy Support

Respects `HTTP_PROXY`, `HTTPS_PROXY`, and `NO_PROXY` environment variables automatically.
