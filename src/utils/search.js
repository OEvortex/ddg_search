import axios from 'axios';
import * as cheerio from 'cheerio';
import https from 'https';

// Constants
const RESULTS_PER_PAGE = 10;
const MAX_CACHE_PAGES = 5;

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
  timeout: 10000,
  // Provide fallback for certificate issues while maintaining security
  secureProtocol: 'TLSv1_2_method'
});

/**
 * Get a random user agent from the list
 * @returns {string} A random user agent string
 */
function getRandomUserAgent() {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

/**
 * Generate a cache key for a search query and page
 * @param {string} query - The search query
 * @param {number} page - The page number
 * @returns {string} The cache key
 */
function getCacheKey(query, page) {
  return `${query}-${page}`;
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
 * @param {number} page - The page number (default: 1)
 * @param {number} numResults - Number of results to return (default: 10)
 * @returns {Promise<Array>} - Array of search results
 */
async function searchDuckDuckGo(query, page = 1, numResults = 10) {
  try {
    // Clear old cache entries
    clearOldCache();

    // Calculate start index for pagination
    const startIndex = (page - 1) * RESULTS_PER_PAGE;

    // Check cache first
    const cacheKey = getCacheKey(query, page);
    const cachedResults = resultsCache.get(cacheKey);

    if (cachedResults && Date.now() - cachedResults.timestamp < CACHE_DURATION) {
      return cachedResults.results.slice(0, numResults);
    }

    // Get a random user agent
    const userAgent = getRandomUserAgent();

    // Fetch results
    const response = await axios.get(
      `https://duckduckgo.com/html/?q=${encodeURIComponent(query)}&s=${startIndex}`,
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

      if (title && directLink) {
        results.push({
          title,
          url: directLink,
          snippet: description || '',
          favicon: favicon,
          displayUrl: displayUrl || ''
        });
      }
    });

    // Get paginated results
    const paginatedResults = results.slice(0, numResults);

    // Cache the results
    resultsCache.set(cacheKey, {
      results: paginatedResults,
      timestamp: Date.now()
    });

    // If cache is too big, remove oldest entries
    if (resultsCache.size > MAX_CACHE_PAGES) {
      const oldestKey = Array.from(resultsCache.keys())[0];
      resultsCache.delete(oldestKey);
    }

    return paginatedResults;
  } catch (error) {
    console.error('Error searching DuckDuckGo:', error.message);
    throw error;
  }
}

/**
 * Fetches the content of a URL and returns it as text
 * @param {string} url - The URL to fetch
 * @param {Object} options - Options for content extraction
 * @param {boolean} options.extractMainContent - Whether to attempt to extract main content (default: true)
 * @param {boolean} options.includeLinks - Whether to include link text (default: true)
 * @param {boolean} options.includeImages - Whether to include image alt text (default: true)
 * @param {string[]} options.excludeTags - Tags to exclude from extraction
 * @returns {Promise<string>} - The content of the URL
 */
async function fetchUrlContent(url, options = {}) {
  try {
    // Default options
    const {
      extractMainContent = true,
      includeLinks = true,
      includeImages = true,
      excludeTags = ['script', 'style', 'noscript', 'iframe', 'svg', 'nav', 'footer', 'header', 'aside']
    } = options;

    // Get a random user agent
    const userAgent = getRandomUserAgent();

    const response = await axios.get(url, {
      headers: {
        'User-Agent': userAgent
      },
      timeout: 10000, // 10 second timeout
      httpsAgent: httpsAgent
    });

    if (response.status !== 200) {
      throw new Error(`Failed to fetch URL: ${url}`);
    }

    // If the content is HTML, extract the text content
    const contentType = response.headers['content-type'] || '';
    if (contentType.includes('text/html')) {
      const $ = cheerio.load(response.data);

      // Remove unwanted elements
      excludeTags.forEach(tag => {
        $(tag).remove();
      });

      // Remove ads and other common unwanted elements
      const unwantedSelectors = [
        '[id*="ad"]', '[class*="ad"]', '[id*="banner"]', '[class*="banner"]',
        '[id*="popup"]', '[class*="popup"]', '[class*="cookie"]',
        '[id*="cookie"]', '[class*="newsletter"]', '[id*="newsletter"]',
        '[class*="social"]', '[id*="social"]', '[class*="share"]', '[id*="share"]'
      ];

      unwantedSelectors.forEach(selector => {
        try {
          $(selector).remove();
        } catch (e) {
          // Ignore invalid selectors
        }
      });

      // Handle links and images
      if (!includeLinks) {
        $('a').each((i, link) => {
          $(link).replaceWith($(link).text());
        });
      }

      if (!includeImages) {
        $('img').remove();
      } else {
        // Replace images with their alt text
        $('img').each((i, img) => {
          const alt = $(img).attr('alt');
          if (alt) {
            $(img).replaceWith(`[Image: ${alt}]`);
          } else {
            $(img).remove();
          }
        });
      }

      // Try to extract main content if requested
      if (extractMainContent) {
        // Common content selectors in order of priority
        const contentSelectors = [
          'article', 'main', '[role="main"]', '.post-content', '.article-content',
          '.content', '#content', '.post', '.article', '.entry-content',
          '.page-content', '.post-body', '.post-text', '.story-body'
        ];

        for (const selector of contentSelectors) {
          const mainContent = $(selector).first();
          if (mainContent.length > 0) {
            // Clean up the content
            return cleanText(mainContent.text());
          }
        }
      }

      // If no main content found or not requested, use the body
      return cleanText($('body').text());
    }

    // For non-HTML content, return as is
    return response.data.toString();
  } catch (error) {
    console.error('Error fetching URL content:', error.message);
    throw error;
  }
}

/**
 * Cleans up text by removing excessive whitespace and normalizing line breaks
 * @param {string} text - The text to clean
 * @returns {string} - The cleaned text
 */
function cleanText(text) {
  return text
    .replace(/\s+/g, ' ')  // Replace multiple whitespace with single space
    .replace(/\n\s*\n/g, '\n\n')  // Normalize multiple line breaks
    .replace(/^\s+|\s+$/g, '')  // Trim start and end
    .trim();
}

/**
 * Extracts metadata from a URL (title, description, etc.)
 * @param {string} url - The URL to extract metadata from
 * @returns {Promise<Object>} - The metadata
 */
async function extractUrlMetadata(url) {
  try {
    // Get a random user agent
    const userAgent = getRandomUserAgent();

    const response = await axios.get(url, {
      headers: {
        'User-Agent': userAgent
      },
      httpsAgent: httpsAgent
    });

    if (response.status !== 200) {
      throw new Error(`Failed to fetch URL: ${url}`);
    }

    const $ = cheerio.load(response.data);

    // Extract metadata
    const title = $('title').text() || '';
    const description = $('meta[name="description"]').attr('content') ||
                       $('meta[property="og:description"]').attr('content') || '';
    const ogImage = $('meta[property="og:image"]').attr('content') || '';
    const favicon = $('link[rel="icon"]').attr('href') ||
                  $('link[rel="shortcut icon"]').attr('href') || '';

    // Resolve relative URLs
    const resolvedFavicon = favicon ? new URL(favicon, url).href : getFaviconUrl(url);
    const resolvedOgImage = ogImage ? new URL(ogImage, url).href : '';

    return {
      title,
      description,
      ogImage: resolvedOgImage,
      favicon: resolvedFavicon,
      url
    };
  } catch (error) {
    console.error('Error extracting URL metadata:', error.message);
    throw error;
  }
}

export {
  searchDuckDuckGo,
  fetchUrlContent,
  extractUrlMetadata,
  extractDirectUrl,
  getFaviconUrl
};
