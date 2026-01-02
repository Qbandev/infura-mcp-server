#!/usr/bin/env node

import dotenv from "dotenv";
import express from "express";
import { randomUUID } from "crypto";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import { ValidationError } from "./lib/validators.js";
import { discoverTools } from "./lib/tools.js";

import path from "path";
import { fileURLToPath } from "url";
import { readFileSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, ".env") });

const packageJson = JSON.parse(readFileSync(path.join(__dirname, "package.json"), "utf-8"));
const SERVER_NAME = "infura-mcp-server";
const SERVER_VERSION = packageJson.version;

function log(level, message, data = null) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level: level.toUpperCase(),
    message,
    ...(data && { data }),
  };

  if (level === "error") {
    console.error(JSON.stringify(logEntry));
  } else if (process.env.DEBUG || level === "warn") {
    console.log(JSON.stringify(logEntry));
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

    log("info", `Tool call received: ${toolName}`, { args });

    const tool = tools.find((t) => t.definition.function.name === toolName);
    if (!tool) {
      log("error", `Unknown tool requested: ${toolName}`);
      throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${toolName}`);
    }

    const requiredParameters =
      tool.definition?.function?.parameters?.required || [];
    for (const requiredParameter of requiredParameters) {
      if (!(requiredParameter in args)) {
        log("error", `Missing required parameter: ${requiredParameter}`, {
          toolName,
          args,
        });
        throw new McpError(
          ErrorCode.InvalidParams,
          `Missing required parameter: ${requiredParameter}`
        );
      }
    }

    try {
      log("info", `Executing tool: ${toolName}`);
      const result = await tool.function(args);
      log("info", `Tool execution successful: ${toolName}`);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      log("error", `Tool execution failed: ${toolName}`, {
        error: error.message,
        stack: error.stack,
        args,
      });

      // Handle validation errors with proper error code
      if (error instanceof ValidationError) {
        throw new McpError(ErrorCode.InvalidParams, error.message);
      }

      if (error.message.includes("rate limit")) {
        throw new McpError(
          ErrorCode.InternalError,
          `Infura API rate limit exceeded. Please try again in a moment.`
        );
      } else if (error.message.includes("timeout")) {
        throw new McpError(
          ErrorCode.InternalError,
          `Request timeout. The Ethereum network might be busy.`
        );
      } else if (error.message.includes("INFURA_API_KEY")) {
        throw new McpError(
          ErrorCode.InternalError,
          `Infura API configuration error. Please check your API key.`
        );
      } else {
        throw new McpError(ErrorCode.InternalError, `API error: ${error.message}`);
      }
    }
  });
}

function createServer() {
  return new Server(
    {
      name: SERVER_NAME,
      version: SERVER_VERSION,
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );
}

async function runStreamableHttpServer(tools) {
  const app = express();
  
  // Disable X-Powered-By header to prevent server fingerprinting
  app.disable('x-powered-by');
  
  app.use(express.json());

  const sessions = new Map();

  // Security headers middleware
  app.use((req, res, next) => {
    // Prevent MIME type sniffing
    res.header("X-Content-Type-Options", "nosniff");
    // Prevent clickjacking
    res.header("X-Frame-Options", "DENY");
    // Content Security Policy - API server, no scripts
    res.header("Content-Security-Policy", "default-src 'none'; frame-ancestors 'none'");
    // Referrer policy
    res.header("Referrer-Policy", "no-referrer");
    // Permissions policy - disable unnecessary features
    res.header("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
    next();
  });

  // CORS middleware
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
    res.header(
      "Access-Control-Allow-Headers",
      "Content-Type, Accept, Mcp-Session-Id, Last-Event-ID"
    );
    res.header("Access-Control-Expose-Headers", "Mcp-Session-Id");
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });

  app.all("/mcp", async (req, res) => {
    const sessionId = req.headers["mcp-session-id"];

    if (req.method === "GET") {
      log("info", "GET /mcp - Opening stream for notifications", { sessionId });

      if (!sessionId || !sessions.has(sessionId)) {
        return res.status(400).json({ error: "Invalid or missing session ID" });
      }

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      
      // Flush headers to establish event stream connection immediately
      res.flushHeaders();
      res.write(": connected\n\n");

      const keepAlive = setInterval(() => {
        // Check if response is still writable before sending keep-alive
        if (res.writableEnded || res.destroyed) {
          clearInterval(keepAlive);
          return;
        }
        try {
          res.write(": keep-alive\n\n");
        } catch (error) {
          clearInterval(keepAlive);
          log("error", "Error writing keep-alive", { sessionId, error: error.message });
        }
      }, 30000);

      // Single close handler for cleanup and logging
      req.on("close", () => {
        clearInterval(keepAlive);
        log("info", "Stream closed", { sessionId });
      });

      return;

    } else if (req.method === "POST") {
      log("info", "POST /mcp - Received request", { sessionId, body: req.body });

      let transport;
      let server;

      if (sessionId && sessions.has(sessionId)) {
        const session = sessions.get(sessionId);
        transport = session.transport;
        server = session.server;
      } else {
        server = createServer();
        await setupServerHandlers(server, tools);

        transport = new StreamableHTTPServerTransport({
          sessionIdGenerator: () => randomUUID(),
          onsessioninitialized: (newSessionId) => {
            log("info", "New session initialized", { sessionId: newSessionId });
            sessions.set(newSessionId, { server, transport });
          },
        });

        transport.onclose = () => {
          const sid = transport.sessionId;
          if (sid && sessions.has(sid)) {
            sessions.delete(sid);
            log("info", "Session closed and cleaned up", { sessionId: sid });
          }
        };

        await server.connect(transport);
      }

      try {
        await transport.handleRequest(req, res, req.body);
      } catch (error) {
        log("error", "Error handling request", { error: error.message, sessionId });
        if (!res.headersSent) {
          res.status(500).json({ error: "Internal server error" });
        }
      }

    } else if (req.method === "DELETE") {
      if (sessionId && sessions.has(sessionId)) {
        const session = sessions.get(sessionId);
        try {
          await session.transport.close();
          await session.server.close();
        } catch (error) {
          log("error", "Error closing session", { error: error.message, sessionId });
        }
        sessions.delete(sessionId);
        log("info", "Session terminated", { sessionId });
        res.status(200).json({ message: "Session terminated" });
      } else {
        res.status(404).json({ error: "Session not found" });
      }
    } else {
      // Return 405 for unsupported HTTP methods
      res.set("Allow", "GET, POST, DELETE, OPTIONS");
      res.status(405).json({ error: "Method Not Allowed" });
    }
  });

  app.get("/health", (req, res) => {
    res.json({
      status: "ok",
      server: SERVER_NAME,
      version: SERVER_VERSION,
      transport: "streamable-http",
      activeSessions: sessions.size,
      uptime: process.uptime(),
    });
  });

  app.get("/", (req, res) => {
    res.json({
      name: SERVER_NAME,
      version: SERVER_VERSION,
      description: "Infura MCP Server - Ethereum blockchain access via MCP",
      endpoints: {
        mcp: "/mcp",
        health: "/health",
      },
      documentation: "https://github.com/qbandev/infura-mcp-server",
    });
  });

  const shutdown = async () => {
    log("info", "Shutting down gracefully...");
    
    for (const [sessionId, session] of sessions.entries()) {
      try {
        await session.transport.close();
        await session.server.close();
      } catch (error) {
        log("error", `Error closing session ${sessionId}`, { error: error.message });
      }
    }

    log("info", "All sessions closed");
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

  const port = process.env.PORT || 3001;
  const httpServer = app.listen(port, () => {
    log("info", `Streamable HTTP server running on port ${port}`);
    console.log(`\n🚀 Infura MCP Server v${SERVER_VERSION}`);
    console.log(`   Streamable HTTP: http://localhost:${port}/mcp`);
    console.log(`   Health:          http://localhost:${port}/health\n`);
  });

  httpServer.on("error", (error) => {
    log("error", "HTTP server error", { error: error.message });
  });

  return httpServer;
}

async function runStdioServer(tools) {
  const server = createServer();

  server.onerror = (error) => {
    log("error", "Stdio server error", { error: error.message, stack: error.stack });
  };

  await setupServerHandlers(server, tools);

  process.on("SIGINT", async () => {
    log("info", "Received SIGINT, closing server...");
    await server.close();
    process.exit(0);
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
  log("info", "Connected to stdio transport");
}

async function run() {
  const args = process.argv.slice(2);
  const isHTTP = args.includes("--http");

  log("info", `Starting MCP server in ${isHTTP ? "HTTP" : "stdio"} mode`);

  try {
    const tools = await discoverTools();
    log("info", `Loaded ${tools.length} tools successfully`);

    if (isHTTP) {
      await runStreamableHttpServer(tools);
    } else {
      await runStdioServer(tools);
    }
  } catch (error) {
    log("error", "Failed to start server", {
      error: error.message,
      stack: error.stack,
    });
    process.exit(1);
  }
}

run().catch((error) => {
  log("error", "Unhandled error in main", {
    error: error.message,
    stack: error.stack,
  });
  process.exit(1);
});
