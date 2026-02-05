#!/usr/bin/env node

/**
 * Unit Tests for Error Classification Module
 * Tests the classifyHttpError and createActionableMessage functions
 */

import {
  InfuraApiError,
  classifyHttpError,
  createActionableMessage
} from '../lib/errors.js';

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
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

function assertDeepEqual(actual, expected, message = '') {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`${message} Expected: ${JSON.stringify(expected)}, Actual: ${JSON.stringify(actual)}`);
  }
}

console.log('Testing errors module...\n');

// ============================================
// classifyHttpError Tests
// ============================================

console.log('--- classifyHttpError Tests ---\n');

test('classifyHttpError: 429 is transient rate_limit', () => {
  const result = classifyHttpError(429);
  assertDeepEqual(result, { isTransient: true, category: 'rate_limit' });
});

test('classifyHttpError: 500 is transient server_error', () => {
  const result = classifyHttpError(500);
  assertDeepEqual(result, { isTransient: true, category: 'server_error' });
});

test('classifyHttpError: 502 is transient server_error', () => {
  const result = classifyHttpError(502);
  assertDeepEqual(result, { isTransient: true, category: 'server_error' });
});

test('classifyHttpError: 503 is transient server_error', () => {
  const result = classifyHttpError(503);
  assertDeepEqual(result, { isTransient: true, category: 'server_error' });
});

test('classifyHttpError: 504 is transient server_error', () => {
  const result = classifyHttpError(504);
  assertDeepEqual(result, { isTransient: true, category: 'server_error' });
});

test('classifyHttpError: 401 is NOT transient auth_error', () => {
  const result = classifyHttpError(401);
  assertDeepEqual(result, { isTransient: false, category: 'auth_error' });
});

test('classifyHttpError: 403 is NOT transient auth_error', () => {
  const result = classifyHttpError(403);
  assertDeepEqual(result, { isTransient: false, category: 'auth_error' });
});

test('classifyHttpError: 404 is NOT transient not_found', () => {
  const result = classifyHttpError(404);
  assertDeepEqual(result, { isTransient: false, category: 'not_found' });
});

test('classifyHttpError: 400 is NOT transient client_error', () => {
  const result = classifyHttpError(400);
  assertDeepEqual(result, { isTransient: false, category: 'client_error' });
});

test('classifyHttpError: 422 is NOT transient client_error', () => {
  const result = classifyHttpError(422);
  assertDeepEqual(result, { isTransient: false, category: 'client_error' });
});

// ============================================
// InfuraApiError Tests
// ============================================

console.log('\n--- InfuraApiError Tests ---\n');

test('InfuraApiError: creates error with httpStatus', () => {
  const error = new InfuraApiError('Rate limited', { httpStatus: 429, isTransient: true });
  assertEqual(error.name, 'InfuraApiError');
  assertEqual(error.message, 'Rate limited');
  assertEqual(error.httpStatus, 429);
  assertEqual(error.isTransient, true);
  assertEqual(error.rpcCode, null);
});

test('InfuraApiError: creates error with rpcCode', () => {
  const error = new InfuraApiError('Method not found', { rpcCode: -32601, isTransient: false });
  assertEqual(error.name, 'InfuraApiError');
  assertEqual(error.message, 'Method not found');
  assertEqual(error.httpStatus, null);
  assertEqual(error.rpcCode, -32601);
  assertEqual(error.isTransient, false);
});

test('InfuraApiError: defaults to non-transient', () => {
  const error = new InfuraApiError('Some error');
  assertEqual(error.isTransient, false);
  assertEqual(error.httpStatus, null);
  assertEqual(error.rpcCode, null);
});

// ============================================
// createActionableMessage Tests
// ============================================

console.log('\n--- createActionableMessage Tests ---\n');

test('createActionableMessage: 429 rate limit message', () => {
  const error = new InfuraApiError('', { httpStatus: 429 });
  const message = createActionableMessage(error);
  assertEqual(message.includes('Rate limit'), true, 'Should mention rate limit');
  assertEqual(message.includes('60 seconds'), true, 'Should mention wait time');
});

test('createActionableMessage: 401 auth error with network context', () => {
  const error = new InfuraApiError('', { httpStatus: 401 });
  const message = createActionableMessage(error, { network: 'polygon-mainnet' });
  assertEqual(message.includes('Authentication failed'), true, 'Should mention auth failure');
  assertEqual(message.includes('polygon-mainnet'), true, 'Should include network');
});

test('createActionableMessage: 403 auth error without network context', () => {
  const error = new InfuraApiError('', { httpStatus: 403 });
  const message = createActionableMessage(error);
  assertEqual(message.includes('Authentication failed'), true, 'Should mention auth failure');
  assertEqual(message.includes('this network'), true, 'Should have default network text');
});

test('createActionableMessage: 500 server error', () => {
  const error = new InfuraApiError('', { httpStatus: 500 });
  const message = createActionableMessage(error);
  assertEqual(message.includes('temporarily unavailable'), true, 'Should mention unavailable');
  assertEqual(message.includes('500'), true, 'Should include status code');
  assertEqual(message.includes('transient'), true, 'Should mention transient');
});

test('createActionableMessage: 503 server error', () => {
  const error = new InfuraApiError('', { httpStatus: 503 });
  const message = createActionableMessage(error);
  assertEqual(message.includes('503'), true, 'Should include status code');
});

test('createActionableMessage: AbortError timeout', () => {
  const error = new Error('Request timed out');
  error.name = 'AbortError';
  const message = createActionableMessage(error);
  assertEqual(message.includes('timed out'), true, 'Should mention timeout');
});

test('createActionableMessage: error with timeout in message', () => {
  const error = new Error('Connection timeout after 30000ms');
  const message = createActionableMessage(error);
  assertEqual(message.includes('timed out'), true, 'Should detect timeout in message');
});

test('createActionableMessage: generic error returns original message', () => {
  const error = new Error('Something went wrong');
  const message = createActionableMessage(error);
  assertEqual(message, 'Something went wrong');
});

// ============================================
// Summary
// ============================================

console.log('\n' + '═'.repeat(50));
console.log(`ERRORS TESTS: ${passed} passed, ${failed} failed`);
console.log('═'.repeat(50) + '\n');

process.exit(failed > 0 ? 1 : 0);
