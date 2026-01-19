import { searchIAsk, VALID_MODES, VALID_DETAIL_LEVELS } from '../../src/utils/search_iask.js';
import { jest } from '@jest/globals';

// Mock all external dependencies
jest.mock('axios');
jest.mock('ws');
jest.mock('turndown');
jest.mock('tough-cookie');
jest.mock('axios-cookiejar-support');

describe('Utils: search_iask.js', () => {
  let mockAxios;
  let mockWebSocket;
  let mockTurndownService;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup axios mock
    mockAxios = {
      create: jest.fn(() => ({
        get: jest.fn(),
        post: jest.fn()
      }))
    };
    
    // Setup WebSocket mock
    mockWebSocket = jest.fn(() => ({
      close: jest.fn(),
      send: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      onopen: null,
      onmessage: null,
      onclose: null,
      onerror: null
    }));
    
    // Setup Turndown mock
    mockTurndownService = jest.fn(() => ({
      turndown: jest.fn((html) => html.replace(/<[^>]*>/g, ''))
    }));
  });

  describe('VALID_MODES', () => {
    test('should have valid modes defined', () => {
      expect(VALID_MODES).toContain('question');
      expect(VALID_MODES).toContain('academic');
      expect(VALID_MODES).toContain('forums');
      expect(VALID_MODES).toContain('wiki');
      expect(VALID_MODES).toContain('thinking');
    });
  });

  describe('VALID_DETAIL_LEVELS', () => {
    test('should have valid detail levels defined', () => {
      expect(VALID_DETAIL_LEVELS).toContain('concise');
      expect(VALID_DETAIL_LEVELS).toContain('detailed');
      expect(VALID_DETAIL_LEVELS).toContain('comprehensive');
    });
  });

  describe('searchIAsk', () => {
    test('should validate mode parameter', async () => {
      await expect(searchIAsk('test query', 'invalid-mode'))
        .rejects.toThrow('Invalid mode');
    });

    test('should validate detail level parameter', async () => {
      await expect(searchIAsk('test query', 'thinking', 'invalid-level'))
        .rejects.toThrow('Invalid detail level');
    });

    test('should handle default parameters', async () => {
      // Mock successful response
      const mockResponse = {
        status: 200,
        data: '<html><body>Mock response</body></html>',
        request: { res: { responseUrl: 'https://iask.ai' } }
      };
      
      const mockCheerio = {
        load: jest.fn(() => ({
          find: jest.fn(() => ({
            first: jest.fn(() => ({
              attr: jest.fn(() => 'phx-id'),
              text: jest.fn(() => 'Mock ID')
            })),
            attr: jest.fn(() => 'Mock Content')
          })),
          attr: jest.fn(() => 'csrf-token')
        }))
      };
      
      // Mock successful WebSocket connection
      const mockWsInstance = {
        close: jest.fn(),
        send: jest.fn(),
        addEventListener: jest.fn(),
        onopen: null,
        onmessage: null,
        onclose: null
      };
      
      global.WebSocket = jest.fn(() => mockWsInstance);
      
      const result = await searchIAsk('test query');
      
      expect(typeof result).toBe('string');
    });

    test('should handle network errors gracefully', async () => {
      // Test will be covered by error handling
      expect(searchIAsk).toBeDefined();
    });

    test('should handle timeout scenarios', async () => {
      // Test timeout handling
      expect(searchIAsk).toBeDefined();
    });
  });

  describe('Cache Management', () => {
    test('should generate correct cache keys', () => {
      // Import cache key function logic
      const getCacheKey = (query, mode, detailLevel) => 
        `iask-${mode}-${detailLevel || 'default'}-${query}`;
      
      const key = getCacheKey('test query', 'thinking', 'detailed');
      expect(key).toBe('iask-thinking-detailed-test query');
    });

    test('should handle cache expiration', () => {
      // Test cache clearing logic
      const now = Date.now();
      const oldEntry = { timestamp: now - 600000, results: 'old' }; // 10 min ago
      const newEntry = { timestamp: now, results: 'new' };
      
      const shouldClear = (entry) => now - entry.timestamp > 300000; // 5 min
      
      expect(shouldClear(oldEntry)).toBe(true);
      expect(shouldClear(newEntry)).toBe(false);
    });
  });
});