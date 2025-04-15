<div align="center">
  <img src="https://img.shields.io/npm/v/@oevortex/ddg_search.svg" alt="npm version" />
  <img src="https://img.shields.io/badge/License-Apache%202.0-blue.svg" alt="License: Apache 2.0" />
  <img src="https://img.shields.io/badge/YouTube-%40OEvortex-red.svg" alt="YouTube Channel" />
  <h1>DuckDuckGo Search MCP 🔍</h1>
  <p>A blazing-fast, privacy-friendly Model Context Protocol (MCP) server for web search and URL content extraction using DuckDuckGo.</p>
  <a href="https://youtube.com/@OEvortex"><strong>Subscribe for updates & tutorials</strong></a>
</div>

---

> [!IMPORTANT]
> DuckDuckGo Search MCP supports the Model Context Protocol (MCP) standard, making it compatible with various AI assistants and tools.

---

## ✨ Features

<div style="display: flex; flex-wrap: wrap; gap: 1.5em; margin-bottom: 1.5em;">
  <div><b>🌐 Web search</b> using DuckDuckGo HTML</div>
  <div><b>📄 URL content extraction</b> with smart filtering</div>
  <div><b>📊 URL metadata extraction</b> (title, description, images)</div>
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
npx -y @oevortex/ddg_search
```
</div>

> [!TIP]
> This will download and run the MCP server directly without installation – perfect for quick use with AI assistants.

---

## 🛠️ Installation Options

<details>
<summary><b>Global Installation</b></summary>

```bash
npm install -g @oevortex/ddg_search
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

</details>

---

## 🧑‍💻 Command Line Options

```bash
npx -y @oevortex/ddg_search --help
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
      "args": ["-y", "@oevortex/ddg_search"]
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
    <b>📄 Fetch URL Tool</b><br/>
    <code>fetch-url</code><br/>
    <ul>
      <li><b>url</b> (string, required): The URL to fetch</li>
      <li><b>maxLength</b> (integer, optional, default: 10000): Max content length</li>
      <li><b>extractMainContent</b> (boolean, optional, default: true): Extract main content</li>
      <li><b>includeLinks</b> (boolean, optional, default: true): Include link text</li>
      <li><b>includeImages</b> (boolean, optional, default: true): Include image alt text</li>
      <li><b>excludeTags</b> (array, optional): Tags to exclude</li>
    </ul>
    <i>Example: Fetch the content from "https://example.com"</i>
  </div>
  <div style="margin-bottom: 1.5em;">
    <b>📊 URL Metadata Tool</b><br/>
    <code>url-metadata</code><br/>
    <ul>
      <li><b>url</b> (string, required): The URL to extract metadata from</li>
    </ul>
    <i>Example: Get metadata for "https://example.com"</i>
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
    fetchUrlTool.js
    metadataTool.js
  utils/
    search.js     # Search and URL utilities
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
