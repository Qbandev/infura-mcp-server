#!/usr/bin/env node

/**
 * Unit Tests for Infura Client
 * Tests the callInfura function for various scenarios including error handling
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Store original fetch, env, and console.error for restoration
const originalFetch = global.fetch;
const originalEnv = { ...process.env };
const originalConsoleError = console.error;

// Test results tracking
const results = {
  total: 0,
  passed: 0,
  failed: 0,
  errors: []
};

/**
 * Mock fetch function creator
 * @param {object} options - Mock options
 * @returns {Function} Mock fetch function
 */
function createMockFetch(options = {}) {
  const {
    ok = true,
    status = 200,
    statusText = 'OK',
    json = {},
    throwError = null,
    jsonParseError = false
  } = options;

  return async (url, fetchOptions) => {
    if (throwError) {
      throw throwError;
    }

    return {
      ok,
      status,
      statusText,
      json: async () => {
        if (jsonParseError) {
          throw new SyntaxError('Unexpected token in JSON');
        }
        return json;
      }
    };
  };
}

/**
 * Setup function to run before each test
 */
function setup() {
  // Reset environment
  process.env = { ...originalEnv };
  // Set a default API key for tests that need it
  process.env.INFURA_API_KEY = 'test-api-key-12345';
  // Suppress console.error during tests (infura-client logs errors before re-throwing)
  console.error = () => {};
}

/**
 * Teardown function to run after each test
 */
function teardown() {
  // Restore original fetch
  global.fetch = originalFetch;
  // Restore original environment
  process.env = { ...originalEnv };
  // Restore original console.error
  console.error = originalConsoleError;
}

/**
 * Run a single test
 * @param {number} testNumber - Test number
 * @param {string} description - Test description
 * @param {Function} testFn - Test function
 */
async function runTest(testNumber, description, testFn) {
  results.total++;
  setup();

  try {
    await testFn();
    results.passed++;
    console.log(`  [${testNumber}] PASS: ${description}`);
  } catch (error) {
    results.failed++;
    results.errors.push({ testNumber, description, error: error.message });
    console.log(`  [${testNumber}] FAIL: ${description}`);
    console.log(`       Error: ${error.message}`);
  } finally {
    teardown();
  }
}

/**
 * Assert helper functions
 */
function assertEqual(actual, expected, message = '') {
  if (actual !== expected) {
    throw new Error(`${message} Expected: ${expected}, Actual: ${actual}`);
  }
}

function assertIncludes(str, substring, message = '') {
  if (!str || !str.includes(substring)) {
    throw new Error(`${message} Expected "${str}" to include "${substring}"`);
  }
}

function assertThrows(fn, expectedMessage = null) {
  let threw = false;
  let thrownError = null;

  try {
    fn();
  } catch (error) {
    threw = true;
    thrownError = error;
  }

  if (!threw) {
    throw new Error('Expected function to throw, but it did not');
  }

  if (expectedMessage && !thrownError.message.includes(expectedMessage)) {
    throw new Error(`Expected error message to include "${expectedMessage}", got "${thrownError.message}"`);
  }

  return thrownError;
}

async function assertThrowsAsync(asyncFn, expectedMessage = null) {
  let threw = false;
  let thrownError = null;

  try {
    await asyncFn();
  } catch (error) {
    threw = true;
    thrownError = error;
  }

  if (!threw) {
    throw new Error('Expected async function to throw, but it did not');
  }

  if (expectedMessage && !thrownError.message.includes(expectedMessage)) {
    throw new Error(`Expected error message to include "${expectedMessage}", got "${thrownError.message}"`);
  }

  return thrownError;
}

/**
 * Main test suite
 */
