import { searchToolDefinition, searchToolHandler } from '../../src/tools/searchTool.js';
import { searchDuckDuckGo } from '../../src/utils/search.js';
import { jest } from '@jest/globals';

// Mock the search utility
jest.mock('../../src/utils/search.js', () => ({
  searchDuckDuckGo: jest.fn()
}));

describe('Tools: searchTool.js', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('searchToolDefinition', () => {
    test('should have correct tool name', () => {
      expect(searchToolDefinition.name).toBe('web-search');
    });

    test('should have correct tool title', () => {
      expect(searchToolDefinition.title).toBe('Web Search');
    });

    test('should have proper description', () => {
      expect(searchToolDefinition.description).toContain('DuckDuckGo');
      expect(searchToolDefinition.description).toContain('results');
    });

    test('should have correct input schema', () => {
      const schema = searchToolDefinition.inputSchema;
      expect(schema.type).toBe('object');
      expect(schema.properties.query).toBeDefined();
      expect(schema.properties.numResults).toBeDefined();
      expect(schema.properties.mode).toBeDefined();
      expect(schema.required).toContain('query');
    });

    test('should validate query parameter', () => {
      const schema = searchToolDefinition.inputSchema;
      expect(schema.properties.query.type).toBe('string');
      expect(schema.properties.query.description).toBeDefined();
    });

    test('should validate numResults parameter', () => {
      const schema = searchToolDefinition.inputSchema;
      const numResults = schema.properties.numResults;
      expect(numResults.type).toBe('integer');
      expect(numResults.default).toBe(3);
      expect(numResults.minimum).toBe(1);
      expect(numResults.maximum).toBe(20);
    });

    test('should validate mode parameter', () => {
      const schema = searchToolDefinition.inputSchema;
      const mode = schema.properties.mode;
      expect(mode.enum).toContain('short');
      expect(mode.enum).toContain('detailed');
      expect(mode.default).toBe('short');
    });
  });

  describe('searchToolHandler', () => {
    test('should handle valid parameters', async () => {
      const mockResults = [
        {
          title: 'Test Result',
          url: 'http://example.com',
          snippet: 'Test snippet',
          displayUrl: 'example.com'
        }
      ];

      searchDuckDuckGo.mockResolvedValue(mockResults);

      const params = {
        query: 'test query',
        numResults: 3,
        mode: 'short'
      };

      const result = await searchToolHandler(params);

      expect(result.content).toBeDefined();
      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toContain('Test Result');
    });

    test('should use default parameters when not provided', async () => {
      const mockResults = [];
      searchDuckDuckGo.mockResolvedValue(mockResults);

      const params = { query: 'test query' };

      const result = await searchToolHandler(params);

      expect(searchDuckDuckGo).toHaveBeenCalledWith('test query', 3, 'short');
      expect(result.content).toBeDefined();
    });

    test('should handle empty results', async () => {
      searchDuckDuckGo.mockResolvedValue([]);

      const params = { query: 'empty results query' };

      const result = await searchToolHandler(params);

      expect(result.content[0].text).toBe('No results found.');
    });

    test('should format detailed mode results', async () => {
      const mockResults = [
        {
          title: 'Detailed Result',
          url: 'http://example.com',
          snippet: 'Test snippet',
          displayUrl: 'example.com',
          description: 'Full content description'
        }
      ];

      searchDuckDuckGo.mockResolvedValue(mockResults);

      const params = {
        query: 'test query',
        mode: 'detailed'
      };

      const result = await searchToolHandler(params);

      expect(result.content[0].text).toContain('1. **Detailed Result**');
      expect(result.content[0].text).toContain('URL: http://example.com');
      expect(result.content[0].text).toContain('Content: Full content description');
    });

    test('should format short mode results', async () => {
      const mockResults = [
        {
          title: 'Short Result',
          url: 'http://example.com',
          snippet: 'Brief snippet',
          displayUrl: 'example.com'
        }
      ];

      searchDuckDuckGo.mockResolvedValue(mockResults);

      const params = {
        query: 'test query',
        mode: 'short'
      };

      const result = await searchToolHandler(params);

      expect(result.content[0].text).toContain('1. **Short Result**');
      expect(result.content[0].text).toContain('URL: http://example.com');
      expect(result.content[0].text).not.toContain('Content:');
    });

    test('should handle search errors gracefully', async () => {
      searchDuckDuckGo.mockRejectedValue(new Error('Search failed'));

      const params = { query: 'error query' };

      await expect(searchToolHandler(params))
        .rejects.toThrow('Search failed');
    });
  });
});