import { getCacheKey, clearOldCache, extractDirectUrl, getFaviconUrl, getJinaAiUrl } from '../../src/utils/search.js';
import { jest } from '@jest/globals';

describe('Utils: search.js', () => {
  let originalCache;
  
  beforeEach(() => {
    // Clear any existing cache
    jest.clearAllMocks();
  });

  describe('getCacheKey', () => {
    test('should generate consistent cache keys', () => {
      const query = 'test query';
      const key1 = getCacheKey(query);
      const key2 = getCacheKey(query);
      expect(key1).toBe(key2);
    });

    test('should handle empty queries', () => {
      const key = getCacheKey('');
      expect(key).toBe('');
    });
  });

  describe('clearOldCache', () => {
    test('should clear old entries only', () => {
      // Mock the global cache
      const mockCache = new Map([
        ['key1', { timestamp: Date.now() - 600000, results: 'old' }], // 10 min old
        ['key2', { timestamp: Date.now() - 120000, results: 'recent' }], // 2 min old
        ['key3', { timestamp: Date.now() - 30000, results: 'new' }] // 30 sec old
      ]);
      
      // Mock global cache
      global.resultsCache = mockCache;
      
      clearOldCache();
      
      // Should only clear entries older than 5 minutes (300000 ms)
      expect(mockCache.size).toBe(2);
      expect(mockCache.has('key1')).toBe(false);
      expect(mockCache.has('key2')).toBe(true);
      expect(mockCache.has('key3')).toBe(true);
    });
  });

  describe('extractDirectUrl', () => {
    test('should handle DuckDuckGo redirect URLs', () => {
      const ddgUrl = 'https://duckduckgo.com/l/?uddg=test&url=http://example.com';
      const directUrl = extractDirectUrl(ddgUrl);
      expect(directUrl).toBe('http://example.com');
    });

    test('should handle relative URLs', () => {
      const relativeUrl = '/l/?uddg=http://example.com';
      const directUrl = extractDirectUrl(relativeUrl);
      expect(directUrl).toContain('http://example.com');
    });

    test('should handle ad redirects', () => {
      const adUrl = 'https://duckduckgo.com/y.js?u3=http://example.com';
      const directUrl = extractDirectUrl(adUrl);
      expect(directUrl).toBe('http://example.com');
    });

    test('should handle regular URLs unchanged', () => {
      const regularUrl = 'http://example.com/page';
      const directUrl = extractDirectUrl(regularUrl);
      expect(directUrl).toBe(regularUrl);
    });

    test('should handle malformed URLs gracefully', () => {
      const malformedUrl = 'not-a-url';
      const directUrl = extractDirectUrl(malformedUrl);
      expect(directUrl).toBe(malformedUrl);
    });

    test('should extract URLs from malformed strings', () => {
      const stringWithUrl = 'Visit http://example.com for info';
      const directUrl = extractDirectUrl(stringWithUrl);
      expect(directUrl).toBe('http://example.com');
    });
  });

  describe('getFaviconUrl', () => {
    test('should generate correct favicon URLs', () => {
      const url = 'https://example.com/page';
      const favicon = getFaviconUrl(url);
      expect(favicon).toBe('https://www.google.com/s2/favicons?domain=example.com&sz=32');
    });

    test('should handle URLs without protocol', () => {
      const url = 'example.com/page';
      const favicon = getFaviconUrl(url);
      expect(favicon).toContain('example.com');
    });

    test('should handle invalid URLs gracefully', () => {
      const url = 'invalid-url';
      const favicon = getFaviconUrl(url);
      expect(favicon).toBe('');
    });
  });

  describe('getJinaAiUrl', () => {
    test('should generate correct Jina AI URLs', () => {
      const url = 'https://example.com/page';
      const jinaUrl = getJinaAiUrl(url);
      expect(jinaUrl).toBe('https://r.jina.ai/https://example.com/page');
    });

    test('should handle URLs without protocol', () => {
      const url = 'example.com/page';
      const jinaUrl = getJinaAiUrl(url);
      expect(jinaUrl).toContain('r.jina.ai');
    });

    test('should handle invalid URLs gracefully', () => {
      const url = 'invalid-url';
      const jinaUrl = getJinaAiUrl(url);
      expect(jinaUrl).toBe('');
    });
  });
});