async function runTests() {
  console.log('');
  console.log('='.repeat(60));
  console.log('Infura Client Unit Tests');
  console.log('='.repeat(60));
  console.log('');

  // Dynamically import callInfura to ensure fresh imports for each test
  const infuraClientPath = join(__dirname, '../lib/infura-client.js');

  // Test 1: Missing API key
  await runTest(1, 'Missing API key should throw appropriate error', async () => {
    // Clear the API key
    delete process.env.INFURA_API_KEY;

    // Re-import to get fresh module state
    const { callInfura } = await import(`${infuraClientPath}?t=${Date.now()}`);

    const error = await assertThrowsAsync(
      () => callInfura('eth_blockNumber', [], 'mainnet'),
      'INFURA_API_KEY'
    );

    assertIncludes(error.message, 'environment variable not set');
  });

  // Test 2: Invalid network
  await runTest(2, 'Invalid network should throw validation error', async () => {
    const { callInfura } = await import(`${infuraClientPath}?t=${Date.now()}`);

    const error = await assertThrowsAsync(
      () => callInfura('eth_blockNumber', [], 'invalid-network-xyz'),
      'Invalid network'
    );

    assertIncludes(error.message, 'invalid-network-xyz');
  });

  // Test 3: HTTP 401 Unauthorized
  await runTest(3, 'HTTP 401 Unauthorized should be handled correctly', async () => {
    global.fetch = createMockFetch({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      json: { error: { message: 'Invalid API key' } }
    });

    const { callInfura } = await import(`${infuraClientPath}?t=${Date.now()}`);

    const error = await assertThrowsAsync(
      () => callInfura('eth_blockNumber', [], 'mainnet')
    );

    // Error message uses actionable format instead of raw status code
    assertIncludes(error.message, 'Authentication failed');
  });

  // Test 4: HTTP 403 Forbidden
  await runTest(4, 'HTTP 403 Forbidden should be handled correctly', async () => {
    global.fetch = createMockFetch({
      ok: false,
      status: 403,
      statusText: 'Forbidden',
      json: { error: { message: 'Access denied' } }
    });

    const { callInfura } = await import(`${infuraClientPath}?t=${Date.now()}`);

    const error = await assertThrowsAsync(
      () => callInfura('eth_blockNumber', [], 'mainnet')
    );

    // Error message uses actionable format instead of raw status code
    assertIncludes(error.message, 'Authentication failed');
  });

  // Test 5: HTTP 429 Rate Limited
  await runTest(5, 'HTTP 429 Rate Limited should be handled correctly', async () => {
    global.fetch = createMockFetch({
      ok: false,
      status: 429,
      statusText: 'Too Many Requests',
      json: { error: { message: 'Rate limit exceeded' } }
    });

    const { callInfura } = await import(`${infuraClientPath}?t=${Date.now()}`);

    const error = await assertThrowsAsync(
      () => callInfura('eth_blockNumber', [], 'mainnet')
    );

    // Error message uses actionable format instead of raw status code
    assertIncludes(error.message, 'Rate limit exceeded');
  });

  // Test 6: HTTP 500 Server Error
  await runTest(6, 'HTTP 500 Server Error should be handled correctly', async () => {
    global.fetch = createMockFetch({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: { error: { message: 'Server error' } }
    });

    const { callInfura } = await import(`${infuraClientPath}?t=${Date.now()}`);

    const error = await assertThrowsAsync(
      () => callInfura('eth_blockNumber', [], 'mainnet')
    );

    assertIncludes(error.message, '500');
  });

  // Test 7: Network timeout
  await runTest(7, 'Network timeout should be handled correctly', async () => {
    const timeoutError = new Error('Network request timed out');
    timeoutError.name = 'AbortError';

    global.fetch = createMockFetch({
      throwError: timeoutError
    });

    const { callInfura } = await import(`${infuraClientPath}?t=${Date.now()}`);

    const error = await assertThrowsAsync(
      () => callInfura('eth_blockNumber', [], 'mainnet')
    );

    assertIncludes(error.message, 'timed out');
  });

  // Test 8: JSON parse error
  await runTest(8, 'JSON parse error should be handled correctly', async () => {
    global.fetch = createMockFetch({
      ok: true,
      status: 200,
      jsonParseError: true
    });

    const { callInfura } = await import(`${infuraClientPath}?t=${Date.now()}`);

    const error = await assertThrowsAsync(
      () => callInfura('eth_blockNumber', [], 'mainnet')
    );

    // Should be wrapped in McpError with InternalError code
    assertIncludes(error.message, 'JSON');
  });

  // Test 9: Successful response
  await runTest(9, 'Successful response should return the result', async () => {
    const expectedResult = '0x1234567';

    global.fetch = createMockFetch({
      ok: true,
      status: 200,
      json: {
        jsonrpc: '2.0',
        id: 1,
        result: expectedResult
      }
    });

    const { callInfura } = await import(`${infuraClientPath}?t=${Date.now()}`);

    const result = await callInfura('eth_blockNumber', [], 'mainnet');

    assertEqual(result, expectedResult, 'Result should match expected value.');
  });

  // Test 10: JSON-RPC error response
  await runTest(10, 'JSON-RPC error response should throw appropriate error', async () => {
    global.fetch = createMockFetch({
      ok: true,
      status: 200,
      json: {
        jsonrpc: '2.0',
        id: 1,
        error: {
          code: -32601,
          message: 'Method not found'
        }
      }
    });

    const { callInfura } = await import(`${infuraClientPath}?t=${Date.now()}`);

    const error = await assertThrowsAsync(
      () => callInfura('eth_nonExistentMethod', [], 'mainnet')
    );

    assertIncludes(error.message, 'Method not found');
  });

  // Test 11: Retry occurs on transient 429 error
  await runTest(11, 'Retry occurs on transient 429 error (3 attempts)', async () => {
    let fetchCallCount = 0;

    global.fetch = async (url, options) => {
      fetchCallCount++;
      return {
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
        headers: new Map(),
        json: async () => ({ error: { message: 'Rate limit exceeded' } })
      };
    };

    const { callInfura } = await import(`${infuraClientPath}?t=${Date.now()}`);

    await assertThrowsAsync(
      () => callInfura('eth_blockNumber', [], 'mainnet'),
      'Rate limit exceeded'
    );

    // Should have retried 3 times (MAX_RETRIES = 3)
    assertEqual(fetchCallCount, 3, 'Should have made 3 fetch attempts.');
  });

  // Test 12: Retry occurs on transient 500 error
  await runTest(12, 'Retry occurs on transient 500 error (3 attempts)', async () => {
    let fetchCallCount = 0;

    global.fetch = async (url, options) => {
      fetchCallCount++;
      return {
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        headers: new Map(),
        json: async () => ({ error: { message: 'Server error' } })
      };
    };

    const { callInfura } = await import(`${infuraClientPath}?t=${Date.now()}`);

    await assertThrowsAsync(
      () => callInfura('eth_blockNumber', [], 'mainnet'),
      '500'
    );

    // Should have retried 3 times
    assertEqual(fetchCallCount, 3, 'Should have made 3 fetch attempts for 500 error.');
  });

  // Test 13: Success after transient failure (retry succeeds)
  await runTest(13, 'Success after transient failure on second attempt', async () => {
    let fetchCallCount = 0;
    const expectedResult = '0xabcdef';

    global.fetch = async (url, options) => {
      fetchCallCount++;

      // First attempt fails with 503
      if (fetchCallCount === 1) {
        return {
          ok: false,
          status: 503,
          statusText: 'Service Unavailable',
          headers: new Map(),
          json: async () => ({ error: { message: 'Service temporarily unavailable' } })
        };
      }

      // Second attempt succeeds
      return {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => ({
          jsonrpc: '2.0',
          id: 1,
          result: expectedResult
        })
      };
    };

    const { callInfura } = await import(`${infuraClientPath}?t=${Date.now()}`);

    const result = await callInfura('eth_blockNumber', [], 'mainnet');

    assertEqual(fetchCallCount, 2, 'Should have made 2 fetch attempts.');
    assertEqual(result, expectedResult, 'Should return result from successful retry.');
  });

  // Test 14: No retry on 401 (non-transient error)
  await runTest(14, 'No retry on 401 (non-transient auth error)', async () => {
    let fetchCallCount = 0;

    global.fetch = async (url, options) => {
      fetchCallCount++;
      return {
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        headers: new Map(),
        json: async () => ({ error: { message: 'Invalid API key' } })
      };
    };

    const { callInfura } = await import(`${infuraClientPath}?t=${Date.now()}`);

    await assertThrowsAsync(
      () => callInfura('eth_blockNumber', [], 'mainnet'),
      'Authentication failed'
    );

    // Should NOT retry on auth errors
    assertEqual(fetchCallCount, 1, 'Should NOT retry on 401 error.');
  });

  // Print summary
  console.log('');
  console.log('='.repeat(60));
  console.log('Test Summary');
  console.log('='.repeat(60));
  console.log(`Total:  ${results.total}`);
  console.log(`Passed: ${results.passed}`);
  console.log(`Failed: ${results.failed}`);
  console.log('');

  if (results.failed > 0) {
    console.log('Failed Tests:');
    results.errors.forEach(({ testNumber, description, error }) => {
      console.log(`  [${testNumber}] ${description}`);
      console.log(`       ${error}`);
    });
    console.log('');
  }

  const passRate = ((results.passed / results.total) * 100).toFixed(1);
  console.log(`Pass Rate: ${passRate}%`);
  console.log('='.repeat(60));

  // Exit with appropriate code
  process.exit(results.failed > 0 ? 1 : 0);
}

// Run tests if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch(error => {
    console.error('Test suite failed to run:', error);
    process.exit(1);
  });
}

export { runTests };
