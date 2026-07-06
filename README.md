<div align="center">
  <a href="https://www.npmjs.com/package/@oevortex/ddg_search">
    <img src="https://img.shields.io/npm/v/@oevortex/ddg_search.svg" alt="npm version" />
  </a>
  <a href="https://github.com/OEvortex/ddg_search/blob/main/LICENSE">
    <img src="https://img.shields.io/badge/License-Apache%202.0-blue.svg" alt="License: Apache 2.0" />
  </a>
  <a href="https://youtube.com/@OEvortex">
    <img src="https://img.shields.io/badge/YouTube-%40OEvortex-red.svg" alt="YouTube Channel" />
  </a>
  <h1>DDG Search</h1>
  <p>
    <strong>Web search and AI-powered answers from the command line or MCP.</strong><br>
    DuckDuckGo, IAsk AI, and Monica AI. No API keys required.
  </p>
</div>

---

## Quick Start

```bash
# Search from the command line
npx -y @oevortex/ddg_search@latest "your search query"

# Or install globally
npm install -g @oevortex/ddg_search
ddg "your search query"
```

## Usage

### CLI

```bash
# Basic web search (DuckDuckGo)
ddg "quantum computing"

# Get more results
ddg "latest news" -n 10

# AI-generated answer (IAsk)
ddg "explain recursion" -m ai

# AI-generated answer (Monica)
ddg "hello world" -m ai -b monica

# IAsk with options
ddg "gravity" -m ai --iask-mode academic --detail-level comprehensive
```

### Flags

| Flag | Description | Default |
|------|-------------|---------|
| `-m, --mode` | `web` or `ai` | `web` |
| `-b, --backend` | `iask` or `monica` (AI mode only) | `iask` |
| `-n, --num-results` | Number of results (1-20, web mode) | `3` |
| `--iask-mode` | `question`, `academic`, `forums`, `wiki`, `thinking` | `thinking` |
| `--detail-level` | `concise`, `detailed`, `comprehensive` | — |
| `-h, --help` | Show help | |
| `-v, --version` | Show version | |

### MCP Server

Start the MCP server for use with Claude Desktop, OpenCode, or other MCP clients:

```bash
ddg --server
```

**Claude Desktop config:**

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

**Global install config:**

```json
{
  "mcpServers": {
    "ddg-search": {
      "command": "ddg"
    }
  }
}
```

### Programmatic API

```javascript
import { searchDuckDuckGo } from '@oevortex/ddg_search/src/utils/search.js';
import { searchIAsk } from '@oevortex/ddg_search/src/utils/search_iask.js';
import { searchMonica } from '@oevortex/ddg_search/src/utils/search_monica.js';

// DuckDuckGo
const results = await searchDuckDuckGo("query", 5);

// IAsk AI
const answer = await searchIAsk("query", "thinking", null);

// Monica AI
const answer = await searchMonica("query");
```

### MCP Tool Schema

Single unified tool `web-search`:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `query` | string | required | Search query |
| `mode` | `"web"` \| `"ai"` | `"web"` | DuckDuckGo results or AI answer |
| `backend` | `"iask"` \| `"monica"` | `"iask"` | AI backend (mode=ai only) |
| `numResults` | integer | `3` | Results count (web mode, 1-20) |
| `iaskMode` | string | `"thinking"` | IAsk mode (backend=iask only) |
| `detailLevel` | string | — | IAsk detail level (backend=iask only) |

## Agent Prompt

Add this to your agent's system prompt to enable web search:

```
When you need to search the web or find current information, use the DDG Search CLI:

  npx -y @oevortex/ddg_search@latest "<query>" -m ai

This runs an AI-powered web search via IAsk. For standard DuckDuckGo results (titles + URLs + snippets), use mode "web" instead:

  npx -y @oevortex/ddg_search@latest "<query>" -m web -n 5

For a different AI backend (Monica), add -b monica. Use this for any research, fact-checking, or current events task.
```

## Proxy Support

Respects `HTTP_PROXY`, `HTTPS_PROXY`, and `NO_PROXY` environment variables automatically.

```bash
HTTPS_PROXY=http://proxy:8080 ddg "search query"
```

## Install

```bash
npm install -g @oevortex/ddg_search
```

Or use `npx` without installing.

## Project Structure

```
bin/cli.js              CLI entry point
src/
  index.ts              MCP server
  tools/
    searchTool.js       Unified search tool
  utils/
    search.js           DuckDuckGo scraper
    search_iask.js      IAsk AI client
    search_monica.js    Monica AI client
    user_agents.js      User agent rotation
skills/
  ddg-search/           Agent skill for marketplace
```

## Contributing

Pull requests welcome. Open an issue for bugs or feature requests.

## License

Apache 2.0

---

<div align="center">
  <sub>Made by <a href="https://youtube.com/@OEvortex">@OEvortex</a></sub>
</div>
