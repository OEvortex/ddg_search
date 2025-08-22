import { fetchUrlContent } from '../utils/search.js';

/**
 * Fetch URL tool definition
 */
export const fetchUrlToolDefinition = {
  name: 'fetch-url',
  title: 'Fetch URL Content',
  description: 'Fetch and extract the main content from any URL, with customizable extraction options for text, links, and images',
  inputSchema: {
    type: 'object',
    properties: {
      url: {
        type: 'string',
        description: 'The URL to fetch content from (must be a valid HTTP/HTTPS URL)'
      },
      maxLength: {
        type: 'integer',
        description: 'Maximum length of content to return in characters (default: 10000)',
        default: 10000,
        minimum: 1000,
        maximum: 50000
      },
      extractMainContent: {
        type: 'boolean',
        description: 'Whether to attempt to extract main content only, filtering out navigation and ads (default: true)',
        default: true
      },
      includeLinks: {
        type: 'boolean',
        description: 'Whether to include link text in the extracted content (default: true)',
        default: true
      },
      includeImages: {
        type: 'boolean',
        description: 'Whether to include image alt text in the extracted content (default: true)',
        default: true
      },
      excludeTags: {
        type: 'array',
        description: 'HTML tags to exclude from extraction (default: script, style, etc.)',
        items: {
          type: 'string'
        }
      }
    },
    required: ['url']
  }
};

/**
 * Fetch URL tool handler
 * @param {Object} params - The tool parameters
 * @returns {Promise<Object>} - The tool result
 */
export async function fetchUrlToolHandler(params) {
  const {
    url,
    maxLength = 10000,
    extractMainContent = true,
    includeLinks = true,
    includeImages = true,
    excludeTags = ['script', 'style', 'noscript', 'iframe', 'svg', 'nav', 'footer', 'header', 'aside']
  } = params;

  console.log(`Fetching content from URL: ${url} (maxLength: ${maxLength})`);

  try {
    // Fetch content with specified options
    const content = await fetchUrlContent(url, {
      extractMainContent,
      includeLinks,
      includeImages,
      excludeTags
    });

    // Truncate content if it's too long
    const truncatedContent = content.length > maxLength
      ? content.substring(0, maxLength) + '... [Content truncated due to length]'
      : content;

    // Add metadata about the extraction
    const metadata = `
---
Extraction settings:
- URL: ${url}
- Main content extraction: ${extractMainContent ? 'Enabled' : 'Disabled'}
- Links included: ${includeLinks ? 'Yes' : 'No'}
- Images included: ${includeImages ? 'Yes (as alt text)' : 'No'}
- Content length: ${content.length} characters${content.length > maxLength ? ` (truncated to ${maxLength})` : ''}
---
`;

    return {
      content: [
        {
          type: 'text',
          text: truncatedContent + metadata
        }
      ]
    };
  } catch (error) {
    console.error(`Error fetching URL ${url}:`, error);
    return {
      isError: true,
      content: [
        {
          type: 'text',
          text: `Error fetching URL: ${error.message}`
        }
      ]
    };
  }
}
