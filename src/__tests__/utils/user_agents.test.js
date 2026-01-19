import { getRandomUserAgent } from '../../src/utils/user_agents.js';
import { jest } from '@jest/globals';

describe('Utils: user_agents.js', () => {
  describe('getRandomUserAgent', () => {
    test('should return a valid user agent string', () => {
      const userAgent = getRandomUserAgent();
      expect(typeof userAgent).toBe('string');
      expect(userAgent.length).toBeGreaterThan(0);
    });

    test('should return user agent with expected format', () => {
      const userAgent = getRandomUserAgent();
      expect(userAgent).toMatch(/Mozilla|Chrome|Safari|Firefox|Edg/);
    });

    test('should consistently return user agents from the list', () => {
      const userAgents = [];
      for (let i = 0; i < 10; i++) {
        userAgents.push(getRandomUserAgent());
      }
      
      // Should get variety but all should be valid
      userAgents.forEach(ua => {
        expect(typeof ua).toBe('string');
        expect(ua.length).toBeGreaterThan(0);
      });
    });

    test('should not return undefined or null', () => {
      for (let i = 0; i < 20; i++) {
        const userAgent = getRandomUserAgent();
        expect(userAgent).not.toBeUndefined();
        expect(userAgent).not.toBeNull();
      }
    });
  });
});