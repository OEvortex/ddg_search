import { searchFelo } from '../utils/search_felo.js';

/**
 * Felo AI search tool definition
 */
export const feloToolDefinition = {
  name: 'felo-search',
  description: 'Search the web for up-to-date technical information like latest releases, security advisories, migration guides, benchmarks, and community insights',
  inputSchema: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'The search query or prompt'
      },
      stream: {
        type: 'boolean',
        description: 'Whether to stream the response (default: false)',
        default: false
      }
    },
    required: ['query']
  },
  annotations: {
    title: 'Felo AI Search',
    readOnlyHint: true,
    openWorldHint: true
  }
};

/**
 * Felo AI search tool handler
 * @param {Object} params - The tool parameters
 * @returns {Promise<Object>} - The tool result
 */
export async function feloToolHandler(params) {
  const { query, stream = false } = params;
  console.log(`Searching Felo AI for: "${query}" (stream: ${stream})`);
  
  try {
    if (stream) {
      // For streaming responses, we need to collect them and then return
      let fullResponse = '';
      const chunks = [];
      
      for await (const chunk of await searchFelo(query, true)) {
        chunks.push(chunk);
        fullResponse += chunk;
      }
      
      // Format the response
      return {
        content: [
          {
            type: 'text',
            text: fullResponse || 'No results found.'
          }
        ]
      };
    } else {
      // For non-streaming responses
      const response = await searchFelo(query, false);
      
      return {
        content: [
          {
            type: 'text',
            text: response || 'No results found.'
          }
        ]
      };
    }
  } catch (error) {
    console.error(`Error in Felo search: ${error.message}`);
    return {
      isError: true,
      content: [
        {
          type: 'text',
          text: `Error searching Felo: ${error.message}`
        }
      ]
    };
  }
}
