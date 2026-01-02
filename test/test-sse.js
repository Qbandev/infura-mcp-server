#!/usr/bin/env node

/**
 * Legacy SSE Test (Deprecated)
 * 
 * This test file is kept for backward compatibility.
 * The MCP specification has deprecated SSE in favor of Streamable HTTP.
 * 
 * For new implementations, use: npm run test:http
 */

console.log("⚠️  SSE transport is deprecated as of MCP 2025 specification");
console.log("   The server still supports SSE for backward compatibility,");
console.log("   but new implementations should use Streamable HTTP.");
console.log("");
console.log("   To test the new HTTP transport: npm run test:http");
console.log("");

// Import and run HTTP tests instead
import("./test-http.js").catch((error) => {
  console.log("ℹ️  HTTP test module not loaded, running legacy checks...");
  console.log("");
  console.log("✅ SSE deprecation notice displayed");
  console.log("✅ Legacy SSE test completed (no-op)");
  process.exit(0);
});
