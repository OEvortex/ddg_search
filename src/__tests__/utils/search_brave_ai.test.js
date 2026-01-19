import { searchBraveAI } from '../../src/utils/search_brave_ai.js';
import { jest } from '@jest/globals';

jest.mock('axios', () => ({
  default: {
    create: jest.fn()
  }
}));

describe('Utils: search_brave_ai.js', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should validate prompt input', async () => {
    await expect(searchBraveAI('')).rejects.toThrow('Invalid prompt');
  });

  test('should handle basic search query', async () => {
    const mockStream = {
      on: jest.fn((event, handler) => {
        if (event === 'data') {
          handler('{"type":"text_delta","delta":"Hello"}\n');
          handler('{"type":"text_delta","delta":" world"}\n');
        }
        if (event === 'end') {
          handler();
        }
      })
    };

    const axios = (await import('axios')).default;
    axios.create.mockReturnValue({
      get: jest.fn((url) => {
        if (url.includes('/new')) {
          return Promise.resolve({ status: 200, data: { id: 'chat-id' } });
        }
        return Promise.resolve({ status: 200, data: mockStream });
      })
    });

    const result = await searchBraveAI('test query');
    expect(result).toBe('Hello world');
  });

  test('should surface request errors', async () => {
    const axios = (await import('axios')).default;
    axios.create.mockReturnValue({
      get: jest.fn(() => Promise.reject(new Error('Network error')))
    });

    await expect(searchBraveAI('test query')).rejects.toThrow('Network error');
  });
});
