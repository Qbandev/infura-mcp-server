#!/usr/bin/env node

/**
 * Unit Tests for Tool Parameter Defaults
 * Tests that tools use correct default values when optional parameters are omitted
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Test results tracking
let passed = 0;
let failed = 0;

async function testAsync(name, fn) {
  try {
    await fn();
    passed++;
    console.log(`✅ ${name}`);
  } catch (error) {
    failed++;
    console.log(`❌ ${name}`);
    console.log(`   Error: ${error.message}`);
  }
}

function assertEqual(actual, expected, message = '') {
  if (actual !== expected) {
    throw new Error(`${message} Expected: ${JSON.stringify(expected)}, Actual: ${JSON.stringify(actual)}`);
  }
}

console.log('Testing tool parameter defaults...\n');

// ============================================
// eth_getBalance Default Tag Tests
// ============================================

console.log('--- eth_getBalance Default Tag Tests ---\n');

await testAsync('eth_getBalance: uses "latest" as default tag when not provided', async () => {
  // Dynamically import the eth-get-balance module
  const toolPath = join(__dirname, '../tools/eth-get-balance.js');
  const { apiTool } = await import(`${toolPath}?t=${Date.now()}`);

  // Verify via the tool's schema that default is 'latest'
  const tagParam = apiTool.definition.function.parameters.properties.tag;

  assertEqual(tagParam.default, 'latest', 'Tag parameter should default to "latest"');
});

await testAsync('eth_getBalance: schema marks tag as not required', async () => {
  const toolPath = join(__dirname, '../tools/eth-get-balance.js');
  const { apiTool } = await import(`${toolPath}?t=${Date.now()}`);

  const required = apiTool.definition.function.parameters.required;

  // Tag should NOT be in the required array
  const tagIsRequired = required && required.includes('tag');
  assertEqual(tagIsRequired, false, 'Tag should not be required');
});

await testAsync('eth_getBalance: only address is required', async () => {
  const toolPath = join(__dirname, '../tools/eth-get-balance.js');
  const { apiTool } = await import(`${toolPath}?t=${Date.now()}`);

  const required = apiTool.definition.function.parameters.required;

  assertEqual(Array.isArray(required), true, 'Required should be an array');
  assertEqual(required.length, 1, 'Should have exactly 1 required parameter');
  assertEqual(required[0], 'address', 'Address should be the only required parameter');
});

await testAsync('eth_getBalance: network also has default value', async () => {
  const toolPath = join(__dirname, '../tools/eth-get-balance.js');
  const { apiTool } = await import(`${toolPath}?t=${Date.now()}`);

  const networkParam = apiTool.definition.function.parameters.properties.network;

  assertEqual(networkParam.default, 'mainnet', 'Network parameter should default to "mainnet"');
});

// ============================================
// Verify Default Applied in Function Signature
// ============================================

console.log('\n--- Function Signature Defaults Test ---\n');

await testAsync('eth_getBalance: function applies default tag="latest" in signature', async () => {
  // This test verifies the JS function signature has the default
  // by checking the source code pattern
  const fs = await import('fs');
  const toolPath = join(__dirname, '../tools/eth-get-balance.js');
  const source = fs.readFileSync(toolPath, 'utf-8');

  // Look for the default parameter pattern: tag = "latest"
  const hasDefaultTag = source.includes('tag = "latest"') || source.includes("tag = 'latest'");
  assertEqual(hasDefaultTag, true, 'Function signature should have tag = "latest" default');
});

await testAsync('eth_getBalance: function applies default network="mainnet" in signature', async () => {
  const fs = await import('fs');
  const toolPath = join(__dirname, '../tools/eth-get-balance.js');
  const source = fs.readFileSync(toolPath, 'utf-8');

  // Look for the default parameter pattern: network = "mainnet"
  const hasDefaultNetwork = source.includes('network = "mainnet"') || source.includes("network = 'mainnet'");
  assertEqual(hasDefaultNetwork, true, 'Function signature should have network = "mainnet" default');
});

// ============================================
// Summary
// ============================================

console.log('\n' + '═'.repeat(50));
console.log(`TOOL DEFAULTS TESTS: ${passed} passed, ${failed} failed`);
console.log('═'.repeat(50) + '\n');

process.exit(failed > 0 ? 1 : 0);
