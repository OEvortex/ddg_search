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
  <h1>DuckDuckGo, IAsk AI, Monica & Brave AI Search MCP <span style="font-size:2.2rem;">🔍🧠</span></h1>
  <p style="font-size:1.15rem; max-width:600px; margin:0 auto;">
    <strong>Lightning-fast, privacy-first Model Context Protocol (MCP) server for web search and AI-powered answers.<br>
    Powered by DuckDuckGo, IAsk AI, Monica, and Brave AI.</strong>
  </p>
  <a href="https://glama.ai/mcp/servers/@OEvortex/ddg_search">
    <img width="380" height="200" src="https://glama.ai/mcp/servers/@OEvortex/ddg_search/badge" alt="DuckDuckGo Search MCP server" />
  </a>
  <br>
  <a href="https://youtube.com/@OEvortex"><strong>Subscribe for updates & tutorials</strong></a>
</div>

---

> [!IMPORTANT]
> DuckDuckGo Search MCP supports the Model Context Protocol (MCP) standard, making it compatible with various AI assistants and tools.

---

## ✨ Features

<div style="display: flex; flex-wrap: wrap; gap: 1.5em; margin-bottom: 1.5em;">  <div><b>🌐 Web search</b> using DuckDuckGo HTML</div>
  <div><b>🧠 AI search</b> using IAsk AI, Monica & Brave AI</div>
  <div><b>⚡ Performance optimized</b> with caching</div>
  <div><b>🛡️ Security features</b> including rate limiting and rotating user agents</div>
  <div><b>🔌 MCP-compliant</b> server implementation</div>
  <div><b>🆓 No API keys required</b> - works out of the box</div>
</div>


> [!IMPORTANT]
> Unlike many search tools, this package performs actual web scraping rather than using limited APIs, giving you more comprehensive results.

---

## 🚀 Quick Start

<div style="background: #222; color: #fff; padding: 1.5em; border-radius: 8px; margin: 1.5em 0;">
<b>Run instantly with npx:</b>

```bash
npx -y @oevortex/ddg_search@latest
```
</div>


> [!TIP]
> This will download and run the latest version of the MCP server directly without installation – perfect for quick use with AI assistants.

---

## 🛠️ Installation Options

<details>
<summary><b>Global Installation (npm)</b></summary>

```bash
npm install -g @oevortex/ddg_search
```

Run globally:

```bash
ddg-search-mcp
```

</details>

<details>
<summary><b>Global Installation (Yarn)</b></summary>

```bash
yarn global add @oevortex/ddg_search
```

Run globally:

```bash
ddg-search-mcp
```

</details>

<details>
<summary><b>Global Installation (pnpm)</b></summary>

```bash
pnpm add -g @oevortex/ddg_search
```

Run globally:

```bash
ddg-search-mcp
```

</details>

<details>
<summary><b>Local Installation (Development)</b></summary>

```bash
git clone https://github.com/OEvortex/ddg_search.git
cd ddg_search
npm install
npm start
```

Or with Yarn:

```bash
yarn install
yarn start
```

Or with pnpm:

```bash
pnpm install
pnpm start
```

</details>

---

## 🧑‍💻 Command Line Options

```bash
npx -y @oevortex/ddg_search@latest --help
```

> [!TIP]
> Use the <code>--version</code> flag to check which version you're running.

---

## 🤖 Using with MCP Clients

> [!IMPORTANT]
> The most common way to use this tool is by integrating it with MCP-compatible AI assistants.

Add the server to your MCP client configuration:

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

Or if installed globally:

```json
{
  "mcpServers": {
    "ddg-search": {
      "command": "ddg-search-mcp"
    }
  }
}
```

> [!TIP]
> After configuring, restart your MCP client to apply the changes.

---

## 🧰 Tools Overview

<div style="display: flex; flex-wrap: wrap; gap: 2.5em; margin: 1.5em 0;">
  <div style="margin-bottom: 1.5em;">
    <b>🔍 Web Search Tool</b><br/>
    <code>web-search</code><br/>
    <ul>
      <li><b>query</b> (string, required): The search query</li>
      <li><b>page</b> (integer, optional, default: 1): Page number</li>
      <li><b>numResults</b> (integer, optional, default: 10): Number of results (1-20)</li>
    </ul>
    <i>Example: Search the web for "climate change solutions"</i>
  </div>
  <div style="margin-bottom: 1.5em;">
    <b>🧠 IAsk AI Search Tool</b><br/>
    <code>iask-search</code><br/>
    <ul>
      <li><b>query</b> (string, required): The search query or question</li>
      <li><b>mode</b> (string, optional, default: "question"): Search mode - "question", "academic", "forums", "wiki", or "thinking"</li>
      <li><b>detailLevel</b> (string, optional): Response detail level - "concise", "detailed", or "comprehensive"</li>
    </ul>
    <i>Example: Search IAsk AI for "Explain quantum computing in simple terms"</i>
  </div>
  <div style="margin-bottom: 1.5em;">
    <b>🤖 Monica AI Search Tool</b><br/>
    <code>monica-search</code><br/>
    <ul>
      <li><b>query</b> (string, required): The search query or question</li>
    </ul>
    <i>Example: Search Monica AI for "Latest advancements in AI"</i>
  </div>
  <div style="margin-bottom: 1.5em;">
    <b>🛡️ Brave AI Search Tool</b><br/>
    <code>brave-search</code><br/>
    <ul>
      <li><b>query</b> (string, required): The search query or question</li>
      <li><b>enableResearch</b> (boolean, optional, default: false): Enable deep research mode</li>
    </ul>
    <i>Example: Search Brave AI for "Summarize the latest AI safety research"</i>
  </div>
</div>

---

## 📁 Project Structure


```text
bin/              # Command-line interface
src/
  index.js        # Main entry point
  tools/          # Tool definitions and handlers
    searchTool.js
    iaskTool.js
    monicaTool.js
    braveTool.js
  utils/
    search.js     # Search and URL utilities
    user_agents.js
    search_monica.js
    search_iask.js # IAsk AI search utilities
    search_brave_ai.js
package.json
README.md
```

---

## 🤝 Contributing


Contributions are welcome! Please open issues or submit pull requests.

> [!NOTE]
> Please follow the existing code style and add tests for new features.

---

## 📺 YouTube Channel


<div align="center">
  <a href="https://youtube.com/@OEvortex"><img src="https://img.shields.io/badge/YouTube-%40OEvortex-red.svg" alt="YouTube Channel" /></a>
  <br/>
  <a href="https://youtube.com/@OEvortex">youtube.com/@OEvortex</a>
</div>

---

## 📄 License


Apache License 2.0

> [!NOTE]
> This project is licensed under the Apache License 2.0 – see the <a href="LICENSE">LICENSE</a> file for details.

---

<div align="center">
  <sub>Made with ❤️ by <a href="https://youtube.com/@OEvortex">@OEvortex</a></sub>
</div>
