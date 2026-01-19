import { braveToolDefinition, braveToolHandler } from '../../src/tools/braveTool.js';
import { searchBraveAI } from '../../src/utils/search_brave_ai.js';
import { jest } from '@jest/globals';

jest.mock('../../src/utils/search_brave_ai.js', () => ({
  searchBraveAI: jest.fn()
}));

describe('Tools: braveTool.js', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('braveToolDefinition', () => {
    test('should have correct tool name', () => {
      expect(braveToolDefinition.name).toBe('brave-search');
    });

    test('should have correct tool title', () => {
      expect(braveToolDefinition.title).toBe('Brave AI Search');
    });

    test('should have proper description', () => {
      expect(braveToolDefinition.description).toContain('Brave');
      expect(braveToolDefinition.description).toContain('AI-generated');
    });

    test('should have correct input schema', () => {
      const schema = braveToolDefinition.inputSchema;
      expect(schema.type).toBe('object');
      expect(schema.properties.query).toBeDefined();
      expect(schema.properties.enableResearch).toBeDefined();
      expect(schema.required).toContain('query');
    });

    test('should have proper annotations', () => {
      expect(braveToolDefinition.annotations.readOnlyHint).toBe(true);
      expect(braveToolDefinition.annotations.openWorldHint).toBe(false);
    });
  });

  describe('braveToolHandler', () => {
    test('should handle valid query parameters', async () => {
      searchBraveAI.mockResolvedValue('Mock Brave AI response');

      const params = { query: 'Latest AI trends' };

      const result = await braveToolHandler(params);

      expect(searchBraveAI).toHaveBeenCalledWith('Latest AI trends', { enableResearch: false });
      expect(result.content).toBeDefined();
      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toBe('Mock Brave AI response');
    });

    test('should handle research mode', async () => {
      searchBraveAI.mockResolvedValue('Deep research response');

      const params = { query: 'AI safety research', enableResearch: true };

      const result = await braveToolHandler(params);

      expect(searchBraveAI).toHaveBeenCalledWith('AI safety research', { enableResearch: true });
      expect(result.content[0].text).toBe('Deep research response');
    });

    test('should handle empty results gracefully', async () => {
      searchBraveAI.mockResolvedValue('');

      const params = { query: 'Non-existent topic' };

      const result = await braveToolHandler(params);

      expect(result.content[0].text).toBe('No results found.');
    });

    test('should handle search errors gracefully', async () => {
      searchBraveAI.mockRejectedValue(new Error('Brave API error'));

      const params = { query: 'Error causing query' };

      const result = await braveToolHandler(params);

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Brave API error');
    });
  });
});
