import { iaskToolDefinition, iaskToolHandler } from '../../src/tools/iaskTool.js';
import { searchIAsk, VALID_MODES, VALID_DETAIL_LEVELS } from '../../src/utils/search_iask.js';
import { jest } from '@jest/globals';

// Mock the search utility
jest.mock('../../src/utils/search_iask.js', () => ({
  searchIAsk: jest.fn(),
  VALID_MODES: ['question', 'academic', 'forums', 'wiki', 'thinking'],
  VALID_DETAIL_LEVELS: ['concise', 'detailed', 'comprehensive']
}));

describe('Tools: iaskTool.js', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('iaskToolDefinition', () => {
    test('should have correct tool name', () => {
      expect(iaskToolDefinition.name).toBe('iask-search');
    });

    test('should have correct tool title', () => {
      expect(iaskToolDefinition.title).toBe('IAsk AI Search');
    });

    test('should have proper description', () => {
      expect(iaskToolDefinition.description).toContain('IAsk.ai');
      expect(iaskToolDefinition.description).toContain('AI-generated responses');
    });

    test('should have correct input schema', () => {
      const schema = iaskToolDefinition.inputSchema;
      expect(schema.type).toBe('object');
      expect(schema.properties.query).toBeDefined();
      expect(schema.properties.mode).toBeDefined();
      expect(schema.properties.detailLevel).toBeDefined();
      expect(schema.required).toContain('query');
    });

    test('should validate query parameter', () => {
      const schema = iaskToolDefinition.inputSchema;
      expect(schema.properties.query.type).toBe('string');
    });

    test('should validate mode parameter with enums', () => {
      const schema = iaskToolDefinition.inputSchema;
      const mode = schema.properties.mode;
      expect(mode.enum).toContain('question');
      expect(mode.enum).toContain('academic');
      expect(mode.enum).toContain('forums');
      expect(mode.enum).toContain('wiki');
      expect(mode.enum).toContain('thinking');
      expect(mode.default).toBe('question');
    });

    test('should validate detail level parameter', () => {
      const schema = iaskToolDefinition.inputSchema;
      const detailLevel = schema.properties.detailLevel;
      expect(detailLevel.enum).toContain('concise');
      expect(detailLevel.enum).toContain('detailed');
      expect(detailLevel.enum).toContain('comprehensive');
    });

    test('should have proper annotations', () => {
      expect(iaskToolDefinition.annotations.readOnlyHint).toBe(true);
      expect(iaskToolDefinition.annotations.openWorldHint).toBe(false);
    });
  });

  describe('iaskToolHandler', () => {
    test('should handle valid parameters with defaults', async () => {
      searchIAsk.mockResolvedValue('Mock AI response');

      const params = { query: 'What is AI?' };

      const result = await iaskToolHandler(params);

      expect(searchIAsk).toHaveBeenCalledWith('What is AI?', 'thinking', null);
      expect(result.content).toBeDefined();
      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toBe('Mock AI response');
    });

    test('should handle custom mode and detail level', async () => {
      searchIAsk.mockResolvedValue('Detailed academic response');

      const params = {
        query: 'Explain quantum computing',
        mode: 'academic',
        detailLevel: 'comprehensive'
      };

      const result = await iaskToolHandler(params);

      expect(searchIAsk).toHaveBeenCalledWith(
        'Explain quantum computing',
        'academic',
        'comprehensive'
      );
      expect(result.content[0].text).toBe('Detailed academic response');
    });

    test('should handle empty results', async () => {
      searchIAsk.mockResolvedValue('');

      const params = { query: 'Non-existent query' };

      const result = await iaskToolHandler(params);

      expect(result.content[0].text).toBe('No results found.');
    });

    test('should handle search errors gracefully', async () => {
      searchIAsk.mockRejectedValue(new Error('Network timeout'));

      const params = { query: 'Error causing query' };

      await expect(iaskToolHandler(params))
        .rejects.toThrow('Network timeout');
    });

    test('should handle all valid modes', async () => {
      searchIAsk.mockResolvedValue('Mode specific response');

      const modes = ['question', 'academic', 'forums', 'wiki', 'thinking'];
      
      for (const mode of modes) {
        const params = { query: `Test ${mode} mode`, mode };
        const result = await iaskToolHandler(params);
        
        expect(searchIAsk).toHaveBeenCalledWith(
          expect.any(String),
          mode,
          expect.anything()
        );
      }
    });

    test('should handle all valid detail levels', async () => {
      searchIAsk.mockResolvedValue('Detail specific response');

      const detailLevels = ['concise', 'detailed', 'comprehensive'];
      
      for (const detailLevel of detailLevels) {
        const params = { 
          query: `Test ${detailLevel} level`, 
          detailLevel 
        };
        const result = await iaskToolHandler(params);
        
        expect(searchIAsk).toHaveBeenCalledWith(
          expect.any(String),
          expect.any(String),
          detailLevel
        );
      }
    });
  });
});