import { searchFelo } from '../utils/search_felo.js';

/**
 * Felo AI search tool definition
 */
export const feloToolDefinition = {
  name: 'felo-search',
  description: 'Advanced web search tool for technical intelligence. Retrieves up-to-date information from the web, including latest software releases, security advisories, migration guides, benchmarks, developer documentation, and community insights. Designed for function calling and automation, it provides structured, relevant results for engineering, DevOps, and research workflows. Supports both standard and streaming responses for real-time data consumption.',
  inputSchema: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'A detailed search query or prompt describing the technical information needed. Supports natural language and keyword-based queries for precise results.'
      },
      stream: {
        type: 'boolean',
        description: 'Enable streaming mode to receive incremental, real-time search results as they are discovered. Useful for monitoring live updates or large result sets. Default is false (returns full result at once).',
        default: false
      }
    },
    required: ['query']
  },
  annotations: {
    title: 'Felo AI Advanced Web Search',
    readOnlyHint: 'Results are read-only and cannot be modified. Use for information retrieval only.',
    openWorldHint: 'Searches the open web and technical sources for the most current and relevant data. Not limited to a fixed dataset.'
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
