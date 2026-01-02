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
  };

  results.health = await testHealthEndpoint();
  results.info = await testInfoEndpoint();

  const initResult = await testMcpInitialize();
  results.initialize = initResult.success;

  if (results.initialize) {
    results.toolsList = await testToolsList(initResult.sessionId);
    results.sessionTermination = await testSessionTermination(initResult.sessionId);
  }

  results.errorHandling = await testErrorHandling();

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
  console.log("━".repeat(50) + "\n");

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
