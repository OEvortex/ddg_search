import axios from 'axios';
import * as cheerio from 'cheerio';
import https from 'https';
import { getRandomUserAgent } from './user_agents.js';

// Constants
const MAX_CACHE_PAGES = 5;

// Cache results to avoid repeated requests
const resultsCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// HTTPS agent configuration to handle certificate chain issues
const httpsAgent = new https.Agent({
  rejectUnauthorized: true, // Keep security enabled
  keepAlive: true,
  timeout: 10000,
  // Provide fallback for certificate issues while maintaining security
  secureProtocol: 'TLSv1_2_method'
});

/**
 * Generate a cache key for a search query
 * @param {string} query - The search query
 * @returns {string} The cache key
 */
function getCacheKey(query) {
  return `${query}`;
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
 * Extract the direct URL from a DuckDuckGo redirect URL
 * @param {string} duckduckgoUrl - The DuckDuckGo URL to extract from
 * @returns {string} The direct URL
 */
function extractDirectUrl(duckduckgoUrl) {
  try {
    // Handle relative URLs from DuckDuckGo
    if (duckduckgoUrl.startsWith('//')) {
      duckduckgoUrl = 'https:' + duckduckgoUrl;
    } else if (duckduckgoUrl.startsWith('/')) {
      duckduckgoUrl = 'https://duckduckgo.com' + duckduckgoUrl;
    }

    const url = new URL(duckduckgoUrl);

    // Extract direct URL from DuckDuckGo redirect
    if (url.hostname === 'duckduckgo.com' && url.pathname === '/l/') {
      const uddg = url.searchParams.get('uddg');
      if (uddg) {
        return decodeURIComponent(uddg);
      }
    }

    // Handle ad redirects
    if (url.hostname === 'duckduckgo.com' && url.pathname === '/y.js') {
      const u3 = url.searchParams.get('u3');
      if (u3) {
        try {
          const decodedU3 = decodeURIComponent(u3);
          const u3Url = new URL(decodedU3);
          const clickUrl = u3Url.searchParams.get('ld');
          if (clickUrl) {
            return decodeURIComponent(clickUrl);
          }
          return decodedU3;
        } catch {
          return duckduckgoUrl;
        }
      }
    }

    return duckduckgoUrl;
  } catch {
    // If URL parsing fails, try to extract URL from a basic string match
    const urlMatch = duckduckgoUrl.match(/https?:\/\/[^\s<>"]+/);
    if (urlMatch) {
      return urlMatch[0];
    }
    return duckduckgoUrl;
  }
}

/**
 * Get a favicon URL for a given website URL
 * @param {string} url - The website URL
 * @returns {string} The favicon URL
 */
function getFaviconUrl(url) {
  try {
    const urlObj = new URL(url);
    return `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=32`;
  } catch {
    return ''; // Return empty string if URL is invalid
  }
}


/**
 * Scrapes search results from DuckDuckGo HTML
 * @param {string} query - The search query
 * @param {number} numResults - Number of results to return (default: 10)
 * @returns {Promise<Array>} - Array of search results
 */
async function searchDuckDuckGo(query, numResults = 10, mode = 'short') {
  try {
    // Clear old cache entries
    clearOldCache();

    // Check cache first
    const cacheKey = getCacheKey(query);
    const cachedResults = resultsCache.get(cacheKey);

    if (cachedResults && Date.now() - cachedResults.timestamp < CACHE_DURATION) {
      return cachedResults.results.slice(0, numResults);
    }

    // Get a random user agent
    const userAgent = getRandomUserAgent();

    // Fetch results
    const response = await axios.get(
      `https://duckduckgo.com/html/?q=${encodeURIComponent(query)}`,
      {
        headers: {
          'User-Agent': userAgent
        },
        httpsAgent: httpsAgent
      }
    );

    if (response.status !== 200) {
      throw new Error('Failed to fetch search results');
    }

    const html = response.data;

    // Parse results using cheerio
    const $ = cheerio.load(html);

    const results = [];
    const jinaFetchPromises = [];
    $('.result').each((i, result) => {
      const $result = $(result);
      const titleEl = $result.find('.result__title a');
      const linkEl = $result.find('.result__url');
      const snippetEl = $result.find('.result__snippet');

      const title = titleEl.text()?.trim();
      const rawLink = titleEl.attr('href');
      const description = snippetEl.text()?.trim();
      const displayUrl = linkEl.text()?.trim();

      const directLink = extractDirectUrl(rawLink || '');
      const favicon = getFaviconUrl(directLink);
      const jinaUrl = getJinaAiUrl(directLink);

      if (title && directLink) {
        if (mode === 'detailed') {
          jinaFetchPromises.push(
            axios.get(jinaUrl, {
              headers: {
                'User-Agent': getRandomUserAgent()
              },
              httpsAgent: httpsAgent,
              timeout: 10000
            })
            .then(jinaRes => {
              let jinaContent = '';
              if (jinaRes.status === 200 && typeof jinaRes.data === 'string') {
                const $jina = cheerio.load(jinaRes.data);
                jinaContent = $jina('body').text()
              }
              return {
                title,
                url: directLink,
                snippet: description || '',
                favicon: favicon,
                displayUrl: displayUrl || '',
                Description: jinaContent
              };
            })
            .catch(() => {
              return {
                title,
                url: directLink,
                snippet: description || '',
                favicon: favicon,
                displayUrl: displayUrl || '',
                Description: ''
              };
            })
          );
        } else {
          // short mode: omit Description
          jinaFetchPromises.push(
            Promise.resolve({
              title,
              url: directLink,
              snippet: description || '',
              favicon: favicon,
              displayUrl: displayUrl || ''
            })
          );
        }
      }
    });

    // Wait for all Jina AI fetches to complete
    const jinaResults = await Promise.all(jinaFetchPromises);
    results.push(...jinaResults);

    // Get limited results
    const limitedResults = results.slice(0, numResults);

    // Cache the results
    resultsCache.set(cacheKey, {
      results: limitedResults,
      timestamp: Date.now()
    });

    // If cache is too big, remove oldest entries
    if (resultsCache.size > MAX_CACHE_PAGES) {
      const oldestKey = Array.from(resultsCache.keys())[0];
      resultsCache.delete(oldestKey);
    }

    return limitedResults;
  } catch (error) {
    console.error('Error searching DuckDuckGo:', error.message);
    throw error;
  }
}


export {
  searchDuckDuckGo,
  extractDirectUrl,
  getFaviconUrl
};

/**
 * Generate a Jina AI URL for a given website URL
 * @param {string} url - The website URL
 * @returns {string} The Jina AI URL
 */
function getJinaAiUrl(url) {
  try {
    const urlObj = new URL(url);
    return `https://r.jina.ai/${urlObj.href}`;
  } catch {
    return '';
  }
}

export { getJinaAiUrl };
