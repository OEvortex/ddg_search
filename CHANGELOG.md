# Changelog

All notable changes to this project will be documented in this file.

## [1.1.7] - 2025-11-30
### Changed
- Replaced Felo AI tool with IAsk AI tool for advanced AI-powered search
- Added new dependencies: `turndown` for HTML to Markdown conversion, `ws` for WebSocket support
- Updated README to reflect changes and new tool usage
- Added new modes: 'short', 'detailed' in web search tool
- Added `src/utils/search_iask.js` implementing IAsk API client
- Added `src/tools/iaskTool.js` tool definition and handler
- Updated `src/index.ts` to use IAsk tool instead of Felo
- Updated `package.json` description, keywords, and dependencies (`turndown`, `ws`)
- Updated `README.md` to reference IAsk AI and document new tool parameters
- Removed old Felo tool files (`feloTool.js`, `search_felo.js`)

## [1.1.2] - 2025-11-29
### Added
- Initial release with DuckDuckGo and Felo AI search tools
- MCP server implementation
- Caching, rotating user agents, and web scraping features
