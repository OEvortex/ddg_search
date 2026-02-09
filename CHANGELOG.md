# Changelog
 
All notable changes to this project will be documented in this file.

## [1.2.2] - 2026-02-09

### Removed
- Brave AI Search provider and tool
- Brave AI search utility with streaming response parsing
- Brave AI tool tests and MCP integration coverage

### Changed
- Updated package.json version to 1.2.2

## [1.2.1] - 2026-01-19
### Added
- Brave AI Search provider and tool with research mode toggle
- Brave AI search utility with streaming response parsing
- Brave AI tool tests and MCP integration coverage
- Updated CLI help text and README documentation for Brave AI

### Changed
- Server and CLI tool registry to include brave-search

## [1.2.0] - 2025-12-21
### Added
- Comprehensive Jest testing framework with ES module support
- Complete unit test suite for all utility functions (search, user_agents, search_iask, search_monica)
- Integration tests for MCP server functionality and tool routing
- Test infrastructure with mocking for all external dependencies
- Input validation across all search modules and tools
- Enhanced error handling with specific network error types
- Performance optimizations with timeout management and caching
- Improved logging and monitoring capabilities
- Fixed JSON parsing error in searchTool handler (1.1.9 regression)
- Updated package.json with comprehensive test scripts
- Added Babel configuration for test compatibility

### Improved
- Search module robustness with AbortController and timeout management
- IAsk AI WebSocket connection handling with enhanced error reporting
- Monica AI stream processing with improved validation
- Tool schema validation with comprehensive parameter checking
- User agent rotation consistency and logging
- Cache management with hit detection and size controls

## [1.1.9] - 2025-12-21
### Added
- Added new `getRandomUserAgent` function to rotate user agents
- Added new `src/utils/user_agents.js` file containing list of user agents
- switch to use `user_agents.js` file for user agent rotation
- Removed stream from iaskTool.js & search_iask.js
- Added new `monica-search` tool for AI-powered search using Monica AI

### Changed
- Updated `src/index.ts` to use IAsk tool instead of Felo tool
- Updated `package.json` description, keywords, and dependencies (`turndown`, `ws`)
- Updated `README.md` to reference IAsk AI and document new tool parameters
- Removed old Felo tool files (`feloTool.js`, `search_felo.js`)

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
