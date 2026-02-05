#!/usr/bin/env node

/**
 * @fileoverview Infura MCP Server - Main server entry point
 *
 * This module implements a Model Context Protocol (MCP) server that provides
 * access to Infura blockchain APIs. The server supports two transport modes:
 *
 * **Transport Modes:**
 * - **stdio**: Standard input/output transport for CLI integration and local development.
 *   Used by MCP clients like Claude Desktop for direct communication.
 * - **HTTP**: Streamable HTTP transport for web-based integrations and remote access.
 *   Supports Server-Sent Events (SSE) for real-time notifications.
 *
 * **Security Features:**
 * - DNS rebinding protection via Host header validation
 * - CORS with configurable origin allowlist
 * - Rate limiting (100 requests/minute per IP)
 * - Security headers (CSP, X-Frame-Options, X-Content-Type-Options, etc.)
 * - Request body size limits (100kb) to prevent DoS
 * - Session timeout and maximum session limits
 * - Server fingerprint prevention (X-Powered-By disabled)
 *
 * **Usage:**
 * - stdio mode: `node mcpServer.js` or `npx infura-mcp-server`
 * - HTTP mode: `node mcpServer.js --http` or `npx infura-mcp-server --http`
 *
 * @module mcpServer
 * @author Qbandev
 * @license MIT
 * @see {@link https://github.com/qbandev/infura-mcp-server} for documentation
 */

import dotenv from "dotenv";
import express from "express";
import rateLimit from "express-rate-limit";
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
import { InfuraApiError, createActionableMessage } from "./lib/errors.js";
import { CHARACTER_LIMIT, truncationMessage } from "./lib/constants.js";
import { discoverTools } from "./lib/tools.js";
import { formatAsMarkdown } from "./lib/formatters.js";

import path from "path";
import { fileURLToPath } from "url";
import { readFileSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, ".env") });

const packageJson = JSON.parse(readFileSync(path.join(__dirname, "package.json"), "utf-8"));

/**
 * The server identifier used in MCP protocol handshakes.
 * @constant {string}
 */
const SERVER_NAME = "infura-mcp-server";

/**
 * The server version, read from package.json for consistency.
 * @constant {string}
 */
const SERVER_VERSION = packageJson.version;

/**
 * Session timeout in milliseconds. Sessions inactive for longer than this
 * duration will be automatically cleaned up. Configurable via SESSION_TIMEOUT_MS
 * environment variable.
 * @constant {number}
 * @default 1800000 (30 minutes)
 */
const SESSION_TIMEOUT_MS = parseInt(process.env.SESSION_TIMEOUT_MS, 10) || 1800000; // 30 minutes

/**
 * Maximum number of concurrent sessions allowed. When this limit is reached,
 * new session requests will receive a 503 Service Unavailable response.
 * Configurable via MAX_SESSIONS environment variable.
 * @constant {number}
 * @default 1000
 */
const MAX_SESSIONS = parseInt(process.env.MAX_SESSIONS, 10) || 1000;

/**
 * List of allowed origins for CORS. Requests from origins not in this list
 * will not receive CORS headers, effectively blocking cross-origin requests
 * from browsers. Configurable via CORS_ALLOWED_ORIGINS environment variable
 * (comma-separated list).
 * @constant {string[]}
 * @default ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000']
 */
const ALLOWED_ORIGINS = process.env.CORS_ALLOWED_ORIGINS?.split(',').map(o => o.trim()) ||
  ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000'];

/**
 * List of allowed hostnames for DNS rebinding protection. Requests with Host
 * headers not matching these values will be rejected with a 403 Forbidden.
 * Configurable via ALLOWED_HOSTS environment variable (comma-separated list).
 * @constant {string[]}
 * @default ['localhost', '127.0.0.1']
 */
const ALLOWED_HOSTS = process.env.ALLOWED_HOSTS?.split(',').map(h => h.trim()) ||
  ['localhost', '127.0.0.1'];

/**
 * Structured logging utility for server events.
 *
 * Outputs JSON-formatted log entries to stdout (info, warn) or stderr (error).
 * Info-level messages are only output when DEBUG environment variable is set.
 * Warning and error messages are always output.
 *
 * @param {('info'|'warn'|'error')} level - The log level
 * @param {string} message - The log message describing the event
 * @param {Object|null} [data=null] - Optional structured data to include in the log entry
 * @returns {void}
 *
 * @example
 * log('info', 'Server started', { port: 3001, transport: 'http' });
 * log('error', 'Connection failed', { error: error.message });
 */
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

