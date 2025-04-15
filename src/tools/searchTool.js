import { searchDuckDuckGo } from '../utils/search.js';

/**
 * Web search tool definition
 */
export const searchToolDefinition = {
  name: 'web-search',
  description: 'Search the web using DuckDuckGo and return results',
  inputSchema: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'The search query'
      },
      page: {
        type: 'integer',
        description: 'Page number (default: 1)',
        default: 1,
        minimum: 1
      },
      numResults: {
        type: 'integer',
        description: 'Number of results to return (default: 10)',
        default: 10,
        minimum: 1,
        maximum: 20
      }
    },
    required: ['query']
  },
  annotations: {
    title: 'Web Search',
    readOnlyHint: true,
    openWorldHint: true
  }
};

/**
 * Web search tool handler
 * @param {Object} params - The tool parameters
 * @returns {Promise<Object>} - The tool result
 */
export async function searchToolHandler(params) {
  const { query, page = 1, numResults = 10 } = params;
  console.log(`Searching for: ${query} (page ${page}, ${numResults} results)`);
  
  const results = await searchDuckDuckGo(query, page, numResults);
  console.log(`Found ${results.length} results`);
  
  // Format the results for display
  const formattedResults = results.map((result, index) => 
    `${index + 1}. [${result.title}](${result.url})\n   ${result.snippet}`
  ).join('\n\n');
  
  return {
    content: [
      {
        type: 'text',
        text: formattedResults || 'No results found.'
      }
    ]
  };
}
