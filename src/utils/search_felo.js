import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import https from 'https';

// Rotating User Agents
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Edge/120.0.0.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2.1 Safari/605.1.15',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:122.0) Gecko/20100101 Firefox/122.0',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
];

// Cache results to avoid repeated requests
const resultsCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// HTTPS agent configuration to handle certificate chain issues
const httpsAgent = new https.Agent({
  rejectUnauthorized: true, // Keep security enabled
  keepAlive: true,
  timeout: 30000,
  // Provide fallback for certificate issues while maintaining security
  secureProtocol: 'TLSv1_2_method'
});

/**
 * Response class for Felo API responses
 */
class Response {
  /**
   * Create a new Response
   * @param {string} text - The text content of the response
   */
  constructor(text) {
    this.text = text;
  }

  /**
   * String representation of the response
   * @returns {string} The text content
   */
  toString() {
    return this.text;
  }
}

/**
 * Get a random user agent from the list
 * @returns {string} A random user agent string
 */
function getRandomUserAgent() {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

/**
 * Generate a cache key for a search query
 * @param {string} query - The search query
 * @returns {string} The cache key
 */
function getCacheKey(query) {
  return `felo-${query}`;
}

/**
 * Clear old entries from the cache
 */
function clearOldCache() {
  const now = Date.now();
  for (const [key, value] of resultsCache.entries()) {
    if (now - value.timestamp > CACHE_DURATION) {
      resultsCache.delete(key);
    }
  }
}

/**
 * Search using the Felo AI API
 * @param {string} prompt - The search query or prompt
 * @param {boolean} stream - If true, yields response chunks as they arrive
 * @param {boolean} raw - If true, returns raw response dictionaries
 * @returns {Promise<string|AsyncGenerator<string>>} The search results
 */
async function searchFelo(prompt, stream = false, raw = false) {
  // Clear old cache entries
  clearOldCache();

  // Check cache first if not streaming
  if (!stream) {
    const cacheKey = getCacheKey(prompt);
    const cachedResults = resultsCache.get(cacheKey);

    if (cachedResults && Date.now() - cachedResults.timestamp < CACHE_DURATION) {
      return cachedResults.results;
    }
  }

  // Create payload for Felo API
  const payload = {
    query: prompt,
    search_uuid: uuidv4(),
    lang: "",
    agent_lang: "en",
    search_options: {
      langcode: "en-US"
    },
    search_video: true,
    contexts_from: "google"
  };

  // Get a random user agent
  const userAgent = getRandomUserAgent();

  // Headers for the request
  const headers = {
    'accept': '*/*',
    'accept-encoding': 'gzip, deflate, br',
    'accept-language': 'en-US,en;q=0.9',
    'content-type': 'application/json',
    'cookie': '_clck=1gifk45%7C2%7Cfoa%7C0%7C1686; _clsk=1g5lv07%7C1723558310439%7C1%7C1%7Cu.clarity.ms%2Fcollect; _ga=GA1.1.877307181.1723558313; _ga_8SZPRV97HV=GS1.1.1723558313.1.1.1723558341.0.0.0; _ga_Q9Q1E734CC=GS1.1.1723558313.1.1.1723558341.0.0.0',
    'dnt': '1',
    'origin': 'https://felo.ai',
    'referer': 'https://felo.ai/',
    'sec-ch-ua': '"Not)A;Brand";v="99", "Microsoft Edge";v="127", "Chromium";v="127"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-site',
    'user-agent': userAgent
  };

  // Define the streaming function
  async function* streamFunction() {
    try {
      const response = await axios.post('https://api.felo.ai/search/threads', payload, {
        headers,
        timeout: 30000, // 30 second timeout
        responseType: 'stream',
        httpsAgent: httpsAgent
      });

      let streamingText = '';
      let buffer = '';

      // Process the stream as it comes in
      for await (const chunk of response.data) {
        buffer += chunk.toString();
        
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep the last (potentially incomplete) line in the buffer
        
        for (const line of lines) {
          if (line.startsWith('data:')) {
            try {
              const data = JSON.parse(line.substring(5).trim());
              if (data.type === 'answer' && 'text' in data.data) {
                const newText = data.data.text;
                if (newText.length > streamingText.length) {
                  const delta = newText.substring(streamingText.length);
                  streamingText = newText;
                  
                  if (raw) {
                    yield { text: delta };
                  } else {
                    yield new Response(delta).toString();
                  }
                }
              }
            } catch (error) {
              // Ignore JSON parse errors and continue
            }
          }
        }
      }
      
      // Cache the complete response
      if (streamingText) {
        resultsCache.set(getCacheKey(prompt), {
          results: streamingText,
          timestamp: Date.now()
        });
      }
      
    } catch (error) {
      console.error('Error searching Felo:', error.message);
      throw new Error(`Failed to search Felo: ${error.message}`);
    }
  }

  // If streaming is requested, return the generator
  if (stream) {
    return streamFunction();
  }
  
  // For non-streaming, collect all chunks and return as a single string
  let fullResponse = '';
  
  try {
    for await (const chunk of streamFunction()) {
      if (raw) {
        fullResponse += chunk.text;
      } else {
        fullResponse += chunk;
      }
    }
    
    return fullResponse;
  } catch (error) {
    console.error('Error in non-streaming Felo search:', error.message);
    throw error;
  }
}

export { searchFelo };
