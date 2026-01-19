import axios from 'axios';
import { randomBytes } from 'crypto';
import { getRandomUserAgent } from './user_agents.js';

const BASE_URL = 'https://search.brave.com/api/tap/v1';
const DEFAULT_TIMEOUT = 30000;

function generateKeyB64() {
  const key = randomBytes(32);
  const k = key.toString('base64url');
  const jwk = {
    alg: 'A256GCM',
    ext: true,
    k,
    key_ops: ['encrypt', 'decrypt'],
    kty: 'oct'
  };
  return Buffer.from(JSON.stringify(jwk)).toString('base64');
}

function buildHeaders() {
  return {
    accept: 'application/json',
    'accept-language': 'en-US,en;q=0.9',
    'user-agent': getRandomUserAgent(),
    'sec-ch-ua': '"Chromium";v="127", "Not)A;Brand";v="99"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-origin',
    referer: 'https://search.brave.com/ask'
  };
}

function parseStream(stream) {
  return new Promise((resolve, reject) => {
    let buffer = '';
    let text = '';

    stream.on('data', (chunk) => {
      buffer += chunk.toString();
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) {
          continue;
        }

        try {
          const payload = JSON.parse(trimmed);
          if (payload?.type === 'text_delta') {
            text += payload.delta ?? '';
          }
        } catch (error) {
          // Ignore malformed lines
        }
      }
    });

    stream.on('end', () => resolve(text));
    stream.on('error', (error) => reject(error));
  });
}

/**
 * Search using Brave AI Search.
 * @param {string} prompt - The search query.
 * @param {object} [options] - Search options.
 * @param {boolean} [options.enableResearch=false] - Enable deep research mode.
 * @param {number} [options.timeout=30000] - Request timeout in ms.
 * @param {string} [options.language='en'] - Language code.
 * @param {string} [options.country='US'] - Country code.
 * @param {string} [options.uiLang='en-us'] - UI language.
 * @param {string|null} [options.geoloc=null] - Geolocation coordinates.
 * @returns {Promise<string>} AI-generated response text.
 */
export async function searchBraveAI(
  prompt,
  {
    enableResearch = false,
    timeout = DEFAULT_TIMEOUT,
    language = 'en',
    country = 'US',
    uiLang = 'en-us',
    geoloc = null
  } = {}
) {
  if (!prompt || typeof prompt !== 'string') {
    throw new Error('Invalid prompt: must be a non-empty string');
  }

  if (prompt.length > 5000) {
    throw new Error('Invalid prompt: too long (maximum 5000 characters)');
  }

  const symmetricKey = generateKeyB64();
  const client = axios.create({
    timeout,
    headers: buildHeaders(),
    validateStatus: (status) => status >= 200 && status < 500
  });

  const newParams = {
    language,
    country,
    ui_lang: uiLang,
    symmetric_key: symmetricKey,
    source: enableResearch ? 'home' : 'llmSuggest',
    query: prompt,
    enable_research: enableResearch ? 'true' : 'false'
  };

  if (geoloc) {
    newParams.geoloc = geoloc;
  }

  try {
    const newResponse = await client.get(`${BASE_URL}/new`, { params: newParams });
    if (newResponse.status !== 200) {
      throw new Error(`Brave AI failed to initialize chat: HTTP ${newResponse.status}`);
    }

    const chatId = newResponse.data?.id;
    if (!chatId) {
      throw new Error('Brave AI failed to initialize chat: missing conversation id');
    }

    const streamParams = {
      id: chatId,
      query: prompt,
      symmetric_key: symmetricKey,
      language,
      country,
      ui_lang: uiLang,
      enable_research: enableResearch ? 'true' : 'false',
      enable_followups: enableResearch ? 'true' : 'false'
    };

    const referer = `https://search.brave.com/ask?q=${encodeURIComponent(prompt)}&conversation=${chatId}`;
    const streamResponse = await client.get(`${BASE_URL}/stream`, {
      params: streamParams,
      responseType: 'stream',
      headers: {
        referer
      }
    });

    if (streamResponse.status !== 200) {
      throw new Error(`Brave AI stream failed: HTTP ${streamResponse.status}`);
    }

    return await parseStream(streamResponse.data);
  } catch (error) {
    if (error.response?.status === 429) {
      throw new Error('Brave AI rate limit: too many requests');
    }

    if (error.code === 'ECONNABORTED') {
      throw new Error('Brave AI request timeout: took too long');
    }

    throw new Error(`Brave AI search failed for "${prompt}": ${error.message}`);
  }
}
