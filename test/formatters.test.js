#!/usr/bin/env node

/**
 * Tests for the markdown formatters module
 */

import {
  hexToDecimal,
  weiToEth,
  formatTimestamp,
  truncateHash,
  formatBlock,
  formatTransaction,
  formatBalance,
  formatLogs,
  formatGasPrice,
  formatSyncStatus,
  formatBoolean,
  formatAsMarkdown
} from '../lib/formatters.js';

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

function assertIncludes(str, substr, message) {
  if (!str.includes(substr)) {
    throw new Error(`${message}: expected to include "${substr}"`);
  }
}

console.log('Testing formatters module...\n');

// hexToDecimal tests
test('hexToDecimal: converts 0x0 to 0', () => {
  assertEqual(hexToDecimal('0x0'), '0', 'Should convert 0x0');
});

test('hexToDecimal: converts 0xff to 255', () => {
  assertEqual(hexToDecimal('0xff'), '255', 'Should convert hex');
});

test('hexToDecimal: handles null/undefined', () => {
  assertEqual(hexToDecimal(null), '0', 'Should handle null');
  assertEqual(hexToDecimal(undefined), '0', 'Should handle undefined');
});

// weiToEth tests
test('weiToEth: converts 0 wei', () => {
  assertEqual(weiToEth('0x0'), '0 ETH', 'Should convert 0');
});

test('weiToEth: converts 1 ETH', () => {
  const oneEthWei = '0xde0b6b3a7640000'; // 1e18 in hex
  assertIncludes(weiToEth(oneEthWei), 'ETH', 'Should include ETH');
});

test('weiToEth: shows small amounts in wei', () => {
  assertIncludes(weiToEth('0x64'), 'wei', 'Small amounts should show wei');
});

// formatTimestamp tests
test('formatTimestamp: formats hex timestamp', () => {
  const timestamp = '0x5f5e100'; // Some timestamp
  const result = formatTimestamp(timestamp);
  assertIncludes(result, 'T', 'Should be ISO format');
});

test('formatTimestamp: handles null', () => {
  assertEqual(formatTimestamp(null), 'N/A', 'Should return N/A for null');
});

// truncateHash tests
test('truncateHash: truncates long hash', () => {
  const hash = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
  const result = truncateHash(hash, 8);
  assertIncludes(result, '...', 'Should include ellipsis');
  assertIncludes(result, '0x12345678', 'Should start with prefix');
});

test('truncateHash: handles null', () => {
  assertEqual(truncateHash(null), 'N/A', 'Should return N/A for null');
});

// formatBalance tests
test('formatBalance: formats balance as markdown', () => {
  const result = formatBalance('0xde0b6b3a7640000', 'eth_getBalance');
  assertIncludes(result, '# Account Balance', 'Should have title');
  assertIncludes(result, 'ETH', 'Should include ETH');
});

// formatBlock tests
test('formatBlock: formats block data', () => {
  const block = {
    number: '0x100',
    hash: '0x' + 'a'.repeat(64),
    parentHash: '0x' + 'b'.repeat(64),
    timestamp: '0x5f5e100',
    miner: '0x' + 'c'.repeat(40),
    gasUsed: '0x5208',
    gasLimit: '0x1c9c380',
    transactions: [],
    uncles: []
  };
  const result = formatBlock(block, 'eth_getBlockByNumber');
  assertIncludes(result, '# Block', 'Should have title');
  assertIncludes(result, 'Hash', 'Should have hash');
});

test('formatBlock: handles null block', () => {
  const result = formatBlock(null, 'eth_getBlockByNumber');
  assertIncludes(result, 'not found', 'Should indicate not found');
});

// formatTransaction tests
test('formatTransaction: formats transaction', () => {
  const tx = {
    hash: '0x' + 'a'.repeat(64),
    from: '0x' + 'b'.repeat(40),
    to: '0x' + 'c'.repeat(40),
    value: '0xde0b6b3a7640000',
    gas: '0x5208',
    nonce: '0x1',
    input: '0x'
  };
  const result = formatTransaction(tx, 'eth_getTransactionByHash');
  assertIncludes(result, '# Transaction', 'Should have title');
  assertIncludes(result, 'From', 'Should have from');
});

// formatLogs tests
test('formatLogs: formats empty logs', () => {
  const result = formatLogs([], 'eth_getLogs');
  assertIncludes(result, 'No logs found', 'Should indicate empty');
});

test('formatLogs: formats logs array', () => {
  const logs = [{
    address: '0x' + 'a'.repeat(40),
    blockNumber: '0x100',
    transactionHash: '0x' + 'b'.repeat(64),
    topics: ['0x' + 'c'.repeat(64)],
    data: '0x'
  }];
  const result = formatLogs(logs, 'eth_getLogs');
  assertIncludes(result, '# Event Logs', 'Should have title');
  assertIncludes(result, '1', 'Should show count');
});

// formatGasPrice tests
test('formatGasPrice: formats gas price', () => {
  const result = formatGasPrice('0x3b9aca00', 'eth_getGasPrice'); // 1 Gwei
  assertIncludes(result, 'Gwei', 'Should show Gwei');
});

// formatSyncStatus tests
test('formatSyncStatus: formats synced status', () => {
  const result = formatSyncStatus(false, 'eth_isSyncing');
  assertIncludes(result, 'Fully synced', 'Should indicate synced');
});

test('formatSyncStatus: formats syncing status', () => {
  const status = {
    startingBlock: '0x0',
    currentBlock: '0x100',
    highestBlock: '0x200'
  };
  const result = formatSyncStatus(status, 'eth_isSyncing');
  assertIncludes(result, 'Syncing', 'Should indicate syncing');
});

// formatBoolean tests
test('formatBoolean: formats true', () => {
  const result = formatBoolean(true, 'Network Listening', 'net_isListening');
  assertIncludes(result, 'Yes', 'Should show Yes');
});

test('formatBoolean: formats false', () => {
  const result = formatBoolean(false, 'Network Listening', 'net_isListening');
  assertIncludes(result, 'No', 'Should show No');
});

// formatAsMarkdown routing tests
test('formatAsMarkdown: routes eth_getBlockNumber', () => {
  const result = formatAsMarkdown('0x100', 'eth_getBlockNumber');
  assertIncludes(result, 'Block Number', 'Should format as block number');
});

test('formatAsMarkdown: routes eth_getBalance', () => {
  const result = formatAsMarkdown('0xde0b6b3a7640000', 'eth_getBalance');
  assertIncludes(result, 'Balance', 'Should format as balance');
});

test('formatAsMarkdown: handles null result', () => {
  const result = formatAsMarkdown(null, 'eth_getBlockByNumber');
  assertIncludes(result, 'No data', 'Should handle null');
});

// Summary
console.log(`\n════════════════════════════════════════`);
console.log(`FORMATTER TESTS: ${passed} passed, ${failed} failed`);
console.log(`════════════════════════════════════════`);

process.exit(failed > 0 ? 1 : 0);
