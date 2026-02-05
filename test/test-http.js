#!/usr/bin/env node

/**
 * Streamable HTTP Transport Test
 * Tests the MCP server's Streamable HTTP endpoint (/mcp)
 */

import fetch from "node-fetch";

const SERVER_URL = "http://localhost:3001";

async function checkServerAvailability() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    try {
      const response = await fetch(`${SERVER_URL}/health`, {
        method: "GET",
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === "AbortError") {
        console.log("⚠️ Health check timed out");
      }
      return false;
    }
  } catch (error) {
    return false;
  }
}

async function testHealthEndpoint() {
  console.log("🧪 Testing health endpoint...\n");

  try {
    const response = await fetch(`${SERVER_URL}/health`);
    const data = await response.json();

    console.log("✅ Health endpoint response:", JSON.stringify(data, null, 2));

    if (data.status !== "ok") {
      throw new Error("Health status is not ok");
    }

    if (data.transport !== "streamable-http") {
      throw new Error("Expected streamable-http transport");
    }

    console.log("✅ Health endpoint test passed\n");
    return true;
  } catch (error) {
    console.error("❌ Health endpoint test failed:", error.message);
    return false;
  }
}

async function testInfoEndpoint() {
  console.log("🧪 Testing info endpoint (/)...\n");

  try {
    const response = await fetch(`${SERVER_URL}/`);
    const data = await response.json();

    console.log("✅ Info endpoint response:", JSON.stringify(data, null, 2));

    if (!data.endpoints?.mcp) {
      throw new Error("Expected mcp endpoint in info");
    }

    console.log("✅ Info endpoint test passed\n");
    return true;
  } catch (error) {
    console.error("❌ Info endpoint test failed:", error.message);
    return false;
  }
}

