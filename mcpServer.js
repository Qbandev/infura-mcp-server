#!/usr/bin/env node

import dotenv from "dotenv";
import express from "express";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import { discoverTools } from "./lib/tools.js";

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, ".env") });

const SERVER_NAME = "mcp-server-infura";

// Enhanced logging function
function log(level, message, data = null) {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  
  if (level === 'error') {
    console.error(logEntry, data ? JSON.stringify(data, null, 2) : '');
  } else {
    console.log(logEntry, data ? JSON.stringify(data, null, 2) : '');
  }
}

async function transformTools(tools) {
  return tools
    .map((tool) => {
      const definitionFunction = tool.definition?.function;
      if (!definitionFunction) return;
      return {
        name: definitionFunction.name,
        description: definitionFunction.description,
        inputSchema: definitionFunction.parameters,
      };
    })
    .filter(Boolean);
}

async function setupServerHandlers(server, tools) {
  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: await transformTools(tools),
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const toolName = request.params.name;
    const args = request.params.arguments;
    
    log('info', `Tool call received: ${toolName}`, { args });
    
    const tool = tools.find((t) => t.definition.function.name === toolName);
    if (!tool) {
      log('error', `Unknown tool requested: ${toolName}`);
      throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${toolName}`);
    }
    
    const requiredParameters = tool.definition?.function?.parameters?.required || [];
    for (const requiredParameter of requiredParameters) {
      if (!(requiredParameter in args)) {
        log('error', `Missing required parameter: ${requiredParameter}`, { toolName, args });
        throw new McpError(
          ErrorCode.InvalidParams,
          `Missing required parameter: ${requiredParameter}`
        );
      }
    }
    
    try {
      log('info', `Executing tool: ${toolName}`);
      const result = await tool.function(args);
      log('info', `Tool execution successful: ${toolName}`);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      log('error', `Tool execution failed: ${toolName}`, {
        error: error.message,
        stack: error.stack,
        args
      });
      
      // Enhanced error handling with specific error types
      if (error.message.includes('rate limit')) {
        throw new McpError(
          ErrorCode.InternalError,
          `Infura API rate limit exceeded. Please try again in a moment.`
        );
      } else if (error.message.includes('timeout')) {
        throw new McpError(
          ErrorCode.InternalError,
          `Request timeout. The Ethereum network might be busy.`
        );
      } else if (error.message.includes('INFURA_API_KEY')) {
        throw new McpError(
          ErrorCode.InternalError,
          `Infura API configuration error. Please check your API key.`
        );
      } else {
      throw new McpError(
        ErrorCode.InternalError,
        `API error: ${error.message}`
      );
      }
    }
  });
}

async function run() {
  const args = process.argv.slice(2);
  const isSSE = args.includes("--sse");
  
  log('info', `Starting MCP server in ${isSSE ? 'SSE' : 'stdio'} mode`);
  
  try {
  const tools = await discoverTools();
    log('info', `Loaded ${tools.length} tools successfully`);

  if (isSSE) {
    const app = express();
    const transports = {};
    const servers = {};

    // Add proper JSON parsing middleware
    app.use(express.json());
    
    // Enable CORS for development
    app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      if (req.method === 'OPTIONS') {
        res.sendStatus(200);
      } else {
        next();
      }
    });

    // Global error handler for unhandled errors
    process.on('uncaughtException', (error) => {
        log('error', 'Uncaught exception', { error: error.message, stack: error.stack });
      // Don't exit immediately in SSE mode to help with debugging
    });

    process.on('unhandledRejection', (reason, promise) => {
        log('error', 'Unhandled rejection', { reason, promise });
      // Don't exit immediately in SSE mode to help with debugging
    });

    app.get("/sse", async (req, res) => {
        log('info', 'New SSE connection request received');
      
      try {
        // Create a new Server instance for each session
        const server = new Server(
          {
            name: SERVER_NAME,
            version: "0.1.0",
          },
          {
            capabilities: {
              tools: {},
            },
          }
        );
        
        // Add error handler to the server
        server.onerror = (error) => {
            log('error', 'SSE Server error', { error: error.message, stack: error.stack });
          // Don't crash the whole process
        };
        
          log('info', 'Setting up server handlers...');
        await setupServerHandlers(server, tools);
          log('info', 'Server handlers set up successfully');

          log('info', 'Creating SSE transport...');
        const transport = new SSEServerTransport("/messages", res);
          log('info', `Created transport with sessionId: ${transport.sessionId}`);

        // Set up cleanup on connection close
        res.on("close", async () => {
            log('info', `Connection closed for session: ${transport.sessionId}`);
          delete transports[transport.sessionId];
          try {
            await server.close();
              log('info', `Server closed for session: ${transport.sessionId}`);
          } catch (error) {
              log('error', 'Failed to close server', { error: error.message });
          }
          delete servers[transport.sessionId];
        });

        res.on("error", (error) => {
            log('error', `Connection error for session ${transport.sessionId}`, { error: error.message });
          delete transports[transport.sessionId];
          delete servers[transport.sessionId];
        });

        // Connect the server to the transport first
          log('info', 'Connecting server to transport...');
        await server.connect(transport);
          log('info', 'Server connected to transport successfully');
        
        // Only store the transport and server AFTER successful connection
        transports[transport.sessionId] = transport;
        servers[transport.sessionId] = server;
        
          log('info', `Successfully connected server for session: ${transport.sessionId}`);
          log('info', `Total active sessions: ${Object.keys(transports).length}`);
        
      } catch (error) {
          log('error', 'Failed to create transport or connect server', { error: error.message, stack: error.stack });
        
        // Make sure we send a proper error response
        if (!res.headersSent) {
          res.status(500).json({ error: "Failed to establish SSE connection", details: error.message });
        }
      }
    });

    app.post("/messages", async (req, res) => {
      const sessionId = req.query.sessionId;
        log('info', `Message received for session: ${sessionId}`);
      
      if (!sessionId) {
          log('error', 'No sessionId provided');
        return res.status(400).json({ error: "Missing sessionId parameter" });
      }

      const transport = transports[sessionId];
      const server = servers[sessionId];

      if (!transport || !server) {
          log('error', `No transport/server found for sessionId: ${sessionId}`);
        return res.status(400).json({ error: "No transport/server found for sessionId" });
      }

      try {
        await transport.handlePostMessage(req, res, req.body);
          log('info', `Successfully handled message for session: ${sessionId}`);
      } catch (error) {
          log('error', `Error handling message for session ${sessionId}`, { error: error.message, stack: error.stack });
        
        // Make sure we send a proper error response if not already sent
        if (!res.headersSent) {
          res.status(500).json({ error: "Failed to handle message", details: error.message });
        }
      }
    });

    // Add a health check endpoint
    app.get("/health", (req, res) => {
      res.json({ 
        status: "ok", 
        activeSessions: Object.keys(transports).length,
        uptime: process.uptime()
      });
    });

    // Graceful shutdown handler
    process.on("SIGINT", async () => {
        log('info', 'Received SIGINT, shutting down gracefully...');
      
      // Close all active sessions
      for (const [sessionId, server] of Object.entries(servers)) {
        try {
            log('info', `Closing server for session: ${sessionId}`);
          await server.close();
        } catch (error) {
            log('error', `Error closing server for session ${sessionId}`, { error: error.message });
        }
      }
      
        log('info', 'All sessions closed, exiting...');
      process.exit(0);
    });

    const port = process.env.PORT || 3001;
    const httpServer = app.listen(port, () => {
        log('info', `SSE Server running on port ${port}`);
        log('info', `Health check available at http://localhost:${port}/health`);
    });

    // Handle server errors
    httpServer.on('error', (error) => {
        log('error', 'HTTP Server Error', { error: error.message });
    });

  } else {
      // stdio mode: single server instance (used by Cursor)
    const server = new Server(
      {
        name: SERVER_NAME,
        version: "0.1.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );
      
      server.onerror = (error) => {
        log('error', 'Stdio server error', { error: error.message, stack: error.stack });
      };
      
    await setupServerHandlers(server, tools);

    process.on("SIGINT", async () => {
        log('info', 'Received SIGINT, closing server...');
      await server.close();
      process.exit(0);
    });

      log('info', 'Connecting to stdio transport...');
    const transport = new StdioServerTransport();
    await server.connect(transport);
      log('info', 'Connected to stdio transport successfully');
    }
  } catch (error) {
    log('error', 'Failed to start server', { error: error.message, stack: error.stack });
    process.exit(1);
  }
}

run().catch((error) => {
  log('error', 'Unhandled error in main', { error: error.message, stack: error.stack });
  process.exit(1);
});