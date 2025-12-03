import { searchIAsk, VALID_MODES, VALID_DETAIL_LEVELS } from '../utils/search_iask.js';

/**
 * IAsk AI search tool definition
 */
export const iaskToolDefinition = {
  name: 'iask-search',
  title: 'IAsk AI Search',
  description: 'AI-powered search using IAsk.ai. Retrieves comprehensive, AI-generated responses based on web content. Supports different search modes (question, academic, forums, wiki, thinking) and detail levels (concise, detailed, comprehensive). Ideal for getting well-researched answers to complex questions.',
  inputSchema: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'The search query or question to ask. Supports natural language questions for comprehensive AI-generated responses.'
      },
      mode: {
        type: 'string',
        description: 'Search mode to use. Options: "question" (general questions), "academic" (scholarly/research), "forums" (community discussions), "wiki" (encyclopedia-style), "thinking" (deep analysis). Default is "question".',
        enum: VALID_MODES,
        default: 'question'
      },
      detailLevel: {
        type: 'string',
        description: 'Level of detail in the response. Options: "concise" (brief), "detailed" (moderate), "comprehensive" (extensive). Default is null (standard response).',
        enum: VALID_DETAIL_LEVELS
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
 * IAsk AI search tool handler
 * @param {Object} params - The tool parameters
 * @returns {Promise<Object>} - The tool result
 */
export async function iaskToolHandler(params) {
  const { 
    query, 
    mode = 'thinking', 
    detailLevel = null
  } = params;
  
  console.log(`Searching IAsk AI for: "${query}" (mode: ${mode}, detailLevel: ${detailLevel || 'default'})`);
  
  try {
    const response = await searchIAsk(query, mode, detailLevel);
    
    return {
      content: [
        {
          type: 'text',
          text: response || 'No results found.'
        }
      ]
    };
  } catch (error) {
    console.error(`Error in IAsk search: ${error.message}`);
    return {
      isError: true,
      content: [
        {
          type: 'text',
          text: `Error searching IAsk: ${error.message}`
        }
      ]
    };
  }
}
