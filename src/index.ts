import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

// Import tool definitions and handlers
import { searchToolDefinition, searchToolHandler } from './tools/searchTool.js';
import { fetchUrlToolDefinition, fetchUrlToolHandler } from './tools/fetchUrlTool.js';
import { metadataToolDefinition, metadataToolHandler } from './tools/metadataTool.js';
import { feloToolDefinition, feloToolHandler } from './tools/feloTool.js';

// Global variable to track available tools
let availableTools = [
  searchToolDefinition,
  fetchUrlToolDefinition,
  metadataToolDefinition,
  feloToolDefinition
];

// Required: Export default createServer function for Smithery
export default function createServer({ config }: { config?: any }) {
  // Create the MCP server
  const server = new Server({
    id: 'ddg-search-mcp',
    name: 'DuckDuckGo & Felo AI Search MCP',
    description: 'A Model Context Protocol server for web search using DuckDuckGo and Felo AI',
    version: '1.1.2'
  }, {
    capabilities: {
      tools: {
        listChanged: true
      }
    }
  });

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
      const validTools = ['web-search', 'fetch-url', 'url-metadata', 'felo-search'];
      if (!validTools.includes(name)) {
        throw new Error(`Unknown tool: ${name}`);
      }
        
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
    } catch (error: any) {
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
  });

  // Return the server object (required for Smithery)
  return server;
}

// Optional: No configuration schema needed for this server
// export const configSchema = z.object({});