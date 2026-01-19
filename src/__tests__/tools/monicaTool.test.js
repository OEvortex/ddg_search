import { monicaToolDefinition, monicaToolHandler } from '../../src/tools/monicaTool.js';
import { searchMonica } from '../../src/utils/search_monica.js';
import { jest } from '@jest/globals';

// Mock the search utility
jest.mock('../../src/utils/search_monica.js', () => ({
  searchMonica: jest.fn()
}));

describe('Tools: monicaTool.js', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('monicaToolDefinition', () => {
    test('should have correct tool name', () => {
      expect(monicaToolDefinition.name).toBe('monica-search');
    });

    test('should have correct tool title', () => {
      expect(monicaToolDefinition.title).toBe('Monica AI Search');
    });

    test('should have proper description', () => {
      expect(monicaToolDefinition.description).toContain('Monica AI');
      expect(monicaToolDefinition.description).toContain('AI-generated responses');
    });

    test('should have correct input schema', () => {
      const schema = monicaToolDefinition.inputSchema;
      expect(schema.type).toBe('object');
      expect(schema.properties.query).toBeDefined();
      expect(schema.required).toContain('query');
    });

    test('should validate query parameter', () => {
      const schema = monicaToolDefinition.inputSchema;
      expect(schema.properties.query.type).toBe('string');
      expect(schema.properties.query.description).toBeDefined();
    });

    test('should have proper annotations', () => {
      expect(monicaToolDefinition.annotations.readOnlyHint).toBe(true);
      expect(monicaToolDefinition.annotations.openWorldHint).toBe(false);
    });
  });

  describe('monicaToolHandler', () => {
    test('should handle valid query parameters', async () => {
      searchMonica.mockResolvedValue('Mock Monica AI response');

      const params = { query: 'Latest AI trends' };

      const result = await monicaToolHandler(params);

      expect(searchMonica).toHaveBeenCalledWith('Latest AI trends');
      expect(result.content).toBeDefined();
      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toBe('Mock Monica AI response');
    });

    test('should handle empty results gracefully', async () => {
      searchMonica.mockResolvedValue('');

      const params = { query: 'Non-existent topic' };

      const result = await monicaToolHandler(params);

      expect(result.content[0].text).toBe('No results found.');
    });

    test('should handle search errors gracefully', async () => {
      searchMonica.mockRejectedValue(new Error('Monica API error'));

      const params = { query: 'Error causing query' };

      await expect(monicaToolHandler(params))
        .rejects.toThrow('Monica API error');
    });

    test('should handle queries with special characters', async () => {
      searchMonica.mockResolvedValue('Response with special chars');

      const params = { query: 'AI & ML "deep learning"?' };

      const result = await monicaToolHandler(params);

      expect(searchMonica).toHaveBeenCalledWith('AI & ML "deep learning"?');
      expect(result.content).toBeDefined();
    });

    test('should handle very long queries', async () => {
      const longQuery = 'A'.repeat(1000);
      searchMonica.mockResolvedValue('Response to long query');

      const params = { query: longQuery };

      const result = await monicaToolHandler(params);

      expect(searchMonica).toHaveBeenCalledWith(longQuery);
      expect(result.content).toBeDefined();
    });

    test('should handle empty query parameters', async () => {
      searchMonica.mockResolvedValue('Response to empty query');

      const params = { query: '' };

      const result = await monicaToolHandler(params);

      expect(searchMonica).toHaveBeenCalledWith('');
      expect(result.content).toBeDefined();
    });
  });
});