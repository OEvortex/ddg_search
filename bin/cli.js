#!/usr/bin/env node

import { searchToolHandler } from '../src/tools/searchTool.js';

const HELP = `
Usage:
  ddg-search "query" [options]        Search from the command line
  ddg-search --server                 Start the MCP server (stdio)

Options:
  -m, --mode <web|ai>                 Search mode (default: web)
  -b, --backend <iask|monica>         AI backend (default: iask)
  -n, --num-results <1-20>            Number of web results (default: 3)
  --iask-mode <mode>                  IAsk mode: question|academic|forums|wiki|thinking
  --detail-level <level>              IAsk detail: concise|detailed|comprehensive
  -h, --help                          Show this help
  -v, --version                       Show version

Examples:
  ddg-search "C++ standard 2026"
  ddg-search "quantum computing" -m ai
  ddg-search "latest news" -n 10
  ddg-search "explain relativity" -m ai -b monica
`;

function parseArgs(argv) {
  const args = argv.slice(2);
  const parsed = { positional: [], flags: {} };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--server') {
      parsed.server = true;
    } else if (arg === '-h' || arg === '--help') {
      parsed.help = true;
    } else if (arg === '-v' || arg === '--version') {
      parsed.version = true;
    } else if (arg === '-m' || arg === '--mode') {
      parsed.flags.mode = args[++i];
    } else if (arg === '-b' || arg === '--backend') {
      parsed.flags.backend = args[++i];
    } else if (arg === '-n' || arg === '--num-results') {
      parsed.flags.numResults = parseInt(args[++i], 10);
    } else if (arg === '--iask-mode') {
      parsed.flags.iaskMode = args[++i];
    } else if (arg === '--detail-level') {
      parsed.flags.detailLevel = args[++i];
    } else if (!arg.startsWith('-')) {
      parsed.positional.push(arg);
    }
  }

  return parsed;
}

async function main() {
  const parsed = parseArgs(process.argv);

  if (parsed.help) {
    console.log(HELP);
    process.exit(0);
  }

  if (parsed.version) {
    const { readFile } = await import('fs/promises');
    const pkg = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
    console.log(pkg.version);
    process.exit(0);
  }

  if (parsed.server) {
    await startMcpServer();
    return;
  }

  if (parsed.positional.length === 0) {
    // No query provided — start MCP server by default (backward compat)
    await startMcpServer();
    return;
  }

  // Direct CLI search mode
  const query = parsed.positional.join(' ');
  const params = {
    query,
    mode: parsed.flags.mode || 'web',
    backend: parsed.flags.backend || 'iask',
    numResults: parsed.flags.numResults || 3,
    iaskMode: parsed.flags.iaskMode || 'thinking',
    detailLevel: parsed.flags.detailLevel || null
  };

  try {
    const result = await searchToolHandler(params);
    if (result.isError) {
      console.error(result.content[0].text);
      process.exit(1);
    }
    console.log(result.content[0].text);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

async function startMcpServer() {
  const { Server } = await import('@modelcontextprotocol/sdk/server/index.js');
  const { StdioServerTransport } = await import('@modelcontextprotocol/sdk/server/stdio.js');
  const { CallToolRequestSchema, ListToolsRequestSchema } = await import('@modelcontextprotocol/sdk/types.js');
  const { searchToolDefinition, searchToolHandler } = await import('../src/tools/searchTool.js');

  const server = new Server({
    name: 'ddg-search-mcp',
    version: '1.2.0'
  }, {
    capabilities: { tools: { listChanged: true } }
  });

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [searchToolDefinition]
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    try {
      const { name, arguments: args } = request.params;
      if (name !== 'web-search') throw new Error(`Unknown tool: ${name}`);
      return await searchToolHandler(args);
    } catch (error) {
      return {
        isError: true,
        content: [{ type: 'text', text: `Error: ${error.message}` }]
      };
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main();
