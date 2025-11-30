import { searchDuckDuckGo } from '../utils/search.js';

/**
 * Web search tool definition
 */
export const searchToolDefinition = {
  name: 'web-search',
  title: 'Web Search',
  description: 'Perform a web search using DuckDuckGo and receive detailed results including titles, URLs, and summaries.',
  inputSchema: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'Enter your search query to find the most relevant web pages.'
      },
      numResults: {
        type: 'integer',
        description: 'Specify how many results to display (default: 3, maximum: 20).',
        default: 3,
        minimum: 1,
        maximum: 20
      },
      mode: {
        type: 'string',
        description: "Choose 'short' for basic results (no Description) or 'detailed' for full results (includes Description).",
        enum: ['short', 'detailed'],
        default: 'short'
      }
    },
    required: ['query']
  }
};

/**
 * Web search tool handler
 * @param {Object} params - The tool parameters
 * @returns {Promise<Object>} - The tool result
 */
export async function searchToolHandler(params) {
  const { query, numResults = 3, mode = 'short' } = params;
  console.log(`Searching for: ${query} (${numResults} results, mode: ${mode})`);

  const results = await searchDuckDuckGo(query, numResults, mode);
  console.log(`Found ${results.length} results`);

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(results)
      }
    ]
  };
}
