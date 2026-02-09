// Global test setup
import { jest } from '@jest/globals';

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn()
};

// Increase test timeout for integration tests
jest.setTimeout(30000);

// Global test utilities
global.mockDelay = (ms = 100) => new Promise(resolve => setTimeout(resolve, ms));

// Mock WebSocket class
global.WebSocket = jest.fn().mockImplementation(() => ({
  close: jest.fn(),
  send: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn()
}));

// Mock axios
const mockAxios = jest.fn(() => Promise.resolve({
  status: 200,
  data: '<html><body>Mock Response</body></html>',
  config: { url: 'http://example.com' },
  request: { res: { responseUrl: 'http://example.com' } }
}));

mockAxios.get = jest.fn();
mockAxios.post = jest.fn();

jest.mock('axios', () => mockAxios);

// Mock external modules
jest.mock('cheerio', () => ({
  load: jest.fn(() => ({
    find: jest.fn(() => ({
      each: jest.fn(),
      text: jest.fn(() => 'Mock Title'),
      attr: jest.fn(() => 'http://example.com')
    })),
    html: jest.fn(() => '<div>Mock Content</div>'),
    text: jest.fn(() => 'Mock Text Content')
  }))
}));

jest.mock('ws', () => jest.fn());

jest.mock('turndown', () => jest.fn(() => ({
  turndown: jest.fn((html) => html.replace(/<[^>]*>/g, ''))
})));

jest.mock('tough-cookie', () => ({
  CookieJar: jest.fn(() => ({
    getCookies: jest.fn(() => []),
    setCookie: jest.fn()
  }))
}));

jest.mock('axios-cookiejar-support', () => ({
  wrapper: jest.fn((axios) => axios)
}));

jest.mock('crypto', () => ({
  randomUUID: jest.fn(() => 'mock-uuid-12345')
}));