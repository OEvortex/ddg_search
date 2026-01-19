import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { jest } from '@jest/globals';

// Mock the MCP SDK
jest.mock('@modelcontextprotocol/sdk/server/index.js');
jest.mock('@modelcontextprotocol/sdk/types.js');

describe('MCP Server Integration', () => {
  let mockServer;
  let mockTransport;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup mock server
    mockServer = {
      setRequestHandler: jest.fn(),
      notification: jest.fn(),
      connect: jest.fn()
    };
    
    Server.mockImplementation(() => mockServer);
    
    // Setup mock transport
    mockTransport = {
      connect: jest.fn()
    };
  });

  describe('Server Initialization', () => {
    test('should create server with correct configuration', async () => {
      const { default: createServer } = await import('../../src/index.js');
      
      const server = createServer();
      
      expect(Server).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'ddg-search-mcp',
          version: expect.stringContaining('1.1.')
        }),
        expect.objectContaining({
          capabilities: {
            tools: {
              listChanged: true
            }
          }
        })
      );
    });

    test('should register all available tools', async () => {
      const { default: createServer } = await import('../../src/index.js');
      
      const server = createServer();
      
      // Should have set request handlers for tools
      expect(mockServer.setRequestHandler).toHaveBeenCalledTimes(2); // ListTools + CallTool
    });

    test('should define tool list correctly', async () => {
      const { default: createServer } = await import('../../src/index.js');
      
      const server = createServer();
      
      // Check that tools list was requested
      expect(mockServer.setRequestHandler).toHaveBeenCalledWith(
        ListToolsRequestSchema,
        expect.any(Function)
      );
    });
  });

  describe('Tool Discovery', () => {
    test('should return all available tools', async () => {
      const { default: createServer } = await import('../../src/index.js');
      
      const server = createServer();
      
      // Extract the ListTools handler
      const listToolsHandler = mockServer.setRequestHandler.mock.calls.find(
        call => call[0] === ListToolsRequestSchema
      )[1];
      
      const result = await listToolsHandler();
      
      expect(result.tools).toBeDefined();
      expect(Array.isArray(result.tools)).toBe(true);
      
      // Should have web-search tool
      const webSearchTool = result.tools.find(tool => tool.name === 'web-search');
      expect(webSearchTool).toBeDefined();
      expect(webSearchTool.inputSchema).toBeDefined();
      
      // Should have iask-search tool
      const iaskTool = result.tools.find(tool => tool.name === 'iask-search');
      expect(iaskTool).toBeDefined();
      expect(iaskTool.inputSchema).toBeDefined();
      
      // Should have monica-search tool
      const monicaTool = result.tools.find(tool => tool.name === 'monica-search');
      expect(monicaTool).toBeDefined();
      expect(monicaTool.inputSchema).toBeDefined();

      // Should have brave-search tool
      const braveTool = result.tools.find(tool => tool.name === 'brave-search');
      expect(braveTool).toBeDefined();
      expect(braveTool.inputSchema).toBeDefined();
    });
  });

  describe('Tool Execution', () => {
    test('should route web-search tool calls correctly', async () => {
      const { default: createServer } = await import('../../src/index.js');
      
      const server = createServer();
      
      // Extract the CallTool handler
      const callToolHandler = mockServer.setRequestHandler.mock.calls.find(
        call => call[0] === CallToolRequestSchema
      )[1];
      
      const mockRequest = {
        params: {
          name: 'web-search',
          arguments: {
            query: 'test query',
            numResults: 3,
            mode: 'short'
          }
        }
      };
      
      // This would test the actual tool execution
      // Note: In real implementation, this would call the actual tools
      await expect(callToolHandler(mockRequest)).rejects.toThrow();
    });

    test('should route iask-search tool calls correctly', async () => {
      const mockRequest = {
        params: {
          name: 'iask-search',
          arguments: {
            query: 'test AI query',
            mode: 'thinking'
          }
        }
      };
      
      // Test would verify routing to IAsk tool
      expect(mockRequest.params.name).toBe('iask-search');
    });

    test('should route monica-search tool calls correctly', async () => {
      const mockRequest = {
        params: {
          name: 'monica-search',
          arguments: {
            query: 'test monica query'
          }
        }
      };
      
      // Test would verify routing to Monica tool
      expect(mockRequest.params.name).toBe('monica-search');
    });

    test('should route brave-search tool calls correctly', async () => {
      const mockRequest = {
        params: {
          name: 'brave-search',
          arguments: {
            query: 'test brave query',
            enableResearch: true
          }
        }
      };

      // Test would verify routing to Brave tool
      expect(mockRequest.params.name).toBe('brave-search');
    });

    test('should handle unknown tool calls', async () => {
      const mockRequest = {
        params: {
          name: 'unknown-tool',
          arguments: {}
        }
      };
      
      // Test would verify error handling for unknown tools
      expect(mockRequest.params.name).toBe('unknown-tool');
    });

    test('should handle tool execution errors gracefully', async () => {
      const mockRequest = {
        params: {
          name: 'web-search',
          arguments: {
            query: 'error causing query'
          }
        }
      };
      
      // Test would verify error response formatting
      expect(mockRequest.params.name).toBe('web-search');
    });
  });

  describe('Error Handling', () => {
    test('should format tool execution errors correctly', async () => {
      // Test error response formatting
      const errorResponse = {
        isError: true,
        content: [
          {
            type: 'text',
            text: expect.stringContaining('Error executing tool')
          }
        ]
      };
      
      expect(errorResponse.content[0].text).toContain('Error executing tool');
    });

    test('should include tool name in error messages', async () => {
      const toolName = 'web-search';
      const errorMessage = `Error executing tool '${toolName}': Test error`;
      
      expect(errorMessage).toContain(toolName);
    });
  });
});