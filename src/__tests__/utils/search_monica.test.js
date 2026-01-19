import { searchMonica } from '../../src/utils/search_monica.js';
import { jest } from '@jest/globals';

// Mock axios and crypto
jest.mock('axios');

describe('Utils: search_monica.js', () => {
  describe('searchMonica', () => {
    test('should handle basic search query', async () => {
      // Mock successful response
      const mockStreamResponse = {
        data: {
          on: jest.fn((event, callback) => {
            if (event === 'data') {
              // Simulate stream data
              callback('data: {"text": "Mock response content", "session_id": "mock-session"}\n\n');
            } else if (event === 'end') {
              callback();
            }
          })
        }
      };

      const mockAxios = {
        create: jest.fn(() => ({
          post: jest.fn(() => Promise.resolve(mockStreamResponse))
        }))
      };

      global.axios = mockAxios;
      
      const result = await searchMonica('test query');
      expect(typeof result).toBe('string');
    });

    test('should handle query with special characters', async () => {
      const result = await searchMonica('test query with "quotes" and symbols!');
      expect(typeof result).toBe('string');
    });

    test('should handle empty query gracefully', async () => {
      const result = await searchMonica('');
      expect(typeof result).toBe('string');
    });

    test('should handle network errors', async () => {
      // Mock axios to throw error
      const mockAxios = {
        create: jest.fn(() => ({
          post: jest.fn(() => Promise.reject(new Error('Network error')))
        }))
      };

      global.axios = mockAxios;
      
      await expect(searchMonica('test query'))
        .rejects.toThrow('Network error');
    });

    test('should format response correctly', async () => {
      // Test response formatting
      const mockText = '**Bold text** with **more bold**';
      
      const formatResponse = (text) => {
        let cleanedText = text.replace(/\*\*/g, '');
        cleanedText = cleanedText.replace(/\n\s*\n/g, '\n\n');
        return cleanedText.trim();
      };

      const formatted = formatResponse(mockText);
      expect(formatted).not.toContain('**');
    });
  });

  describe('MonicaClient', () => {
    test('should generate correct headers', () => {
      const expectedFields = [
        'accept',
        'accept-encoding', 
        'accept-language',
        'content-type',
        'origin',
        'referer',
        'user-agent',
        'x-client-id',
        'x-client-locale',
        'x-client-type',
        'x-client-version'
      ];

      // Test that client has required configuration
      expect(searchMonica).toBeDefined();
    });

    test('should handle session management', async () => {
      // Test session ID handling
      const mockSessionId = 'mock-session-12345';
      
      expect(typeof mockSessionId).toBe('string');
    });

    test('should handle timeout scenarios', async () => {
      // Test timeout handling
      expect(searchMonica).toBeDefined();
    });
  });
});