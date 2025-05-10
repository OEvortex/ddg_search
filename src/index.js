import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

// Import tool definitions and handlers
import { searchToolDefinition, searchToolHandler } from './tools/searchTool.js';
import { fetchUrlToolDefinition, fetchUrlToolHandler } from './tools/fetchUrlTool.js';
import { metadataToolDefinition, metadataToolHandler } from './tools/metadataTool.js';
import { feloToolDefinition, feloToolHandler } from './tools/feloTool.js';

// Create the MCP server
const server = new Server({
  id: 'websearch-mcp',
  name: 'WebSearch MCP',
  description: 'A Model Context Protocol server for web search using DuckDuckGo and Felo AI',
  version: '1.1.0'
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
});

// Start the server with stdio transport
async function main() {
  try {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('WebSearch MCP server started and listening on stdio');
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

main();