/**
 * Transforms internal tool definitions to MCP-compatible tool schemas.
 *
 * Converts the tool format used by the Infura tool discovery system to the
 * format expected by the MCP protocol. Each tool must have a definition
 * with a function property containing name, description, and parameters.
 *
 * @async
 * @param {Array<Object>} tools - Array of tool objects from discoverTools()
 * @param {Object} tools[].definition - The tool definition object
 * @param {Object} tools[].definition.function - Function metadata
 * @param {string} tools[].definition.function.name - The tool name
 * @param {string} tools[].definition.function.description - Human-readable description
 * @param {Object} tools[].definition.function.parameters - JSON Schema for parameters
 * @returns {Promise<Array<Object>>} Array of MCP-formatted tool schemas
 * @returns {string} returns[].name - The tool name
 * @returns {string} returns[].description - Human-readable description
 * @returns {Object} returns[].inputSchema - JSON Schema for input validation
 *
 * @example
 * const mcpTools = await transformTools(tools);
 * // Returns: [{ name: 'eth_getBalance', description: '...', inputSchema: {...} }]
 */
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

/**
 * Registers MCP protocol request handlers on the server instance.
 *
 * Sets up handlers for:
 * - ListToolsRequest: Returns available tools and their schemas
 * - CallToolRequest: Executes a tool and returns the result
 *
 * The handler implements:
 * - Tool discovery and validation
 * - Required parameter validation
 * - Error classification and MCP error code mapping
 * - Response truncation for large results (CHARACTER_LIMIT)
 *
 * @async
 * @param {Server} server - The MCP Server instance to configure
 * @param {Array<Object>} tools - Array of tool objects from discoverTools()
 * @returns {Promise<void>}
 * @throws {McpError} With ErrorCode.MethodNotFound for unknown tools
 * @throws {McpError} With ErrorCode.InvalidParams for missing required parameters
 * @throws {McpError} With ErrorCode.InvalidRequest for auth/permission errors
 * @throws {McpError} With ErrorCode.InternalError for API or execution errors
 *
 * @example
 * const server = createServer();
 * await setupServerHandlers(server, tools);
 */
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

      // Format response based on response_format parameter
      const responseFormat = args.response_format || 'json';
      let textContent;

      if (responseFormat === 'markdown') {
        textContent = formatAsMarkdown(result, toolName);
      } else {
        textContent = JSON.stringify(result, null, 2);
      }

      // Apply character limit
      if (textContent.length > CHARACTER_LIMIT) {
        const truncated = textContent.substring(0, CHARACTER_LIMIT);
        // Determine item count for truncation message
        let itemCount = 1;
        if (result && typeof result === "object" && Array.isArray(result.logs)) {
          // Handle paginated responses like { logs: [...], pagination: {...} }
          itemCount = result.logs.length;
        } else if (Array.isArray(result)) {
          itemCount = result.length;
        }
        textContent = truncated + truncationMessage(
          itemCount,
          CHARACTER_LIMIT
        );
      }

      return {
        content: [{ type: "text", text: textContent }],
      };
    } catch (error) {
      log("error", `Tool execution failed: ${toolName}`, {
        error: error.message,
        stack: error.stack,
        args,
      });

      // Don't re-wrap McpErrors
      if (error instanceof McpError) {
        throw error;
      }

      // Handle validation errors
      if (error instanceof ValidationError) {
        throw new McpError(
          ErrorCode.InvalidParams,
          `Validation error for '${error.field}': ${error.message}`
        );
      }

      // Handle Infura API errors with proper classification
      if (error instanceof InfuraApiError) {
        if (error.httpStatus === 401 || error.httpStatus === 403) {
          throw new McpError(ErrorCode.InvalidRequest, createActionableMessage(error, { network: args.network }));
        }
        throw new McpError(ErrorCode.InternalError, createActionableMessage(error, { network: args.network }));
      }

      // Generic error fallback
      throw new McpError(ErrorCode.InternalError, `API error: ${error.message}`);
    }
  });
}

/**
 * Factory function to create a new MCP Server instance.
 *
 * Creates a server with the configured name, version, and capabilities.
 * The server is configured with tools capability enabled.
 *
 * @returns {Server} A new MCP Server instance ready to be connected to a transport
 *
 * @example
 * const server = createServer();
 * await setupServerHandlers(server, tools);
 * await server.connect(transport);
 */
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

