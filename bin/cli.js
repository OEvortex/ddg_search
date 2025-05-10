#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

// Import tool definitions and handlers
const modulePath = new URL('../src', import.meta.url).pathname;

// Dynamic imports
async function startServer() {
  try {
    // Dynamically import the modules
    const { searchToolDefinition, searchToolHandler } = await import(`${modulePath}/tools/searchTool.js`);
    const { fetchUrlToolDefinition, fetchUrlToolHandler } = await import(`${modulePath}/tools/fetchUrlTool.js`);
    const { metadataToolDefinition, metadataToolHandler } = await import(`${modulePath}/tools/metadataTool.js`);
    const { feloToolDefinition, feloToolHandler } = await import(`${modulePath}/tools/feloTool.js`);    // Create the MCP server
    const server = new Server({
      id: 'ddg-search-mcp',
      name: 'DuckDuckGo & Felo AI Search MCP',
      description: 'A Model Context Protocol server for web search using DuckDuckGo and Felo AI',
      version: '1.1.1'
    }, {
      capabilities: {
        tools: {}
      }
    });

    // Define available tools
    server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          searchToolDefinition,
          fetchUrlToolDefinition,
          metadataToolDefinition,
          feloToolDefinition
        ]
      };
    });

    // Handle tool execution
    server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        const { name, arguments: args } = request.params;

        // Route to the appropriate tool handler
        switch (name) {
          case 'web-search':
            return await searchToolHandler(args);

          case 'fetch-url':
            return await fetchUrlToolHandler(args);

          case 'url-metadata':
            return await metadataToolHandler(args);
          
          case 'felo-search':
            return await feloToolHandler(args);

          default:
            throw new Error(`Tool not found: ${name}`);
        }
      } catch (error) {
        console.error(`Error handling ${request.params.name} request:`, error);
        return {
          isError: true,
          content: [
            {
              type: 'text',
              text: `Error: ${error.message}`
            }
          ]
        };
      }
    });    // Display promotional message
    console.error('\n\x1b[36m╔════════════════════════════════════════════════════════════╗');
    console.error('║                                                            ║');
    console.error('║  \x1b[1m\x1b[31mDuckDuckGo & Felo AI Search MCP\x1b[0m\x1b[36m by \x1b[1m\x1b[33m@OEvortex\x1b[0m\x1b[36m       ║');
    console.error('║                                                            ║');
    console.error('║  \x1b[0m👉 Subscribe to \x1b[1m\x1b[37myoutube.com/@OEvortex\x1b[0m\x1b[36m for more tools!  ║');
    console.error('║                                                            ║');
    console.error('╚════════════════════════════════════════════════════════════╝\x1b[0m\n');

    // Start the server with stdio transport
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('DuckDuckGo & Felo AI Search MCP server started and listening on stdio');
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const helpFlag = args.includes('--help') || args.includes('-h');
const versionFlag = args.includes('--version') || args.includes('-v');

if (helpFlag) {
  console.log(`
DuckDuckGo & Felo AI Search MCP - A Model Context Protocol server for web search

Usage:
  npx -y @oevortex/ddg_search@latest [options]

Options:
  -h, --help     Show this help message
  -v, --version  Show version information

This MCP server provides the following tools:
  - web-search: Search the web using DuckDuckGo
  - fetch-url: Fetch and extract content from a URL
  - url-metadata: Extract metadata from a URL
  - felo-search: Search using Felo AI for AI-generated responses

Created by @OEvortex
Subscribe to youtube.com/@OEvortex for more tools and tutorials!

For more information, visit: https://github.com/OEvortex/ddg_search
  `);
  process.exit(0);
}

if (versionFlag) {
  // Read version from package.json using fs
  import('fs/promises')
    .then(async ({ readFile }) => {
      try {
        const packageJson = JSON.parse(
          await readFile(new URL('../package.json', import.meta.url), 'utf8')
        );
        console.log(`DuckDuckGo & Felo AI Search MCP v${packageJson.version}\nCreated by @OEvortex - Subscribe to youtube.com/@OEvortex!`);
        process.exit(0);
      } catch (err) {
        console.error('Error reading version information:', err);
        process.exit(1);
      }
    })
    .catch(err => {
      console.error('Error importing fs module:', err);
      process.exit(1);
    });
} else {
  // Start the server
  startServer();
}
