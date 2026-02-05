#!/usr/bin/env node

/**
 * Tests for eth_getLogs pagination feature
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`✅ ${name}`);
    passed++;
  } catch (error) {
    console.log(`❌ ${name}: ${error.message}`);
    failed++;
  }
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message}: expected "${expected}", got "${actual}"`);
  }
}

function assertExists(value, message) {
  if (value === undefined || value === null) {
    throw new Error(`${message}: value should exist`);
  }
}

console.log('Testing eth_getLogs pagination...\n');

// Test the tool schema
async function testToolSchema() {
  const toolPath = join(__dirname, '../tools/eth-get-logs.js');
  const { apiTool } = await import(toolPath);

  const params = apiTool.definition.function.parameters.properties;

  test('Schema has limit parameter', () => {
    assertExists(params.limit, 'limit parameter');
    assertEqual(params.limit.type, 'integer', 'limit type');
    assertEqual(params.limit.default, 1000, 'limit default');
    assertEqual(params.limit.minimum, 1, 'limit minimum');
    assertEqual(params.limit.maximum, 10000, 'limit maximum');
  });

  test('Schema has offset parameter', () => {
    assertExists(params.offset, 'offset parameter');
    assertEqual(params.offset.type, 'integer', 'offset type');
    assertEqual(params.offset.default, 0, 'offset default');
    assertEqual(params.offset.minimum, 0, 'offset minimum');
  });

  test('Schema has response_format parameter', () => {
    assertExists(params.response_format, 'response_format parameter');
    assertEqual(params.response_format.type, 'string', 'response_format type');
    assertEqual(params.response_format.default, 'json', 'response_format default');
  });

  test('limit and offset are not required', () => {
    const required = apiTool.definition.function.parameters.required || [];
    assertEqual(required.includes('limit'), false, 'limit should not be required');
    assertEqual(required.includes('offset'), false, 'offset should not be required');
  });
}

// Test pagination logic (mock the behavior)
function testPaginationLogic() {
  // Simulate the pagination logic from eth-get-logs.js
  function paginateLogs(allLogs, limit, offset) {
    const total = allLogs.length;
    const paginatedLogs = allLogs.slice(offset, offset + limit);
    const hasMore = offset + paginatedLogs.length < total;

    return {
      logs: paginatedLogs,
      pagination: {
        total,
        count: paginatedLogs.length,
        offset,
        limit,
        has_more: hasMore,
        next_offset: hasMore ? offset + paginatedLogs.length : null
      }
    };
  }

  // Create mock logs
  const mockLogs = Array.from({ length: 100 }, (_, i) => ({
    logIndex: `0x${i.toString(16)}`,
    blockNumber: '0x100'
  }));

  test('Pagination: first page', () => {
    const result = paginateLogs(mockLogs, 20, 0);
    assertEqual(result.pagination.total, 100, 'total');
    assertEqual(result.pagination.count, 20, 'count');
    assertEqual(result.pagination.offset, 0, 'offset');
    assertEqual(result.pagination.limit, 20, 'limit');
    assertEqual(result.pagination.has_more, true, 'has_more');
    assertEqual(result.pagination.next_offset, 20, 'next_offset');
    assertEqual(result.logs.length, 20, 'logs length');
  });

  test('Pagination: middle page', () => {
    const result = paginateLogs(mockLogs, 20, 40);
    assertEqual(result.pagination.total, 100, 'total');
    assertEqual(result.pagination.count, 20, 'count');
    assertEqual(result.pagination.offset, 40, 'offset');
    assertEqual(result.pagination.has_more, true, 'has_more');
    assertEqual(result.pagination.next_offset, 60, 'next_offset');
  });

  test('Pagination: last page', () => {
    const result = paginateLogs(mockLogs, 20, 80);
    assertEqual(result.pagination.total, 100, 'total');
    assertEqual(result.pagination.count, 20, 'count');
    assertEqual(result.pagination.offset, 80, 'offset');
    assertEqual(result.pagination.has_more, false, 'has_more');
    assertEqual(result.pagination.next_offset, null, 'next_offset');
  });

  test('Pagination: partial last page', () => {
    const result = paginateLogs(mockLogs, 20, 90);
    assertEqual(result.pagination.count, 10, 'count');
    assertEqual(result.pagination.has_more, false, 'has_more');
  });

  test('Pagination: empty result', () => {
    const result = paginateLogs([], 20, 0);
    assertEqual(result.pagination.total, 0, 'total');
    assertEqual(result.pagination.count, 0, 'count');
    assertEqual(result.pagination.has_more, false, 'has_more');
    assertEqual(result.logs.length, 0, 'logs length');
  });

  test('Pagination: offset beyond total', () => {
    const result = paginateLogs(mockLogs, 20, 200);
    assertEqual(result.pagination.count, 0, 'count');
    assertEqual(result.pagination.has_more, false, 'has_more');
  });

  test('Pagination: default limit (1000)', () => {
    const result = paginateLogs(mockLogs, 1000, 0);
    assertEqual(result.pagination.count, 100, 'count');
    assertEqual(result.pagination.has_more, false, 'has_more');
  });
}

// Run tests
await testToolSchema();
testPaginationLogic();

// Summary
console.log(`\n════════════════════════════════════════`);
console.log(`PAGINATION TESTS: ${passed} passed, ${failed} failed`);
console.log(`════════════════════════════════════════`);

process.exit(failed > 0 ? 1 : 0);