/**
 * Starts the HTTP transport server with full security middleware stack.
 *
 * Creates an Express application with the following middleware chain:
 * 1. Request body size limit (100kb)
 * 2. DNS rebinding protection (Host header validation)
 * 3. Security headers (CSP, X-Frame-Options, etc.)
 * 4. CORS with configurable origin allowlist
 * 5. Rate limiting (100 req/min per IP on /mcp)
 *
 * **Endpoints:**
 * - `GET /` - Server info and documentation links
 * - `GET /health` - Health check with session count and uptime
 * - `GET /mcp` - SSE stream for MCP notifications (requires session)
 * - `POST /mcp` - MCP JSON-RPC requests
 * - `DELETE /mcp` - Terminate a session
 *
 * **Session Management:**
 * - Sessions are created on first POST request
 * - Sessions timeout after SESSION_TIMEOUT_MS of inactivity
 * - Maximum concurrent sessions limited by MAX_SESSIONS
 * - Expired sessions are cleaned up every 5 minutes
 *
 * @async
 * @param {Array<Object>} tools - Array of tool objects from discoverTools()
 * @returns {Promise<import('http').Server>} The HTTP server instance
 *
 * @example
 * const tools = await discoverTools();
 * const httpServer = await runStreamableHttpServer(tools);
 * // Server is now listening on PORT (default 3001)
 */
