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
    const { iaskToolDefinition, iaskToolHandler } = await import(`${modulePath}/tools/iaskTool.js`);
    const { monicaToolDefinition, monicaToolHandler } = await import(`${modulePath}/tools/monicaTool.js`);
    const { braveToolDefinition, braveToolHandler } = await import(`${modulePath}/tools/braveTool.js`);

    // Create the MCP server
    const server = new Server({
      id: 'ddg-search-mcp',
      name: 'DuckDuckGo, IAsk AI, Monica & Brave AI Search MCP',
      description: 'A Model Context Protocol server for web search using DuckDuckGo, IAsk AI, Monica, and Brave AI',
      version: '1.1.8'
    }, {
      capabilities: {
        tools: {
          listChanged: true
        }
      }
    });

    // Global variable to track available tools
    let availableTools = [
      searchToolDefinition,
      iaskToolDefinition,
      monicaToolDefinition,
      braveToolDefinition
    ];

    // Define available tools
    server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: availableTools
      };
    });

    // Function to notify clients when tools list changes
    function notifyToolsChanged() {
      server.notification({
        method: 'notifications/tools/list_changed'
      });
    }

    // Handle tool execution
    server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        const { name, arguments: args } = request.params;
        
        // Validate tool name
        const validTools = ['web-search', 'iask-search', 'monica-search', 'brave-search'];
        if (!validTools.includes(name)) {
          throw new Error(`Unknown tool: ${name}`);
        }

        // Route to the appropriate tool handler
        switch (name) {
          case 'web-search':
            return await searchToolHandler(args);

          case 'iask-search':
            return await iaskToolHandler(args);

          case 'monica-search':
            return await monicaToolHandler(args);

          case 'brave-search':
            return await braveToolHandler(args);

          default:
            throw new Error(`Tool not found: ${name}`);
        }
      } catch (error) {
        console.error(`Error handling ${request.params.name} tool call:`, error);
        
        // Return proper tool execution error format
        return {
          isError: true,
          content: [
            {
              type: 'text',
              text: `Error executing tool '${request.params.name}': ${error.message}`
            }
          ]
        };
      }
    });    // Display promotional message
    console.error('\n\x1b[36m╔════════════════════════════════════════════════════════════╗');
    console.error('║                                                            ║');
    console.error('║  \x1b[1m\x1b[31mDuckDuckGo & AI Search MCP\x1b[0m\x1b[36m by \x1b[1m\x1b[33m@OEvortex\x1b[0m\x1b[36m            ║');
    console.error('║                                                            ║');
    console.error('║  \x1b[0m👉 Subscribe to \x1b[1m\x1b[37myoutube.com/@OEvortex\x1b[0m\x1b[36m for more tools!  ║');
    console.error('║                                                            ║');
    console.error('╚════════════════════════════════════════════════════════════╝\x1b[0m\n');

    // Start the server with stdio transport
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('DuckDuckGo, IAsk AI, Monica & Brave AI Search MCP server started and listening on stdio');
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
DuckDuckGo, IAsk AI, Monica & Brave AI Search MCP - A Model Context Protocol server for web search

Usage:
  npx -y @oevortex/ddg_search@latest [options]

Options:
  -h, --help     Show this help message
  -v, --version  Show version information

This MCP server provides the following tools:
  - web-search: Search the web using DuckDuckGo
  - iask-search: Search using IAsk AI for AI-generated responses
  - monica-search: Search using Monica AI for AI-generated responses
  - brave-search: Search using Brave AI for AI-generated responses

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
        console.log(`DuckDuckGo & AI Search MCP v${packageJson.version}\nCreated by @OEvortex - Subscribe to youtube.com/@OEvortex!`);
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
