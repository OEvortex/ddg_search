import { searchDuckDuckGo } from '../utils/search.js';
import { searchIAsk, VALID_MODES, VALID_DETAIL_LEVELS } from '../utils/search_iask.js';
import { searchMonica } from '../utils/search_monica.js';

/**
 * Unified web search tool definition
 */
export const searchToolDefinition = {
  name: 'web-search',
  title: 'Web Search',
  description: `Search the web. Use mode="web" for standard DuckDuckGo results (titles, URLs, snippets).
Use mode="ai" for AI-generated answers — pick backend="iask" (default) or backend="monica".`,
  inputSchema: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'The search query or question.'
      },
      mode: {
        type: 'string',
        description: 'Search mode. "web" returns DuckDuckGo search results. "ai" returns an AI-generated answer.',
        enum: ['web', 'ai'],
        default: 'web'
      },
      backend: {
        type: 'string',
        description: 'AI backend when mode="ai": "iask" or "monica". Ignored in web mode.',
        enum: ['iask', 'monica'],
        default: 'iask'
      },
      numResults: {
        type: 'integer',
        description: 'Number of web results (1-20). Web mode only. Default: 3.',
        default: 3,
        minimum: 1,
        maximum: 20
      },
      iaskMode: {
        type: 'string',
        description: 'IAsk mode when backend="iask": "question", "academic", "forums", "wiki", or "thinking". Default: "thinking".',
        enum: VALID_MODES,
        default: 'thinking'
      },
      detailLevel: {
        type: 'string',
        description: 'IAsk detail level when backend="iask": "concise", "detailed", or "comprehensive".',
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
 * Unified web search tool handler
 */
export async function searchToolHandler(params) {
  const { query, mode = 'web', backend = 'iask', numResults = 3, iaskMode = 'thinking', detailLevel = null } = params;

  console.log(`Web search: "${query}" (mode=${mode}, backend=${backend})`);

  if (mode === 'ai') {
    try {
      if (backend === 'monica') {
        const result = await searchMonica(query);
        return { content: [{ type: 'text', text: result || 'No results found.' }] };
      }
      const result = await searchIAsk(query, iaskMode, detailLevel);
      return { content: [{ type: 'text', text: result || 'No results found.' }] };
    } catch (error) {
      console.error(`AI search error: ${error.message}`);
      return { isError: true, content: [{ type: 'text', text: `AI search failed: ${error.message}` }] };
    }
  }

  // mode === "web"
  const results = await searchDuckDuckGo(query, numResults, 'short');
  console.log(`Found ${results.length} results`);

  const formattedResults = results.map((r, i) => {
    let out = `${i + 1}. **${r.title}**\nURL: ${r.url}\n`;
    if (r.snippet) out += `Snippet: ${r.snippet}\n`;
    return out;
  }).join('\n');

  return { content: [{ type: 'text', text: formattedResults || 'No results found.' }] };
}
