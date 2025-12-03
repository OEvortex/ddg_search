import { searchMonica } from '../utils/search_monica.js';

/**
 * Monica AI search tool definition
 */
export const monicaToolDefinition = {
  name: 'monica-search',
  title: 'Monica AI Search',
  description: 'AI-powered search using Monica AI. Returns AI-generated responses based on web content.',
  inputSchema: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'The search query or question.'
      }
    },
    required: ['query']
  },
  annotations: {
    readOnlyHint: true,
    openWorldHint: false
  }
};

/**
 * Monica AI search tool handler
 * @param {Object} params - The tool parameters
 * @returns {Promise<Object>} - The tool result
 */
export async function monicaToolHandler(params) {
  const { query } = params;
  
  console.log(`Searching Monica AI for: "${query}"`);
  
  try {
    const result = await searchMonica(query);
    return {
      content: [
        {
          type: 'text',
          text: result || 'No results found.'
        }
      ]
    };
  } catch (error) {
    console.error(`Error in Monica search: ${error.message}`);
    return {
      isError: true,
      content: [
        {
          type: 'text',
          text: `Error searching Monica: ${error.message}`
        }
      ]
    };
  }
}
