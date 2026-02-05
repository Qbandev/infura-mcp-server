#!/usr/bin/env node

/**
 * Comprehensive Unit Tests for Validators Module
 * Tests all validator functions for input validation and error handling
 */

import assert from 'assert';
import {
  isValidEthAddress,
  isValidHash,
  isValidBlockTag,
  isValidHexString,
  isValidHexQuantity,
  isValidIndex,
  isValidNetwork,
  ALLOWED_NETWORKS,
  ValidationError,
  validateAddress,
  validateHash,
  validateBlockTag,
  validateNetwork,
} from '../lib/validators.js';

// Test counters
let testsPassed = 0;
let testsFailed = 0;
const failedTests = [];

function test(number, description, testFn) {
  try {
    testFn();
    testsPassed++;
    console.log(`  ${number}. PASS: ${description}`);
  } catch (error) {
    testsFailed++;
    failedTests.push({ number, description, error: error.message });
    console.log(`  ${number}. FAIL: ${description}`);
    console.log(`         Error: ${error.message}`);
  }
}

function runTestSuite() {
  console.log('============================================');
  console.log('Validators Module Unit Tests');
  console.log('============================================\n');

  // ============================================
  // 1. isValidEthAddress() Tests
  // ============================================
  console.log('isValidEthAddress() Tests:');
  console.log('--------------------------------------------');

  test(1, 'Valid lowercase address returns true', () => {
    assert.strictEqual(
      isValidEthAddress('0xd8da6bf26964af9d7eed9e03e53415d37aa96045'),
      true
    );
  });

  test(2, 'Valid uppercase address returns true', () => {
    assert.strictEqual(
      isValidEthAddress('0xD8DA6BF26964AF9D7EED9E03E53415D37AA96045'),
      true
    );
  });

  test(3, 'Valid mixed case address returns true', () => {
    assert.strictEqual(
      isValidEthAddress('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'),
      true
    );
  });

  test(4, 'Zero address is valid', () => {
    assert.strictEqual(
      isValidEthAddress('0x0000000000000000000000000000000000000000'),
      true
    );
  });

  test(5, 'Address without 0x prefix returns false', () => {
    assert.strictEqual(
      isValidEthAddress('d8da6bf26964af9d7eed9e03e53415d37aa96045'),
      false
    );
  });

  test(6, 'Address with 0X prefix (uppercase X) returns false', () => {
    assert.strictEqual(
      isValidEthAddress('0Xd8da6bf26964af9d7eed9e03e53415d37aa96045'),
      false
    );
  });

  test(7, 'Address too short (39 chars) returns false', () => {
    assert.strictEqual(
      isValidEthAddress('0xd8da6bf26964af9d7eed9e03e53415d37aa9604'),
      false
    );
  });

  test(8, 'Address too long (41 chars) returns false', () => {
    assert.strictEqual(
      isValidEthAddress('0xd8da6bf26964af9d7eed9e03e53415d37aa960450'),
      false
    );
  });

  test(9, 'Address with non-hex characters returns false', () => {
    assert.strictEqual(
      isValidEthAddress('0xd8da6bf26964af9d7eed9e03e53415d37aa9604g'),
      false
    );
  });

  test(10, 'Empty string returns false', () => {
    assert.strictEqual(isValidEthAddress(''), false);
  });

  test(11, 'Just 0x returns false', () => {
    assert.strictEqual(isValidEthAddress('0x'), false);
  });

  test(12, 'null input returns false', () => {
    assert.strictEqual(isValidEthAddress(null), false);
  });

  test(13, 'undefined input returns false', () => {
    assert.strictEqual(isValidEthAddress(undefined), false);
  });

  test(14, 'Number input returns false', () => {
    assert.strictEqual(isValidEthAddress(12345), false);
  });

  test(15, 'Object input returns false', () => {
    assert.strictEqual(isValidEthAddress({}), false);
  });

  test(16, 'Array input returns false', () => {
    assert.strictEqual(isValidEthAddress([]), false);
  });

  // ============================================
  // 2. isValidHash() Tests
  // ============================================
  console.log('\nisValidHash() Tests:');
  console.log('--------------------------------------------');

  test(17, 'Valid lowercase hash returns true', () => {
    assert.strictEqual(
      isValidHash('0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890'),
      true
    );
  });

  test(18, 'Valid uppercase hash returns true', () => {
    assert.strictEqual(
      isValidHash('0xABCDEF1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890'),
      true
    );
  });

  test(19, 'Valid mixed case hash returns true', () => {
    assert.strictEqual(
      isValidHash('0xaBcDeF1234567890AbCdEf1234567890aBcDeF1234567890AbCdEf1234567890'),
      true
    );
  });

  test(20, 'Zero hash is valid', () => {
    assert.strictEqual(
      isValidHash('0x0000000000000000000000000000000000000000000000000000000000000000'),
      true
    );
  });

  test(21, 'Hash without 0x prefix returns false', () => {
    assert.strictEqual(
      isValidHash('abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890'),
      false
    );
  });

  test(22, 'Hash too short (63 chars) returns false', () => {
    assert.strictEqual(
      isValidHash('0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef123456789'),
      false
    );
  });

  test(23, 'Hash too long (65 chars) returns false', () => {
    assert.strictEqual(
      isValidHash('0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef12345678900'),
      false
    );
  });

  test(24, 'Hash with non-hex character returns false', () => {
    assert.strictEqual(
      isValidHash('0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef123456789g'),
      false
    );
  });

  test(25, 'Empty string returns false for hash', () => {
    assert.strictEqual(isValidHash(''), false);
  });

  test(26, 'Just 0x returns false for hash', () => {
    assert.strictEqual(isValidHash('0x'), false);
  });

  test(27, 'null input returns false for hash', () => {
    assert.strictEqual(isValidHash(null), false);
  });

  test(28, 'undefined input returns false for hash', () => {
    assert.strictEqual(isValidHash(undefined), false);
  });

  test(29, 'Ethereum address (40 chars) is not valid hash', () => {
    assert.strictEqual(
      isValidHash('0xd8da6bf26964af9d7eed9e03e53415d37aa96045'),
      false
    );
  });

  // ============================================
  // 3. isValidBlockTag() Tests
  // ============================================
  console.log('\nisValidBlockTag() Tests:');
  console.log('--------------------------------------------');

  test(30, 'latest tag is valid', () => {
    assert.strictEqual(isValidBlockTag('latest'), true);
  });

  test(31, 'earliest tag is valid', () => {
    assert.strictEqual(isValidBlockTag('earliest'), true);
  });

  test(32, 'pending tag is valid', () => {
    assert.strictEqual(isValidBlockTag('pending'), true);
  });

  test(33, 'safe tag is valid', () => {
    assert.strictEqual(isValidBlockTag('safe'), true);
  });

  test(34, 'finalized tag is valid', () => {
    assert.strictEqual(isValidBlockTag('finalized'), true);
  });

  test(35, 'Hex block number 0x0 is valid', () => {
    assert.strictEqual(isValidBlockTag('0x0'), true);
  });

  test(36, 'Hex block number 0x1 is valid', () => {
    assert.strictEqual(isValidBlockTag('0x1'), true);
  });

  test(37, 'Hex block number with many digits is valid', () => {
    assert.strictEqual(isValidBlockTag('0x1000000'), true);
  });

  test(38, 'Hex block number with letters is valid', () => {
    assert.strictEqual(isValidBlockTag('0xabcdef'), true);
  });

  test(39, 'LATEST (uppercase) is invalid', () => {
    assert.strictEqual(isValidBlockTag('LATEST'), false);
  });

  test(40, 'Latest (mixed case) is invalid', () => {
    assert.strictEqual(isValidBlockTag('Latest'), false);
  });

  test(41, 'Empty string is invalid block tag', () => {
    assert.strictEqual(isValidBlockTag(''), false);
  });

  test(42, 'Random string is invalid block tag', () => {
    assert.strictEqual(isValidBlockTag('random'), false);
  });

  test(43, 'Number without 0x is invalid block tag', () => {
    assert.strictEqual(isValidBlockTag('12345'), false);
  });

  test(44, 'null is invalid block tag', () => {
    assert.strictEqual(isValidBlockTag(null), false);
  });

  test(45, 'undefined is invalid block tag', () => {
    assert.strictEqual(isValidBlockTag(undefined), false);
  });

  test(46, 'Number type is invalid block tag', () => {
    assert.strictEqual(isValidBlockTag(12345), false);
  });

  test(47, 'Just 0x is invalid block tag (no digits)', () => {
    // Based on the regex /^0x[a-fA-F0-9]+$/, 0x alone should be invalid
    assert.strictEqual(isValidBlockTag('0x'), false);
  });

  // ============================================
  // 4. isValidHexString() Tests
  // ============================================
  console.log('\nisValidHexString() Tests:');
  console.log('--------------------------------------------');

  test(48, 'Valid hex string with digits returns true', () => {
    assert.strictEqual(isValidHexString('0x123456'), true);
  });

  test(49, 'Valid hex string with letters returns true', () => {
    assert.strictEqual(isValidHexString('0xabcdef'), true);
  });

  test(50, 'Valid hex string with mixed case returns true', () => {
    assert.strictEqual(isValidHexString('0xAbCdEf123'), true);
  });

  test(51, 'Empty hex string (0x) is valid', () => {
    assert.strictEqual(isValidHexString('0x'), true);
  });

  test(52, '0x0 is valid hex string', () => {
    assert.strictEqual(isValidHexString('0x0'), true);
  });

  test(53, 'Long hex string is valid', () => {
    assert.strictEqual(
      isValidHexString('0xabcdef1234567890abcdef1234567890abcdef1234567890'),
      true
    );
  });

  test(54, 'Hex string without 0x prefix returns false', () => {
    assert.strictEqual(isValidHexString('abcdef'), false);
  });

  test(55, 'Hex string with non-hex character g returns false', () => {
    assert.strictEqual(isValidHexString('0xabcdefg'), false);
  });

  test(56, 'Hex string with space returns false', () => {
    assert.strictEqual(isValidHexString('0x abc'), false);
  });

  test(57, 'Empty string returns false for hex', () => {
    assert.strictEqual(isValidHexString(''), false);
  });

  test(58, 'null returns false for hex', () => {
    assert.strictEqual(isValidHexString(null), false);
  });

  test(59, 'undefined returns false for hex', () => {
    assert.strictEqual(isValidHexString(undefined), false);
  });

  test(60, 'Number type returns false for hex', () => {
    assert.strictEqual(isValidHexString(255), false);
  });

  // ============================================
  // 5. isValidHexQuantity() Tests
  // ============================================
  console.log('\nisValidHexQuantity() Tests:');
  console.log('--------------------------------------------');

  test(61, '0x0 is valid hex quantity', () => {
    assert.strictEqual(isValidHexQuantity('0x0'), true);
  });

  test(62, '0x1 is valid hex quantity', () => {
    assert.strictEqual(isValidHexQuantity('0x1'), true);
  });

  test(63, '0xa is valid hex quantity', () => {
    assert.strictEqual(isValidHexQuantity('0xa'), true);
  });

  test(64, '0xA is valid hex quantity (uppercase)', () => {
    assert.strictEqual(isValidHexQuantity('0xA'), true);
  });

  test(65, '0x10 is valid hex quantity', () => {
    assert.strictEqual(isValidHexQuantity('0x10'), true);
  });

  test(66, '0xff is valid hex quantity', () => {
    assert.strictEqual(isValidHexQuantity('0xff'), true);
  });

  test(67, '0x1a2b3c is valid hex quantity', () => {
    assert.strictEqual(isValidHexQuantity('0x1a2b3c'), true);
  });

  test(68, 'Zero-padded 0x00 is invalid (should be 0x0)', () => {
    assert.strictEqual(isValidHexQuantity('0x00'), false);
  });

  test(69, 'Zero-padded 0x01 is invalid (should be 0x1)', () => {
    assert.strictEqual(isValidHexQuantity('0x01'), false);
  });

  test(70, 'Zero-padded 0x0a is invalid (should be 0xa)', () => {
    assert.strictEqual(isValidHexQuantity('0x0a'), false);
  });

  test(71, 'Zero-padded 0x000001 is invalid', () => {
    assert.strictEqual(isValidHexQuantity('0x000001'), false);
  });

  test(72, 'Empty 0x is invalid hex quantity', () => {
    assert.strictEqual(isValidHexQuantity('0x'), false);
  });

  test(73, 'Without 0x prefix is invalid hex quantity', () => {
    assert.strictEqual(isValidHexQuantity('10'), false);
  });

  test(74, 'null is invalid hex quantity', () => {
    assert.strictEqual(isValidHexQuantity(null), false);
  });

  test(75, 'undefined is invalid hex quantity', () => {
    assert.strictEqual(isValidHexQuantity(undefined), false);
  });

  test(76, 'Number type is invalid hex quantity', () => {
    assert.strictEqual(isValidHexQuantity(16), false);
  });

  // ============================================
  // 6. isValidIndex() Tests
  // ============================================
  console.log('\nisValidIndex() Tests:');
  console.log('--------------------------------------------');

  test(77, '0x0 is valid index', () => {
    assert.strictEqual(isValidIndex('0x0'), true);
  });

  test(78, '0x1 is valid index', () => {
    assert.strictEqual(isValidIndex('0x1'), true);
  });

  test(79, '0x10 is valid index', () => {
    assert.strictEqual(isValidIndex('0x10'), true);
  });

  test(80, '0xff is valid index', () => {
    assert.strictEqual(isValidIndex('0xff'), true);
  });

  test(81, 'Uppercase hex 0xAB is valid index', () => {
    assert.strictEqual(isValidIndex('0xAB'), true);
  });

  test(82, 'Empty 0x is invalid index', () => {
    assert.strictEqual(isValidIndex('0x'), false);
  });

  test(83, 'Without 0x prefix is invalid index', () => {
    assert.strictEqual(isValidIndex('5'), false);
  });

  test(84, 'Decimal string is invalid index', () => {
    assert.strictEqual(isValidIndex('10'), false);
  });

  test(85, 'Negative number string is invalid index', () => {
    assert.strictEqual(isValidIndex('-1'), false);
  });

  test(86, 'null is invalid index', () => {
    assert.strictEqual(isValidIndex(null), false);
  });

  test(87, 'undefined is invalid index', () => {
    assert.strictEqual(isValidIndex(undefined), false);
  });

  test(88, 'Number type is invalid index', () => {
    assert.strictEqual(isValidIndex(5), false);
  });

  test(89, 'Non-hex characters after 0x is invalid index', () => {
    assert.strictEqual(isValidIndex('0xgh'), false);
  });

  // ============================================
  // 7. isValidNetwork() Tests
  // ============================================
  console.log('\nisValidNetwork() Tests:');
  console.log('--------------------------------------------');

  test(90, 'mainnet is valid network', () => {
    assert.strictEqual(isValidNetwork('mainnet'), true);
  });

  test(91, 'sepolia is valid network', () => {
    assert.strictEqual(isValidNetwork('sepolia'), true);
  });

  test(92, 'polygon-mainnet is valid network', () => {
    assert.strictEqual(isValidNetwork('polygon-mainnet'), true);
  });

  test(93, 'polygon-amoy is valid network', () => {
    assert.strictEqual(isValidNetwork('polygon-amoy'), true);
  });

  test(94, 'arbitrum-mainnet is valid network', () => {
    assert.strictEqual(isValidNetwork('arbitrum-mainnet'), true);
  });

  test(95, 'arbitrum-sepolia is valid network', () => {
    assert.strictEqual(isValidNetwork('arbitrum-sepolia'), true);
  });

  test(96, 'optimism-mainnet is valid network', () => {
    assert.strictEqual(isValidNetwork('optimism-mainnet'), true);
  });

  test(97, 'optimism-sepolia is valid network', () => {
    assert.strictEqual(isValidNetwork('optimism-sepolia'), true);
  });

  test(98, 'base-mainnet is valid network', () => {
    assert.strictEqual(isValidNetwork('base-mainnet'), true);
  });

  test(99, 'base-sepolia is valid network', () => {
    assert.strictEqual(isValidNetwork('base-sepolia'), true);
  });

  test(100, 'linea-mainnet is valid network', () => {
    assert.strictEqual(isValidNetwork('linea-mainnet'), true);
  });

  test(101, 'linea-sepolia is valid network', () => {
    assert.strictEqual(isValidNetwork('linea-sepolia'), true);
  });

  test(102, 'zksync-mainnet is valid network', () => {
    assert.strictEqual(isValidNetwork('zksync-mainnet'), true);
  });

  test(103, 'zksync-sepolia is valid network', () => {
    assert.strictEqual(isValidNetwork('zksync-sepolia'), true);
  });

  test(104, 'scroll-mainnet is valid network', () => {
    assert.strictEqual(isValidNetwork('scroll-mainnet'), true);
  });

  test(105, 'blast-mainnet is valid network', () => {
    assert.strictEqual(isValidNetwork('blast-mainnet'), true);
  });

  test(106, 'mantle-mainnet is valid network', () => {
    assert.strictEqual(isValidNetwork('mantle-mainnet'), true);
  });

  test(107, 'avalanche-mainnet is valid network', () => {
    assert.strictEqual(isValidNetwork('avalanche-mainnet'), true);
  });

  test(108, 'avalanche-fuji is valid network', () => {
    assert.strictEqual(isValidNetwork('avalanche-fuji'), true);
  });

  test(109, 'bsc-mainnet is valid network', () => {
    assert.strictEqual(isValidNetwork('bsc-mainnet'), true);
  });

  test(110, 'bsc-testnet is valid network', () => {
    assert.strictEqual(isValidNetwork('bsc-testnet'), true);
  });

  test(111, 'celo-mainnet is valid network', () => {
    assert.strictEqual(isValidNetwork('celo-mainnet'), true);
  });

  test(112, 'palm-mainnet is valid network', () => {
    assert.strictEqual(isValidNetwork('palm-mainnet'), true);
  });

  test(113, 'starknet-mainnet is valid network', () => {
    assert.strictEqual(isValidNetwork('starknet-mainnet'), true);
  });

  test(114, 'opbnb-mainnet is valid network', () => {
    assert.strictEqual(isValidNetwork('opbnb-mainnet'), true);
  });

  test(115, 'swellchain-mainnet is valid network', () => {
    assert.strictEqual(isValidNetwork('swellchain-mainnet'), true);
  });

  test(116, 'unichain-mainnet is valid network', () => {
    assert.strictEqual(isValidNetwork('unichain-mainnet'), true);
  });

  test(117, 'MAINNET (uppercase) is invalid (case sensitive)', () => {
    assert.strictEqual(isValidNetwork('MAINNET'), false);
  });

  test(118, 'Mainnet (mixed case) is invalid', () => {
    assert.strictEqual(isValidNetwork('Mainnet'), false);
  });

  test(119, 'ethereum is invalid network', () => {
    assert.strictEqual(isValidNetwork('ethereum'), false);
  });

  test(120, 'goerli (deprecated testnet) is invalid', () => {
    assert.strictEqual(isValidNetwork('goerli'), false);
  });

  test(121, 'rinkeby (deprecated testnet) is invalid', () => {
    assert.strictEqual(isValidNetwork('rinkeby'), false);
  });

  test(122, 'ropsten (deprecated testnet) is invalid', () => {
    assert.strictEqual(isValidNetwork('ropsten'), false);
  });

  test(123, 'Empty string is invalid network', () => {
    assert.strictEqual(isValidNetwork(''), false);
  });

  test(124, 'Random string is invalid network', () => {
    assert.strictEqual(isValidNetwork('random-network'), false);
  });

  test(125, 'null is invalid network', () => {
    assert.strictEqual(isValidNetwork(null), false);
  });

  test(126, 'undefined is invalid network', () => {
    assert.strictEqual(isValidNetwork(undefined), false);
  });

  test(127, 'Number type is invalid network', () => {
    assert.strictEqual(isValidNetwork(1), false);
  });

  test(128, 'All ALLOWED_NETWORKS are valid', () => {
    for (const network of ALLOWED_NETWORKS) {
      assert.strictEqual(isValidNetwork(network), true, `${network} should be valid`);
    }
  });

  // ============================================
  // 8. ValidationError Class Tests
  // ============================================
  console.log('\nValidationError Class Tests:');
  console.log('--------------------------------------------');

  test(129, 'ValidationError has correct name property', () => {
    const error = new ValidationError('Test message', 'testField');
    assert.strictEqual(error.name, 'ValidationError');
  });

  test(130, 'ValidationError has correct message property', () => {
    const error = new ValidationError('Test error message', 'testField');
    assert.strictEqual(error.message, 'Test error message');
  });

  test(131, 'ValidationError has correct field property', () => {
    const error = new ValidationError('Test message', 'myField');
    assert.strictEqual(error.field, 'myField');
  });

  test(132, 'ValidationError is instance of Error', () => {
    const error = new ValidationError('Test message', 'testField');
    assert.strictEqual(error instanceof Error, true);
  });

  test(133, 'ValidationError is instance of ValidationError', () => {
    const error = new ValidationError('Test message', 'testField');
    assert.strictEqual(error instanceof ValidationError, true);
  });

  test(134, 'ValidationError can be thrown and caught', () => {
    let caught = false;
    try {
      throw new ValidationError('Thrown error', 'thrownField');
    } catch (e) {
      caught = true;
      assert.strictEqual(e.name, 'ValidationError');
      assert.strictEqual(e.field, 'thrownField');
    }
    assert.strictEqual(caught, true);
  });

  test(135, 'ValidationError with undefined field', () => {
    const error = new ValidationError('No field specified');
    assert.strictEqual(error.field, undefined);
  });

  // ============================================
  // 9. validateAddress() Tests
  // ============================================
  console.log('\nvalidateAddress() Tests:');
  console.log('--------------------------------------------');

  test(136, 'validateAddress does not throw for valid address', () => {
    assert.doesNotThrow(() => {
      validateAddress('0xd8da6bf26964af9d7eed9e03e53415d37aa96045');
    });
  });

  test(137, 'validateAddress does not throw for zero address', () => {
    assert.doesNotThrow(() => {
      validateAddress('0x0000000000000000000000000000000000000000');
    });
  });

  test(138, 'validateAddress throws ValidationError for invalid address', () => {
    assert.throws(
      () => validateAddress('invalid'),
      ValidationError
    );
  });

  test(139, 'validateAddress throws for address without 0x', () => {
    assert.throws(
      () => validateAddress('d8da6bf26964af9d7eed9e03e53415d37aa96045'),
      ValidationError
    );
  });

  test(140, 'validateAddress throws for short address', () => {
    assert.throws(
      () => validateAddress('0xd8da6bf26964af9d7eed9e03e53415d37aa9604'),
      ValidationError
    );
  });

  test(141, 'validateAddress throws for null', () => {
    assert.throws(
      () => validateAddress(null),
      ValidationError
    );
  });

  test(142, 'validateAddress uses default field name in error', () => {
    try {
      validateAddress('invalid');
      assert.fail('Should have thrown');
    } catch (e) {
      assert.strictEqual(e.field, 'address');
    }
  });

  test(143, 'validateAddress uses custom field name in error', () => {
    try {
      validateAddress('invalid', 'fromAddress');
      assert.fail('Should have thrown');
    } catch (e) {
      assert.strictEqual(e.field, 'fromAddress');
    }
  });

  test(144, 'validateAddress error message contains field name', () => {
    try {
      validateAddress('invalid', 'contractAddress');
      assert.fail('Should have thrown');
    } catch (e) {
      assert.ok(e.message.includes('contractAddress'));
    }
  });

  // ============================================
  // 10. validateHash() Tests
  // ============================================
  console.log('\nvalidateHash() Tests:');
  console.log('--------------------------------------------');

  test(145, 'validateHash does not throw for valid hash', () => {
    assert.doesNotThrow(() => {
      validateHash('0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890');
    });
  });

  test(146, 'validateHash does not throw for zero hash', () => {
    assert.doesNotThrow(() => {
      validateHash('0x0000000000000000000000000000000000000000000000000000000000000000');
    });
  });

  test(147, 'validateHash throws ValidationError for invalid hash', () => {
    assert.throws(
      () => validateHash('invalid'),
      ValidationError
    );
  });

  test(148, 'validateHash throws for hash without 0x', () => {
    assert.throws(
      () => validateHash('abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890'),
      ValidationError
    );
  });

  test(149, 'validateHash throws for short hash', () => {
    assert.throws(
      () => validateHash('0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef123456789'),
      ValidationError
    );
  });

  test(150, 'validateHash throws for address-length string (not hash)', () => {
    assert.throws(
      () => validateHash('0xd8da6bf26964af9d7eed9e03e53415d37aa96045'),
      ValidationError
    );
  });

  test(151, 'validateHash throws for null', () => {
    assert.throws(
      () => validateHash(null),
      ValidationError
    );
  });

  test(152, 'validateHash uses default field name in error', () => {
    try {
      validateHash('invalid');
      assert.fail('Should have thrown');
    } catch (e) {
      assert.strictEqual(e.field, 'hash');
    }
  });

  test(153, 'validateHash uses custom field name in error', () => {
    try {
      validateHash('invalid', 'transactionHash');
      assert.fail('Should have thrown');
    } catch (e) {
      assert.strictEqual(e.field, 'transactionHash');
    }
  });

  test(154, 'validateHash error message contains field name', () => {
    try {
      validateHash('invalid', 'blockHash');
      assert.fail('Should have thrown');
    } catch (e) {
      assert.ok(e.message.includes('blockHash'));
    }
  });

  // ============================================
  // 11. validateBlockTag() Tests
  // ============================================
  console.log('\nvalidateBlockTag() Tests:');
  console.log('--------------------------------------------');

  test(155, 'validateBlockTag does not throw for latest', () => {
    assert.doesNotThrow(() => validateBlockTag('latest'));
  });

  test(156, 'validateBlockTag does not throw for earliest', () => {
    assert.doesNotThrow(() => validateBlockTag('earliest'));
  });

  test(157, 'validateBlockTag does not throw for pending', () => {
    assert.doesNotThrow(() => validateBlockTag('pending'));
  });

  test(158, 'validateBlockTag does not throw for safe', () => {
    assert.doesNotThrow(() => validateBlockTag('safe'));
  });

  test(159, 'validateBlockTag does not throw for finalized', () => {
    assert.doesNotThrow(() => validateBlockTag('finalized'));
  });

  test(160, 'validateBlockTag does not throw for hex block number', () => {
    assert.doesNotThrow(() => validateBlockTag('0x1000000'));
  });

  test(161, 'validateBlockTag throws for invalid string', () => {
    assert.throws(
      () => validateBlockTag('invalid'),
      ValidationError
    );
  });

  test(162, 'validateBlockTag throws for LATEST (uppercase)', () => {
    assert.throws(
      () => validateBlockTag('LATEST'),
      ValidationError
    );
  });

  test(163, 'validateBlockTag throws for decimal number string', () => {
    assert.throws(
      () => validateBlockTag('12345'),
      ValidationError
    );
  });

  test(164, 'validateBlockTag throws for null', () => {
    assert.throws(
      () => validateBlockTag(null),
      ValidationError
    );
  });

  test(165, 'validateBlockTag uses default field name in error', () => {
    try {
      validateBlockTag('invalid');
      assert.fail('Should have thrown');
    } catch (e) {
      assert.strictEqual(e.field, 'tag');
    }
  });

  test(166, 'validateBlockTag uses custom field name in error', () => {
    try {
      validateBlockTag('invalid', 'fromBlock');
      assert.fail('Should have thrown');
    } catch (e) {
      assert.strictEqual(e.field, 'fromBlock');
    }
  });

  test(167, 'validateBlockTag error message lists valid options', () => {
    try {
      validateBlockTag('invalid');
      assert.fail('Should have thrown');
    } catch (e) {
      assert.ok(e.message.includes('latest'));
      assert.ok(e.message.includes('earliest'));
      assert.ok(e.message.includes('pending'));
    }
  });

  // ============================================
  // 12. validateNetwork() Tests
  // ============================================
  console.log('\nvalidateNetwork() Tests:');
  console.log('--------------------------------------------');

  test(168, 'validateNetwork does not throw for mainnet', () => {
    assert.doesNotThrow(() => validateNetwork('mainnet'));
  });

  test(169, 'validateNetwork does not throw for sepolia', () => {
    assert.doesNotThrow(() => validateNetwork('sepolia'));
  });

  test(170, 'validateNetwork does not throw for polygon-mainnet', () => {
    assert.doesNotThrow(() => validateNetwork('polygon-mainnet'));
  });

  test(171, 'validateNetwork does not throw for all allowed networks', () => {
    for (const network of ALLOWED_NETWORKS) {
      assert.doesNotThrow(
        () => validateNetwork(network),
        `validateNetwork should not throw for ${network}`
      );
    }
  });

  test(172, 'validateNetwork throws for invalid network', () => {
    assert.throws(
      () => validateNetwork('invalid-network'),
      ValidationError
    );
  });

  test(173, 'validateNetwork throws for MAINNET (uppercase)', () => {
    assert.throws(
      () => validateNetwork('MAINNET'),
      ValidationError
    );
  });

  test(174, 'validateNetwork throws for empty string', () => {
    assert.throws(
      () => validateNetwork(''),
      ValidationError
    );
  });

  test(175, 'validateNetwork throws for null', () => {
    assert.throws(
      () => validateNetwork(null),
      ValidationError
    );
  });

  test(176, 'validateNetwork throws for undefined', () => {
    assert.throws(
      () => validateNetwork(undefined),
      ValidationError
    );
  });

  test(177, 'validateNetwork error has field set to network', () => {
    try {
      validateNetwork('invalid');
      assert.fail('Should have thrown');
    } catch (e) {
      assert.strictEqual(e.field, 'network');
    }
  });

  test(178, 'validateNetwork error message includes invalid network name', () => {
    try {
      validateNetwork('my-custom-network');
      assert.fail('Should have thrown');
    } catch (e) {
      assert.ok(e.message.includes('my-custom-network'));
    }
  });

  test(179, 'validateNetwork throws for deprecated goerli', () => {
    assert.throws(
      () => validateNetwork('goerli'),
      ValidationError
    );
  });

  test(180, 'validateNetwork throws for number type', () => {
    assert.throws(
      () => validateNetwork(1),
      ValidationError
    );
  });

  // ============================================
  // Edge Cases and Boundary Tests
  // ============================================
  console.log('\nEdge Cases and Boundary Tests:');
  console.log('--------------------------------------------');

  test(181, 'Address with embedded newline is invalid', () => {
    assert.strictEqual(
      isValidEthAddress('0xd8da6bf26964af9d7eed9e03e53415\nd37aa96045'),
      false
    );
  });

  test(182, 'Address with leading/trailing whitespace is invalid', () => {
    assert.strictEqual(
      isValidEthAddress(' 0xd8da6bf26964af9d7eed9e03e53415d37aa96045 '),
      false
    );
  });

  test(183, 'Hash with embedded newline is invalid', () => {
    assert.strictEqual(
      isValidHash('0xabcdef1234567890abcdef1234567890abcdef12345\n67890abcdef1234567890'),
      false
    );
  });

  test(184, 'Block tag with whitespace is invalid', () => {
    assert.strictEqual(isValidBlockTag(' latest'), false);
  });

  test(185, 'Hex quantity 0x0 followed by valid digits is still invalid (zero-padded)', () => {
    assert.strictEqual(isValidHexQuantity('0x0f'), false);
  });

  test(186, 'Very large hex quantity is valid', () => {
    assert.strictEqual(isValidHexQuantity('0xffffffffffffffffffffffffffff'), true);
  });

  test(187, 'Network with trailing space is invalid', () => {
    assert.strictEqual(isValidNetwork('mainnet '), false);
  });

  test(188, 'Network with leading space is invalid', () => {
    assert.strictEqual(isValidNetwork(' mainnet'), false);
  });

  test(189, 'Object as input to validators returns false', () => {
    assert.strictEqual(isValidEthAddress({ toString: () => '0xd8da6bf26964af9d7eed9e03e53415d37aa96045' }), false);
    assert.strictEqual(isValidHash({ value: 'hash' }), false);
    assert.strictEqual(isValidBlockTag({ tag: 'latest' }), false);
    assert.strictEqual(isValidNetwork({ network: 'mainnet' }), false);
  });

  test(190, 'Array as input to validators returns false', () => {
    assert.strictEqual(isValidEthAddress(['0xd8da6bf26964af9d7eed9e03e53415d37aa96045']), false);
    assert.strictEqual(isValidHash(['hash']), false);
    assert.strictEqual(isValidBlockTag(['latest']), false);
    assert.strictEqual(isValidNetwork(['mainnet']), false);
  });

  // ============================================
  // Summary
  // ============================================
  console.log('\n============================================');
  console.log('TEST SUMMARY');
  console.log('============================================');
  console.log(`Total Tests:  ${testsPassed + testsFailed}`);
  console.log(`Passed:       ${testsPassed}`);
  console.log(`Failed:       ${testsFailed}`);
  console.log(`Success Rate: ${((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(1)}%`);

  if (failedTests.length > 0) {
    console.log('\nFailed Tests:');
    failedTests.forEach(({ number, description, error }) => {
      console.log(`  ${number}. ${description}`);
      console.log(`     Error: ${error}`);
    });
    console.log('\n============================================');
    console.log('TESTS FAILED');
    console.log('============================================');
    process.exit(1);
  } else {
    console.log('\n============================================');
    console.log('ALL TESTS PASSED');
    console.log('============================================');
    process.exit(0);
  }
}

// Run tests
runTestSuite();
