import { extractUrlMetadata } from '../utils/search.js';

/**
 * URL metadata tool definition
 */
export const metadataToolDefinition = {
  name: 'url-metadata',
  title: 'URL Metadata Extractor',
  description: 'Extract metadata from a URL including title, description, Open Graph data, and favicon information',
  inputSchema: {
    type: 'object',
    properties: {
      url: {
        type: 'string',
        description: 'The URL to extract metadata from (must be a valid HTTP/HTTPS URL)'
      }
    },
    required: ['url']
  }
};

/**
 * URL metadata tool handler
 * @param {Object} params - The tool parameters
 * @returns {Promise<Object>} - The tool result
 */
export async function metadataToolHandler(params) {
  const { url } = params;
  console.log(`Extracting metadata from URL: ${url}`);
  
  const metadata = await extractUrlMetadata(url);
  
  // Format the metadata for display
  const formattedMetadata = `
## URL Metadata for ${url}

**Title:** ${metadata.title}

**Description:** ${metadata.description}

**Image:** ${metadata.ogImage || 'None'}

**Favicon:** ${metadata.favicon || 'None'}
  `.trim();
  
  return {
    content: [
      {
        type: 'text',
        text: formattedMetadata
      }
    ]
  };
}
