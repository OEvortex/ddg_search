import axios from 'axios';
import WebSocket from 'ws';
import * as cheerio from 'cheerio';
import TurndownService from 'turndown';
import * as tough from 'tough-cookie';
import { wrapper } from 'axios-cookiejar-support';
import { getRandomUserAgent } from './user_agents.js';

const { CookieJar } = tough;

// Valid modes and detail levels
const VALID_MODES = ['question', 'academic', 'forums', 'wiki', 'thinking'];
const VALID_DETAIL_LEVELS = ['concise', 'detailed', 'comprehensive'];

// Cache results to avoid repeated requests
const resultsCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const DEFAULT_TIMEOUT = 30000;
const API_ENDPOINT = 'https://iask.ai/';

/**
 * Generate a cache key for a search query
 * @param {string} query - The search query
 * @param {string} mode - The search mode
 * @param {string|null} detailLevel - The detail level
 * @returns {string} The cache key
 */
function getCacheKey(query, mode, detailLevel) {
  return `iask-${mode}-${detailLevel || 'default'}-${query}`;
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
 * Recursively search for cached HTML content in diff object
 * @param {any} diff - The diff object to search
 * @returns {string|null} The found content or null
 */
function cacheFind(diff) {
  const values = Array.isArray(diff) ? diff : Object.values(diff);
  
  for (const value of values) {
    if (Array.isArray(value) || (typeof value === 'object' && value !== null)) {
      const cache = cacheFind(value);
      if (cache) return cache;
    }
    
    if (typeof value === 'string' && /<p>.+?<\/p>/.test(value)) {
      const turndownService = new TurndownService();
      return turndownService.turndown(value).trim();
    }
  }
  
  return null;
}

/**
 * Format HTML content into readable markdown text
 * @param {string} htmlContent - The HTML content to format
 * @returns {string} Formatted text
 */
function formatHtml(htmlContent) {
  if (!htmlContent) return '';
  
  const $ = cheerio.load(htmlContent);
  const outputLines = [];

  $('h1, h2, h3, p, ol, ul, div').each((_, element) => {
    const tagName = element.tagName.toLowerCase();
    const $el = $(element);

    if (['h1', 'h2', 'h3'].includes(tagName)) {
      outputLines.push(`\n**${$el.text().trim()}**\n`);
    } else if (tagName === 'p') {
      let text = $el.text().trim();
      // Remove IAsk attribution
      text = text.replace(/^According to Ask AI & Question AI www\.iAsk\.ai:\s*/i, '').trim();
      // Remove footnote markers
      text = text.replace(/\[\d+\]\(#fn:\d+ 'see footnote'\)/g, '');
      if (text) outputLines.push(text + '\n');
    } else if (['ol', 'ul'].includes(tagName)) {
      $el.find('li').each((_, li) => {
        outputLines.push('- ' + $(li).text().trim() + '\n');
      });
    } else if (tagName === 'div' && $el.hasClass('footnotes')) {
      outputLines.push('\n**Authoritative Sources**\n');
      $el.find('li').each((_, li) => {
        const link = $(li).find('a');
        if (link.length) {
          outputLines.push(`- ${link.text().trim()} (${link.attr('href')})\n`);
        }
      });
    }
  });

  return outputLines.join('');
}

/**
 * Search using IAsk AI via WebSocket (Phoenix LiveView)
 * @param {string} prompt - The search query or prompt
 * @param {string} mode - Search mode: 'question', 'academic', 'forums', 'wiki', 'thinking'
 * @param {string|null} detailLevel - Detail level: 'concise', 'detailed', 'comprehensive'
 * @returns {Promise<string>} The search results
 */
async function searchIAsk(prompt, mode = 'thinking', detailLevel = null) {
  // Validate mode
  if (!VALID_MODES.includes(mode)) {
    throw new Error(`Invalid mode: ${mode}. Valid modes are: ${VALID_MODES.join(', ')}`);
  }

  // Validate detail level
  if (detailLevel && !VALID_DETAIL_LEVELS.includes(detailLevel)) {
    throw new Error(`Invalid detail level: ${detailLevel}. Valid levels are: ${VALID_DETAIL_LEVELS.join(', ')}`);
  }

  // Clear old cache entries
  clearOldCache();

  const cacheKey = getCacheKey(prompt, mode, detailLevel);
  const cachedResults = resultsCache.get(cacheKey);

  if (cachedResults && Date.now() - cachedResults.timestamp < CACHE_DURATION) {
    return cachedResults.results;
  }

  // Build URL parameters
  const params = new URLSearchParams({ mode, q: prompt });
  if (detailLevel) {
    params.append('options[detail_level]', detailLevel);
  }

  // Create a cookie jar for session management
  const jar = new CookieJar();
  const client = wrapper(axios.create({ jar }));

  // Get initial page and extract tokens
  const response = await client.get(API_ENDPOINT, {
    params: Object.fromEntries(params),
    timeout: DEFAULT_TIMEOUT,
    headers: {
      'User-Agent': getRandomUserAgent()
    }
  });

  const $ = cheerio.load(response.data);
  
  const phxNode = $('[id^="phx-"]').first();
  const csrfToken = $('[name="csrf-token"]').attr('content');
  const phxId = phxNode.attr('id');
  const phxSession = phxNode.attr('data-phx-session');

  if (!phxId || !csrfToken) {
    throw new Error('Failed to extract required tokens from page');
  }

  // Get the actual response URL (after any redirects)
  const responseUrl = response.request.res?.responseUrl || response.config.url;
  
  // Get cookies from the jar for WebSocket connection
  const cookies = await jar.getCookies(API_ENDPOINT);
  const cookieString = cookies.map(c => `${c.key}=${c.value}`).join('; ');
  
  // Build WebSocket URL
  const wsParams = new URLSearchParams({
    '_csrf_token': csrfToken,
    'vsn': '2.0.0'
  });
  const wsUrl = `wss://iask.ai/live/websocket?${wsParams.toString()}`;

  return new Promise((resolve, reject) => {
    const ws = new WebSocket(wsUrl, {
      headers: {
        'Cookie': cookieString,
        'User-Agent': getRandomUserAgent(),
        'Origin': 'https://iask.ai'
      }
    });
    
    let buffer = '';
    let timeoutId;

    ws.on('open', () => {
      // Send phx_join message
      ws.send(JSON.stringify([
        null,
        null,
        `lv:${phxId}`,
        'phx_join',
        {
          params: { _csrf_token: csrfToken },
          url: responseUrl,
          session: phxSession
        }
      ]));
    });

    ws.on('message', (data) => {
      try {
        const msg = JSON.parse(data.toString());
        if (!msg) return;

        const diff = msg[4];
        if (!diff) return;

        let chunk = null;

        try {
          // Try to get chunk from diff.e[0][1].data
          // Use non-optional chaining to trigger exception if path doesn't exist
          if (diff.e) {
            chunk = diff.e[0][1].data;
            
            if (chunk) {
              let formatted;
              if (/<[^>]+>/.test(chunk)) {
                formatted = formatHtml(chunk);
              } else {
                formatted = chunk.replace(/<br\/>/g, '\n');
              }
              
              buffer += formatted;
            }
          } else {
            throw new Error('No diff.e');
          }
        } catch {
          // Fallback to cacheFind
          const cache = cacheFind(diff);
          if (cache) {
            let formatted;
            if (/<[^>]+>/.test(cache)) {
              formatted = formatHtml(cache);
            } else {
              formatted = cache;
            }
            buffer += formatted;
            // Close after cache find
            ws.close();
            return;
          }
        }
      } catch (err) {
        reject(new Error(`IAsk API error: ${err.message}`));
        ws.close();
      }
    });

    ws.on('close', () => {
      clearTimeout(timeoutId);
      
      // Cache the result
      if (buffer) {
        resultsCache.set(cacheKey, {
          results: buffer,
          timestamp: Date.now()
        });
      }
      
      resolve(buffer || 'No results found.');
    });

    ws.on('error', (err) => {
      clearTimeout(timeoutId);
      reject(new Error(`WebSocket error: ${err.message}`));
    });

    timeoutId = setTimeout(() => {
      ws.close();
    }, DEFAULT_TIMEOUT);
  });
}

export { searchIAsk, VALID_MODES, VALID_DETAIL_LEVELS };
