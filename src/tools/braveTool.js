import { searchBraveAI } from '../utils/search_brave_ai.js';

/**
 * Brave AI search tool definition
 */
export const braveToolDefinition = {
  name: 'brave-search',
  title: 'Brave AI Search',
  description: 'AI-powered search using Brave Search AI Chat. Returns AI-generated responses based on web content.',
  inputSchema: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'The search query or question.'
      },
      enableResearch: {
        type: 'boolean',
        description: 'Enable deep research mode for more comprehensive responses.',
        default: false
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
 * Brave AI search tool handler
 * @param {Object} params - The tool parameters
 * @returns {Promise<Object>} - The tool result
 */
export async function braveToolHandler(params) {
  const { query, enableResearch = false } = params;

  console.log(`Searching Brave AI for: "${query}" (research: ${enableResearch})`);

  try {
    const result = await searchBraveAI(query, { enableResearch });
    return {
      content: [
        {
          type: 'text',
          text: result || 'No results found.'
        }
      ]
    };
  } catch (error) {
    console.error(`Error in Brave AI search: ${error.message}`);
    return {
      isError: true,
      content: [
        {
          type: 'text',
          text: `Error searching Brave AI: ${error.message}`
        }
      ]
    };
  }
}
