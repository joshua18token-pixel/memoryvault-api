#!/usr/bin/env node

/**
 * MemoryVault MCP Server
 *
 * Provides persistent memory tools to any MCP-compatible AI agent.
 *
 * Environment variables:
 *   MEMORYVAULT_API_URL  - Base URL of MemoryVault API
 *   MEMORYVAULT_API_KEY  - API key for authentication
 *   MEMORYVAULT_NAMESPACE - Default namespace (optional)
 */

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} = require('@modelcontextprotocol/sdk/types.js');

const API_URL = process.env.MEMORYVAULT_API_URL || 'http://localhost:3000';
const API_KEY = process.env.MEMORYVAULT_API_KEY || '';
const DEFAULT_NS = process.env.MEMORYVAULT_NAMESPACE || 'default';

async function apiCall(path, method = 'GET', body = null) {
  const opts = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
    },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${API_URL}${path}`, opts);
  return res.json();
}

const server = new Server(
  { name: 'memoryvault', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'memoryvault_store',
      description: 'Store a memory about the user or conversation for later recall. Use this when the user shares important information, preferences, facts about themselves, or anything worth remembering across sessions.',
      inputSchema: {
        type: 'object',
        properties: {
          content: {
            type: 'string',
            description: 'The memory to store as a concise statement (e.g., "User\'s name is Drew and he builds apps")',
          },
          namespace: {
            type: 'string',
            description: 'User/session identifier. Defaults to configured namespace.',
          },
          importance: {
            type: 'number',
            description: 'How important this memory is (0.0-1.0). Default 0.5. Use 0.8+ for key facts like name, preferences.',
          },
          type: {
            type: 'string',
            enum: ['semantic', 'episodic', 'procedural'],
            description: 'Memory type: semantic (facts), episodic (events), procedural (preferences/habits)',
          },
          tags: {
            type: 'array',
            items: { type: 'string' },
            description: 'Tags for categorization (e.g., ["family", "preferences"])',
          },
        },
        required: ['content'],
      },
    },
    {
      name: 'memoryvault_recall',
      description: 'Search memories by meaning. Use this at the start of conversations to load context about the user, or when they reference something from a previous session.',
      inputSchema: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Natural language query (e.g., "what do I know about this user?", "user preferences")',
          },
          namespace: {
            type: 'string',
            description: 'User/session identifier. Defaults to configured namespace.',
          },
          limit: {
            type: 'number',
            description: 'Max memories to return (default 5)',
          },
        },
        required: ['query'],
      },
    },
    {
      name: 'memoryvault_forget',
      description: 'Delete a specific memory by ID, or wipe all memories for a namespace (GDPR compliance).',
      inputSchema: {
        type: 'object',
        properties: {
          memory_id: {
            type: 'string',
            description: 'ID of specific memory to delete',
          },
          namespace: {
            type: 'string',
            description: 'Wipe ALL memories for this namespace',
          },
          wipe_all: {
            type: 'boolean',
            description: 'Set true to confirm wiping all memories for the namespace',
          },
        },
      },
    },
    {
      name: 'memoryvault_extract',
      description: 'Automatically extract and store memories from a raw conversation transcript. Use this to bulk-process a conversation into discrete memories.',
      inputSchema: {
        type: 'object',
        properties: {
          conversation: {
            type: 'string',
            description: 'Raw conversation text to extract memories from',
          },
          namespace: {
            type: 'string',
            description: 'User/session identifier. Defaults to configured namespace.',
          },
        },
        required: ['conversation'],
      },
    },
  ],
}));

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'memoryvault_store': {
        const result = await apiCall('/v1/memories', 'POST', {
          namespace: args.namespace || DEFAULT_NS,
          content: args.content,
          importance: args.importance || 0.5,
          type: args.type || 'semantic',
          tags: args.tags || [],
        });
        return {
          content: [{ type: 'text', text: result.error
            ? `Error: ${result.error}`
            : `✅ Memory stored (id: ${result.memory.id}, importance: ${result.memory.importance})` }],
        };
      }

      case 'memoryvault_recall': {
        const result = await apiCall('/v1/memories/recall', 'POST', {
          namespace: args.namespace || DEFAULT_NS,
          query: args.query,
          limit: args.limit || 5,
        });
        if (result.error) {
          return { content: [{ type: 'text', text: `Error: ${result.error}` }] };
        }
        if (!result.memories?.length) {
          return { content: [{ type: 'text', text: 'No memories found for this query.' }] };
        }
        const text = result.memories
          .map((m, i) => `${i + 1}. [${(m.similarity * 100).toFixed(0)}% match] ${m.content} (importance: ${m.importance}, id: ${m.id})`)
          .join('\n');
        return { content: [{ type: 'text', text }] };
      }

      case 'memoryvault_forget': {
        if (args.wipe_all && args.namespace) {
          const result = await apiCall(`/v1/memories/namespace/${args.namespace}`, 'DELETE');
          return {
            content: [{ type: 'text', text: result.error
              ? `Error: ${result.error}`
              : `🗑️ Wiped all memories for namespace "${args.namespace}" (${result.count} deleted)` }],
          };
        }
        if (args.memory_id) {
          const result = await apiCall(`/v1/memories/${args.memory_id}`, 'DELETE');
          return {
            content: [{ type: 'text', text: result.error
              ? `Error: ${result.error}`
              : `🗑️ Memory ${args.memory_id} deleted` }],
          };
        }
        return { content: [{ type: 'text', text: 'Provide either memory_id or namespace + wipe_all:true' }] };
      }

      case 'memoryvault_extract': {
        const result = await apiCall('/v1/memories/extract', 'POST', {
          namespace: args.namespace || DEFAULT_NS,
          conversation: args.conversation,
        });
        return {
          content: [{ type: 'text', text: result.error
            ? `Error: ${result.error}`
            : `✅ Extracted ${result.count} memories:\n${result.memories.map(m => `- ${m.content}`).join('\n')}` }],
        };
      }

      default:
        return { content: [{ type: 'text', text: `Unknown tool: ${name}` }] };
    }
  } catch (err) {
    return { content: [{ type: 'text', text: `Error: ${err.message}` }] };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('MemoryVault MCP server running');
}

main().catch(console.error);