async function runStreamableHttpServer(tools) {
  const app = express();

  // Disable X-Powered-By header to prevent server fingerprinting
  app.disable('x-powered-by');

  // Request body size limit to prevent DoS attacks
  app.use(express.json({ limit: '100kb' }));

  /**
   * Session storage mapping session IDs to session objects.
   * @type {Map<string, {server: Server, transport: StreamableHTTPServerTransport, createdAt: number, lastActivity: number}>}
   */
  const sessions = new Map();

  /**
   * Session cleanup interval - removes expired sessions every 5 minutes.
   * Sessions are considered expired if they haven't had activity within
   * SESSION_TIMEOUT_MS milliseconds. The interval is unreffed to allow
   * the process to exit cleanly.
   */
  const sessionCleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [sessionId, session] of sessions.entries()) {
      if (now - session.createdAt > SESSION_TIMEOUT_MS) {
        try {
          session.transport.close();
          session.server.close();
        } catch (error) {
          log("error", `Error closing expired session ${sessionId}`, { error: error.message });
        }
        sessions.delete(sessionId);
        log("info", "Expired session cleaned up", { sessionId });
      }
    }
  }, 300000); // Run every 5 minutes

  // Ensure cleanup interval doesn't prevent process exit
  sessionCleanupInterval.unref();

  /**
   * Rate limiter middleware for the /mcp endpoint.
   * Limits each IP to 100 requests per minute to prevent abuse.
   * Uses X-Forwarded-For header when behind a proxy.
   */
  const mcpRateLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 100, // 100 requests per minute per IP
    message: { error: "Too many requests, please try again later" },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
      // Use X-Forwarded-For if behind a proxy, otherwise use IP
      return req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip;
    },
  });

  /**
   * DNS rebinding protection middleware.
   * Validates the Host header against ALLOWED_HOSTS to prevent DNS rebinding attacks.
   * Rejects requests with missing or invalid Host headers with 403 Forbidden.
   */
  app.use((req, res, next) => {
    const host = req.headers.host;
    if (!host) {
      log("warn", "Request missing Host header", { ip: req.ip });
      return res.status(403).json({ error: "Forbidden: Missing Host header" });
    }

    // Extract hostname (remove port if present)
    const hostname = host.split(':')[0];

    // Check if the hostname is in the allowed list
    if (!ALLOWED_HOSTS.includes(hostname)) {
      log("warn", "DNS rebinding attempt blocked", { host, ip: req.ip });
      return res.status(403).json({ error: "Forbidden: Invalid Host header" });
    }

    next();
  });

  /**
   * Security headers middleware.
   * Sets various security-related HTTP headers:
   * - X-Content-Type-Options: nosniff - Prevents MIME type sniffing
   * - X-Frame-Options: DENY - Prevents clickjacking
   * - Content-Security-Policy: Strict CSP for API server
   * - Referrer-Policy: no-referrer - Prevents referrer leakage
   * - Permissions-Policy: Disables unnecessary browser features
   * - Cache-Control: no-store - Prevents caching of sensitive responses
   */
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
    // Prevent caching of sensitive API responses
    res.header("Cache-Control", "no-store");
    next();
  });

  /**
   * CORS middleware with configurable origin allowlist.
   * Only sets Access-Control-Allow-Origin for origins in ALLOWED_ORIGINS.
   * Handles preflight OPTIONS requests automatically.
   * Sets Vary: Origin header for proper cache behavior.
   */
  app.use((req, res, next) => {
    const origin = req.headers.origin;

    // Check if the request origin is in the allowed list
    if (origin && ALLOWED_ORIGINS.includes(origin)) {
      res.header("Access-Control-Allow-Origin", origin);
      res.header("Access-Control-Allow-Credentials", "true");
    }
    // For requests without origin (e.g., same-origin, curl, etc.) - allow if no origin header
    // This is safe because the Host header validation already protects against DNS rebinding

    res.header("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
    res.header(
      "Access-Control-Allow-Headers",
      "Content-Type, Accept, Mcp-Session-Id, Last-Event-ID"
    );
    res.header("Access-Control-Expose-Headers", "Mcp-Session-Id");
    res.header("Vary", "Origin");

    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });

  /**
   * Main MCP endpoint handler.
   * Supports GET (SSE stream), POST (JSON-RPC), and DELETE (session termination).
   * Rate limited to 100 requests per minute per IP.
   */
  app.all("/mcp", mcpRateLimiter, async (req, res) => {
    const sessionId = req.headers["mcp-session-id"];

    if (req.method === "GET") {
      log("info", "GET /mcp - Opening stream for notifications", { sessionId });

      if (!sessionId || !sessions.has(sessionId)) {
        return res.status(400).json({ error: "Invalid or missing session ID" });
      }

      // Update session activity timestamp
      const session = sessions.get(sessionId);
      session.lastActivity = Date.now();

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
        // Update session activity timestamp
        session.lastActivity = Date.now();
      } else {
        // Check session limit before creating new session
        if (sessions.size >= MAX_SESSIONS) {
          log("warn", "Max sessions reached, rejecting new session", {
            currentSessions: sessions.size,
            maxSessions: MAX_SESSIONS,
            ip: req.ip,
          });
          return res.status(503).json({
            error: "Service temporarily unavailable: maximum sessions reached. Please try again later.",
          });
        }

        server = createServer();
        await setupServerHandlers(server, tools);

        transport = new StreamableHTTPServerTransport({
          sessionIdGenerator: () => randomUUID(),
          onsessioninitialized: (newSessionId) => {
            log("info", "New session initialized", { sessionId: newSessionId });
            sessions.set(newSessionId, {
              server,
              transport,
              createdAt: Date.now(),
              lastActivity: Date.now(),
            });
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

  /**
   * Health check endpoint.
   * Returns server status, version, transport type, active session count, and uptime.
   */
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

  /**
   * Root endpoint.
   * Returns server information and documentation links.
   */
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

  /**
   * Graceful shutdown handler.
   * Stops accepting new connections, closes all active MCP sessions,
   * and exits with appropriate status code.
   * @async
   * @returns {Promise<void>}
   */
  const shutdown = async () => {
    log("info", "Shutting down gracefully...");
    let hasErrors = false;

    // Stop accepting new connections
    await new Promise((resolve) => httpServer.close(resolve));
    log("info", "HTTP server closed, no new connections accepted");

    // Close all MCP sessions
    for (const [sessionId, session] of sessions.entries()) {
      try {
        await session.transport.close();
        await session.server.close();
      } catch (error) {
        hasErrors = true;
        log("error", `Error closing session ${sessionId}`, { error: error.message });
      }
    }

    log("info", "All sessions closed", { hasErrors });
    process.exit(hasErrors ? 1 : 0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

  return httpServer;
}

/**
 * Starts the stdio transport server for CLI integration.
 *
 * Creates an MCP server that communicates over standard input/output streams.
 * This mode is used by MCP clients like Claude Desktop for direct process
 * communication without network overhead.
 *
 * Features:
 * - Direct stdin/stdout communication
 * - Graceful shutdown on SIGINT
 * - Error logging to stderr
 *
 * @async
 * @param {Array<Object>} tools - Array of tool objects from discoverTools()
 * @returns {Promise<void>} Resolves when the server is connected and ready
 *
 * @example
 * const tools = await discoverTools();
 * await runStdioServer(tools);
 * // Server is now listening on stdin/stdout
 */
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

/**
 * Main entry point for the MCP server.
 *
 * Parses command-line arguments to determine transport mode:
 * - `--http` flag: Starts HTTP transport server
 * - No flag (default): Starts stdio transport server
 *
 * Initializes the tool discovery system and starts the appropriate server.
 * Exits with code 1 on startup failure.
 *
 * @async
 * @returns {Promise<void>}
 * @throws {Error} Logs error and exits process on failure
 *
 * @example
 * // Start in stdio mode (default)
 * // $ node mcpServer.js
 *
 * // Start in HTTP mode
 * // $ node mcpServer.js --http
 */
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