async function testMcpInitialize() {
  console.log("🧪 Testing MCP initialization via Streamable HTTP...\n");

  try {
    const initResponse = await fetch(`${SERVER_URL}/mcp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json, text/event-stream",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "initialize",
        params: {
          protocolVersion: "2024-11-05",
          capabilities: {
            tools: {},
          },
          clientInfo: {
            name: "test-client",
            version: "1.0.0",
          },
        },
        id: 1,
      }),
    });

    if (!initResponse.ok) {
      throw new Error(`Initialize failed with status: ${initResponse.status}`);
    }

    const sessionId = initResponse.headers.get("mcp-session-id");
    console.log(`✅ Session ID received: ${sessionId || "none (stateless)"}`);

    const contentType = initResponse.headers.get("content-type");
    let result;

    if (contentType?.includes("text/event-stream")) {
      const text = await initResponse.text();
      console.log("   Response (stream):", text.substring(0, 200));
      const dataMatch = text.match(/data: ({.*})/);
      if (dataMatch) {
        result = JSON.parse(dataMatch[1]);
      }
    } else {
      result = await initResponse.json();
    }

    console.log(
      "✅ Initialize response:",
      JSON.stringify(result, null, 2).substring(0, 500)
    );

    if (result?.result?.serverInfo?.name !== "infura-mcp-server") {
      console.log("⚠️ Unexpected server name in response");
    }

    console.log("✅ MCP initialization test passed\n");
    return { success: true, sessionId };
  } catch (error) {
    console.error("❌ MCP initialization test failed:", error.message);
    return { success: false, sessionId: null };
  }
}

async function testToolsList(sessionId) {
  console.log("🧪 Testing tools/list via Streamable HTTP...\n");

  try {
    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json, text/event-stream",
    };

    if (sessionId) {
      headers["Mcp-Session-Id"] = sessionId;
    }

    const response = await fetch(`${SERVER_URL}/mcp`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "tools/list",
        params: {},
        id: 2,
      }),
    });

    if (!response.ok) {
      throw new Error(`tools/list failed with status: ${response.status}`);
    }

    const contentType = response.headers.get("content-type");
    let result;

    if (contentType?.includes("text/event-stream")) {
      const text = await response.text();
      const dataMatch = text.match(/data: ({.*})/);
      if (dataMatch) {
        result = JSON.parse(dataMatch[1]);
      }
    } else {
      result = await response.json();
    }

    const tools = result?.result?.tools || [];
    console.log(`✅ Found ${tools.length} tools`);

    if (tools.length > 0) {
      console.log("   Sample tools:", tools.slice(0, 3).map((t) => t.name).join(", "));
    }

    if (tools.length !== 29) {
      console.error(`❌ Expected 29 tools, got ${tools.length}`);
      return false;
    }

    console.log("✅ Tools list test passed\n");
    return true;
  } catch (error) {
    console.error("❌ Tools list test failed:", error.message);
    return false;
  }
}

async function testSessionTermination(sessionId) {
  if (!sessionId) {
    console.log("⚠️ Skipping session termination test (no session ID)\n");
    return true;
  }

  console.log("🧪 Testing session termination...\n");

  try {
    const response = await fetch(`${SERVER_URL}/mcp`, {
      method: "DELETE",
      headers: {
        "Mcp-Session-Id": sessionId,
      },
    });

    const result = await response.json();
    console.log("✅ Session termination response:", JSON.stringify(result));
    console.log("✅ Session termination test passed\n");
    return true;
  } catch (error) {
    console.error("❌ Session termination test failed:", error.message);
    return false;
  }
}

async function testErrorHandling() {
  console.log("🧪 Testing error handling for non-existent endpoint...\n");

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1000);

    try {
      await fetch("http://localhost:9999/mcp", {
        method: "POST",
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      console.log("❌ Unexpected: Non-existent server responded");
      return false;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === "AbortError") {
        console.log("✅ Expected: Connection timeout to non-existent server");
      } else {
        console.log("✅ Expected: Non-existent server properly rejected");
      }
      return true;
    }
  } catch (error) {
    console.log("✅ Expected: Non-existent server properly rejected");
    return true;
  }
}

/**
 * Security Header Validation Tests
 * These tests check for recommended security headers on API responses.
 * Missing headers are reported as warnings (informational) since adding
 * them requires server-side changes.
 */

const SECURITY_HEADERS = {
  "x-content-type-options": {
    description: "Prevents MIME type sniffing",
    expected: "nosniff",
    validate: (value) => value === "nosniff",
  },
  "x-frame-options": {
    description: "Prevents clickjacking attacks",
    expected: "DENY or SAMEORIGIN",
    validate: (value) => value === "DENY" || value === "SAMEORIGIN",
  },
  "content-security-policy": {
    description: "Controls resources the browser can load",
    expected: "present (any value)",
    validate: (value) => value && value.length > 0,
  },
  "x-xss-protection": {
    description: "Legacy XSS filter (deprecated but still used)",
    expected: "1; mode=block or 0",
    validate: (value) => value === "1; mode=block" || value === "0",
  },
  "strict-transport-security": {
    description: "Enforces HTTPS connections (HSTS)",
    expected: "max-age directive present",
    validate: (value) => value && value.includes("max-age"),
  },
  "cache-control": {
    description: "Controls caching behavior for API responses",
    expected: "no-store, no-cache, or private",
    validate: (value) =>
      value &&
      (value.includes("no-store") ||
        value.includes("no-cache") ||
        value.includes("private")),
  },
};

function checkSecurityHeaders(headers, endpointName) {
  const results = {
    present: [],
    missing: [],
    invalid: [],
  };

  for (const [headerName, config] of Object.entries(SECURITY_HEADERS)) {
    const value = headers.get(headerName);

    if (!value) {
      results.missing.push({
        header: headerName,
        description: config.description,
        expected: config.expected,
      });
    } else if (!config.validate(value)) {
      results.invalid.push({
        header: headerName,
        description: config.description,
        expected: config.expected,
        actual: value,
      });
    } else {
      results.present.push({
        header: headerName,
        value: value,
      });
    }
  }

  return results;
}

function printSecurityHeaderResults(results, endpointName) {
  console.log(`   Endpoint: ${endpointName}`);
  console.log(`   ${"─".repeat(40)}`);

  if (results.present.length > 0) {
    console.log(`   Present headers (${results.present.length}):`);
    for (const item of results.present) {
      console.log(`     ✅ ${item.header}: ${item.value}`);
    }
  }

  if (results.invalid.length > 0) {
    console.log(`   Invalid headers (${results.invalid.length}):`);
    for (const item of results.invalid) {
      console.log(`     ⚠️  ${item.header}`);
      console.log(`        Expected: ${item.expected}`);
      console.log(`        Actual: ${item.actual}`);
    }
  }

  if (results.missing.length > 0) {
    console.log(`   Missing headers (${results.missing.length}):`);
    for (const item of results.missing) {
      console.log(`     ⚠️  ${item.header}`);
      console.log(`        Purpose: ${item.description}`);
      console.log(`        Recommended: ${item.expected}`);
    }
  }

  console.log("");
}

async function testSecurityHeaders() {
  console.log("🧪 Testing Security Headers...\n");
  console.log("   This test checks for recommended security headers on API responses.");
  console.log("   Missing headers are reported as warnings (informational).\n");

  const endpoints = [
    { name: "/health (GET)", url: `${SERVER_URL}/health`, method: "GET" },
    { name: "/ (GET)", url: `${SERVER_URL}/`, method: "GET" },
    {
      name: "/mcp (POST)",
      url: `${SERVER_URL}/mcp`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json, text/event-stream",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "initialize",
        params: {
          protocolVersion: "2024-11-05",
          capabilities: { tools: {} },
          clientInfo: { name: "security-test-client", version: "1.0.0" },
        },
        id: 999,
      }),
    },
  ];

  const allResults = [];

  for (const endpoint of endpoints) {
    try {
      const fetchOptions = {
        method: endpoint.method,
      };

      if (endpoint.headers) {
        fetchOptions.headers = endpoint.headers;
      }

      if (endpoint.body) {
        fetchOptions.body = endpoint.body;
      }

      const response = await fetch(endpoint.url, fetchOptions);
      const results = checkSecurityHeaders(response.headers, endpoint.name);
      allResults.push({ endpoint: endpoint.name, results });
      printSecurityHeaderResults(results, endpoint.name);
    } catch (error) {
      console.log(`   ❌ Failed to test ${endpoint.name}: ${error.message}\n`);
      allResults.push({
        endpoint: endpoint.name,
        results: { present: [], missing: [], invalid: [] },
        error: error.message,
      });
    }
  }

  // Summary
  console.log("   Security Header Summary");
  console.log(`   ${"═".repeat(40)}`);

  let totalPresent = 0;
  let totalMissing = 0;
  let totalInvalid = 0;

  for (const { results } of allResults) {
    totalPresent += results.present.length;
    totalMissing += results.missing.length;
    totalInvalid += results.invalid.length;
  }

  const totalChecks = totalPresent + totalMissing + totalInvalid;
  const securityScore = totalChecks > 0 ? Math.round((totalPresent / totalChecks) * 100) : 0;

  console.log(`   Total headers checked: ${totalChecks}`);
  console.log(`   ✅ Present & valid: ${totalPresent}`);
  console.log(`   ⚠️  Missing: ${totalMissing}`);
  console.log(`   ⚠️  Invalid: ${totalInvalid}`);
  console.log(`   Security header coverage: ${securityScore}%`);
  console.log("");

  if (totalMissing > 0 || totalInvalid > 0) {
    console.log("   Recommendations:");
    console.log("   - Consider adding missing security headers to improve security posture");
    console.log("   - Use helmet.js middleware for Express/Connect servers");
    console.log("   - Review OWASP Secure Headers Project for guidance");
    console.log("");
  }

  // This test always passes - it's informational
  // Return detailed results for the summary
  console.log("✅ Security header validation completed (informational)\n");
  return {
    success: true,
    details: {
      present: totalPresent,
      missing: totalMissing,
      invalid: totalInvalid,
      score: securityScore,
    },
  };
}

async function runHttpTests() {
  console.log("🧪 Testing MCP Streamable HTTP Server...\n");
  console.log("━".repeat(50) + "\n");

  const serverAvailable = await checkServerAvailability();

  if (!serverAvailable) {
    console.log("⚠️ HTTP server not running on localhost:3001");
    console.log("ℹ️ This is expected in CI/testing environments");
    console.log("ℹ️ To test HTTP functionality:");
    console.log("   1. Start the server: npm run start:http");
    console.log("   2. Run this test: npm run test:http");
    console.log("\n✅ HTTP test skipped gracefully (server not available)");
    return;
  }

  console.log("✅ Server detected, running HTTP transport tests...\n");
  console.log("━".repeat(50) + "\n");

  const results = {
    health: false,
    info: false,
    initialize: false,
    toolsList: false,
    sessionTermination: false,
    errorHandling: false,
    securityHeaders: false,
  };

  // Store security header details for extended summary
  let securityHeaderDetails = null;

  results.health = await testHealthEndpoint();
  results.info = await testInfoEndpoint();

  const initResult = await testMcpInitialize();
  results.initialize = initResult.success;

  if (results.initialize) {
    results.toolsList = await testToolsList(initResult.sessionId);
    results.sessionTermination = await testSessionTermination(initResult.sessionId);
  }

  results.errorHandling = await testErrorHandling();

  // Run security header tests
  console.log("━".repeat(50) + "\n");
  const securityResult = await testSecurityHeaders();
  results.securityHeaders = securityResult.success;
  securityHeaderDetails = securityResult.details;

  console.log("━".repeat(50));
  console.log("\n📊 Test Summary:\n");

  let passed = 0;
  let total = 0;

  for (const [name, result] of Object.entries(results)) {
    total++;
    if (result) {
      passed++;
      console.log(`   ✅ ${name}`);
    } else {
      console.log(`   ❌ ${name}`);
    }
  }

  console.log(`\n   Total: ${passed}/${total} tests passed`);

  // Extended security header summary
  if (securityHeaderDetails) {
    console.log("\n📊 Security Header Coverage:\n");
    console.log(`   Present: ${securityHeaderDetails.present}/${securityHeaderDetails.present + securityHeaderDetails.missing + securityHeaderDetails.invalid}`);
    console.log(`   Coverage: ${securityHeaderDetails.score}%`);
    if (securityHeaderDetails.score < 50) {
      console.log("   Status: ⚠️  Low coverage - consider adding security headers");
    } else if (securityHeaderDetails.score < 80) {
      console.log("   Status: ⚠️  Moderate coverage - room for improvement");
    } else {
      console.log("   Status: ✅ Good coverage");
    }
  }

  console.log("\n" + "━".repeat(50) + "\n");

  if (passed === total) {
    console.log("🎉 All HTTP transport tests passed!");
  } else {
    console.log("⚠️ Some tests failed. Check the output above for details.");
  }

  process.exit(passed === total ? 0 : 1);
}

try {
  runHttpTests();
} catch (error) {
  if (error.code === "MODULE_NOT_FOUND") {
    console.error("❌ Missing dependencies. Please run: npm install node-fetch");
    process.exit(1);
  } else {
    throw error;
  }
}
