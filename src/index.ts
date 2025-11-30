import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

// Import tool definitions and handlers
import { searchToolDefinition, searchToolHandler } from './tools/searchTool.js';
import { iaskToolDefinition, iaskToolHandler } from './tools/iaskTool.js';

// Required: Export default createServer function for Smithery
export default function createServer({ config }: { config?: any } = {}) {
  console.log('Creating MCP server with latest SDK...');

  // Global variable to track available tools
  const availableTools = [
    searchToolDefinition,
    iaskToolDefinition
  ];
  
  console.log('Available tools:', availableTools.map(t => t.name));

  // Create the MCP server using the Server class
  const server = new Server({
    name: 'ddg-search-mcp',
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
    console.log('Tools list requested, returning:', availableTools.length, 'tools');
    return {
      tools: availableTools
    };
  });

  // Handle tool execution
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    try {
      const { name, arguments: args } = request.params;
      console.log(`Tool call received: ${name} with args:`, args);
      
      // Route to the appropriate tool handler
      switch (name) {
        case 'web-search':
          return await searchToolHandler(args);

        case 'iask-search':
          return await iaskToolHandler(args);

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

  console.log('MCP server created successfully');
  
  // Return the server instance (required for Smithery)
  return server;
}

// Optional: No configuration schema needed for this server
// export const configSchema = z.object({});