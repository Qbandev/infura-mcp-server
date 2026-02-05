/**
 * Input Validators for Ethereum Data
 *
 * This security-focused module provides comprehensive validation functions for
 * Ethereum-related data types. All user inputs should be validated using these
 * functions before being passed to the Infura API to prevent injection attacks
 * and ensure data integrity.
 *
 * The module provides two types of validators:
 * 1. Boolean validators (isValid*) - Return true/false for conditional checks
 * 2. Throwing validators (validate*) - Throw ValidationError with descriptive messages
 *
 * @module validators
 *
 * @example
 * // Boolean validation for conditional logic
 * import { isValidEthAddress, isValidNetwork } from './lib/validators.js';
 *
 * if (isValidEthAddress(userInput)) {
 *   // Process valid address
 * }
 *
 * @example
 * // Throwing validation for fail-fast behavior
 * import { validateAddress, validateNetwork } from './lib/validators.js';
 *
 * try {
 *   validateAddress(userInput, 'fromAddress');
 *   validateNetwork(network);
 * } catch (error) {
 *   console.error(error.message); // User-friendly error message
 * }
 */

/**
 * Validates an Ethereum address format.
 *
 * A valid Ethereum address consists of:
 * - The prefix "0x"
 * - Followed by exactly 40 hexadecimal characters (0-9, a-f, A-F)
 *
 * Note: This validates format only, not checksum. Both checksummed and
 * non-checksummed addresses are accepted.
 *
 * @function isValidEthAddress
 * @param {string} address - The address string to validate
 * @returns {boolean} True if the address matches valid Ethereum address format
 *
 * @example
 * isValidEthAddress('0x742d35Cc6634C0532925a3b844Bc454e4438f44e'); // true
 * isValidEthAddress('0x742d35cc6634c0532925a3b844bc454e4438f44e'); // true (lowercase)
 * isValidEthAddress('742d35Cc6634C0532925a3b844Bc454e4438f44e');   // false (missing 0x)
 * isValidEthAddress('0x742d35Cc6634C0532925a3b844Bc454e4438f4');   // false (39 chars)
 * isValidEthAddress(null);                                          // false
 */
export function isValidEthAddress(address) {
  if (typeof address !== 'string') return false;
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Validates a transaction or block hash format.
 *
 * A valid Ethereum hash (transaction hash or block hash) consists of:
 * - The prefix "0x"
 * - Followed by exactly 64 hexadecimal characters (representing 32 bytes)
 *
 * This is used for:
 * - Transaction hashes (txHash)
 * - Block hashes
 * - State roots
 * - Any 32-byte Keccak-256 hash
 *
 * @function isValidHash
 * @param {string} hash - The hash string to validate
 * @returns {boolean} True if the hash matches valid 32-byte hash format
 *
 * @example
 * // Valid transaction hash
 * isValidHash('0xabc123def456789012345678901234567890123456789012345678901234abcd'); // true
 *
 * // Invalid: wrong length
 * isValidHash('0xabc123'); // false
 *
 * // Invalid: missing prefix
 * isValidHash('abc123def456789012345678901234567890123456789012345678901234abcd'); // false
 *
 * // Invalid: non-string input
 * isValidHash(123); // false
 */
export function isValidHash(hash) {
  if (typeof hash !== 'string') return false;
  return /^0x[a-fA-F0-9]{64}$/.test(hash);
}

/**
 * Validates an Ethereum block tag or block number.
 *
 * Valid block tags are:
 * - "latest": The most recent mined block
 * - "earliest": The genesis block (block 0)
 * - "pending": Pending transactions (may not be supported by all methods)
 * - "safe": The most recent safe head block (post-merge)
 * - "finalized": The most recent finalized block (post-merge)
 * - Hex block number: e.g., "0x1234" for a specific block height
 *
 * @function isValidBlockTag
 * @param {string} tag - The block tag or hex block number to validate
 * @returns {boolean} True if the tag is a valid block identifier
 *
 * @example
 * // Named tags
 * isValidBlockTag('latest');     // true
 * isValidBlockTag('earliest');   // true
 * isValidBlockTag('pending');    // true
 * isValidBlockTag('safe');       // true
 * isValidBlockTag('finalized');  // true
 *
 * // Hex block numbers
 * isValidBlockTag('0x0');        // true (genesis)
 * isValidBlockTag('0x10d4f');    // true
 *
 * // Invalid
 * isValidBlockTag('current');    // false (not a valid tag)
 * isValidBlockTag(100);          // false (must be string)
 */
export function isValidBlockTag(tag) {
  if (typeof tag !== 'string') return false;
  const validTags = ['latest', 'earliest', 'pending', 'safe', 'finalized'];
  return validTags.includes(tag) || /^0x[a-fA-F0-9]+$/.test(tag);
}

/**
 * Validates a hexadecimal string with 0x prefix.
 *
 * A valid hex string consists of:
 * - The prefix "0x"
 * - Followed by zero or more hexadecimal characters
 *
 * This is more permissive than other validators - it allows any length
 * including empty hex ("0x"). Use this for arbitrary data fields like
 * transaction input data.
 *
 * @function isValidHexString
 * @param {string} hex - The hex string to validate
 * @returns {boolean} True if the string is a valid hex format
 *
 * @example
 * isValidHexString('0x');         // true (empty data)
 * isValidHexString('0x1234');     // true
 * isValidHexString('0xabcdef');   // true
 * isValidHexString('0xABCDEF');   // true (uppercase)
 * isValidHexString('1234');       // false (missing 0x)
 * isValidHexString('0xGHIJ');     // false (invalid hex chars)
 */
export function isValidHexString(hex) {
  if (typeof hex !== 'string') return false;
  return /^0x[a-fA-F0-9]*$/.test(hex);
}

/**
 * Validates a hex quantity according to Ethereum JSON-RPC specification.
 *
 * Hex quantities are used for numeric values in Ethereum and must NOT have
 * leading zeros (except for zero itself). This follows the Ethereum JSON-RPC
 * specification for QUANTITY type.
 *
 * Valid formats:
 * - "0x0" (zero)
 * - "0x1" through "0xf..."  (no leading zeros)
 *
 * Invalid formats:
 * - "0x01" (leading zero)
 * - "0x" (empty)
 *
 * @function isValidHexQuantity
 * @param {string} quantity - The hex quantity to validate
 * @returns {boolean} True if the quantity follows proper hex quantity format
 *
 * @example
 * isValidHexQuantity('0x0');      // true (zero)
 * isValidHexQuantity('0x1');      // true
 * isValidHexQuantity('0x10');     // true
 * isValidHexQuantity('0xff');     // true
 * isValidHexQuantity('0x01');     // false (leading zero)
 * isValidHexQuantity('0x');       // false (empty)
 * isValidHexQuantity('0x00');     // false (leading zero)
 */
export function isValidHexQuantity(quantity) {
  if (typeof quantity !== 'string') return false;
  // Allow 0x0 or 0x followed by non-zero-leading hex
  return /^0x(0|[1-9a-fA-F][a-fA-F0-9]*)$/.test(quantity);
}

/**
 * Validates a transaction or log index in hex format.
 *
 * Indices are used to reference specific items within a block:
 * - Transaction index within a block
 * - Log index within a transaction receipt
 * - Uncle index within a block
 *
 * Unlike hex quantities, indices may have leading zeros. The validation
 * simply ensures the format is "0x" followed by at least one hex digit.
 *
 * @function isValidIndex
 * @param {string} index - The index to validate
 * @returns {boolean} True if the index is valid hex format
 *
 * @example
 * isValidIndex('0x0');    // true (first item)
 * isValidIndex('0x1');    // true
 * isValidIndex('0x01');   // true (leading zeros allowed)
 * isValidIndex('0xff');   // true
 * isValidIndex('0x');     // false (empty)
 * isValidIndex('1');      // false (missing 0x)
 */
export function isValidIndex(index) {
  if (typeof index !== 'string') return false;
  return /^0x[a-fA-F0-9]+$/.test(index);
}

/**
 * List of allowed Infura network identifiers.
 *
 * This constant serves as an allowlist for network validation, preventing
 * URL injection attacks by ensuring only known network names are used in
 * API endpoint construction.
 *
 * Networks are grouped by category:
 * - **Ethereum**: mainnet, sepolia (testnet)
 * - **Layer 2 & Sidechains**: Arbitrum, Optimism, Polygon, Base, Linea, zkSync, Scroll, Blast, Mantle
 * - **Other Networks**: Avalanche, BSC, Celo, Palm, StarkNet, opBNB, Swellchain, Unichain
 *
 * Each network has mainnet and testnet variants where applicable.
 *
 * @constant {string[]}
 * @see {@link https://docs.metamask.io/services/get-started/endpoints/|Infura Endpoints Documentation}
 *
 * @example
 * import { ALLOWED_NETWORKS } from './lib/validators.js';
 *
 * console.log(ALLOWED_NETWORKS.length); // 40 networks
 * console.log(ALLOWED_NETWORKS.includes('mainnet')); // true
 * console.log(ALLOWED_NETWORKS.includes('polygon-mainnet')); // true
 */
export const ALLOWED_NETWORKS = [
  // Ethereum
  'mainnet',
  'sepolia',
  // Layer 2 & Sidechains
  'arbitrum-mainnet',
  'arbitrum-sepolia',
  'optimism-mainnet',
  'optimism-sepolia',
  'polygon-mainnet',
  'polygon-amoy',
  'base-mainnet',
  'base-sepolia',
  'linea-mainnet',
  'linea-sepolia',
  'zksync-mainnet',
  'zksync-sepolia',
  'scroll-mainnet',
  'scroll-sepolia',
  'blast-mainnet',
  'blast-sepolia',
  'mantle-mainnet',
  'mantle-sepolia',
  // Other Networks
  'avalanche-mainnet',
  'avalanche-fuji',
  'bsc-mainnet',
  'bsc-testnet',
  'celo-mainnet',
  'celo-alfajores',
  'palm-mainnet',
  'palm-testnet',
  'starknet-mainnet',
  'starknet-sepolia',
  'opbnb-mainnet',
  'opbnb-testnet',
  'swellchain-mainnet',
  'swellchain-testnet',
  'unichain-mainnet',
  'unichain-sepolia',
];

/**
 * Checks if a network identifier is in the allowed networks list.
 *
 * This is a security-critical function that prevents URL injection attacks
 * by validating network names against a known allowlist before they are
 * used to construct API endpoint URLs.
 *
 * @function isValidNetwork
 * @param {string} network - The network identifier to validate
 * @returns {boolean} True if the network is in the allowed list
 *
 * @example
 * isValidNetwork('mainnet');         // true
 * isValidNetwork('polygon-mainnet'); // true
 * isValidNetwork('sepolia');         // true
 * isValidNetwork('invalid-net');     // false
 * isValidNetwork('mainnet.evil.com'); // false (injection attempt)
 * isValidNetwork(null);              // false
 */
export function isValidNetwork(network) {
  if (typeof network !== 'string') return false;
  return ALLOWED_NETWORKS.includes(network);
}

/**
 * Custom error class for input validation failures.
 *
 * ValidationError extends the standard Error class with an additional
 * `field` property that identifies which input field failed validation.
 * This enables precise error reporting to users.
 *
 * @class ValidationError
 * @extends Error
 *
 * @property {string} name - Always 'ValidationError'
 * @property {string} message - Human-readable error description
 * @property {string} field - The name of the field that failed validation
 *
 * @example
 * // Creating a validation error
 * const error = new ValidationError(
 *   'Invalid Ethereum address format',
 *   'fromAddress'
 * );
 *
 * console.log(error.name);    // 'ValidationError'
 * console.log(error.field);   // 'fromAddress'
 * console.log(error.message); // 'Invalid Ethereum address format'
 *
 * @example
 * // Catching validation errors
 * try {
 *   validateAddress(input, 'walletAddress');
 * } catch (error) {
 *   if (error instanceof ValidationError) {
 *     console.error(`Field "${error.field}" is invalid: ${error.message}`);
 *   }
 * }
 */
export class ValidationError extends Error {
  /**
   * Creates a new ValidationError instance.
   *
   * @param {string} message - A descriptive error message
   * @param {string} field - The name of the field that failed validation
   */
  constructor(message, field) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
  }
}

/**
 * Validates an Ethereum address and throws a ValidationError if invalid.
 *
 * This is the throwing variant of isValidEthAddress for use in fail-fast
 * validation scenarios. The error message includes format guidance to help
 * users correct their input.
 *
 * @function validateAddress
 * @param {string} address - The address to validate
 * @param {string} [fieldName='address'] - The field name for error messages
 * @returns {void}
 * @throws {ValidationError} When the address format is invalid
 *
 * @example
 * // Valid address - no error thrown
 * validateAddress('0x742d35Cc6634C0532925a3b844Bc454e4438f44e');
 *
 * // Custom field name for better error messages
 * validateAddress(userInput, 'recipientAddress');
 *
 * // Invalid address - throws ValidationError
 * validateAddress('invalid');
 * // Throws: ValidationError: Invalid Ethereum address for 'address'...
 */
export function validateAddress(address, fieldName = 'address') {
  if (!isValidEthAddress(address)) {
    throw new ValidationError(
      `Invalid Ethereum address for '${fieldName}'. ` +
      `Expected format: 0x followed by 40 hexadecimal characters (e.g., 0x742d35Cc6634C0532925a3b844Bc9e7595f...).`,
      fieldName
    );
  }
}

/**
 * Validates a transaction or block hash and throws a ValidationError if invalid.
 *
 * This is the throwing variant of isValidHash for use in fail-fast validation
 * scenarios. Use this for transaction hashes, block hashes, or any 32-byte hash.
 *
 * @function validateHash
 * @param {string} hash - The hash to validate
 * @param {string} [fieldName='hash'] - The field name for error messages
 * @returns {void}
 * @throws {ValidationError} When the hash format is invalid
 *
 * @example
 * // Valid hash - no error thrown
 * validateHash('0xabc123def456789012345678901234567890123456789012345678901234abcd');
 *
 * // Custom field name
 * validateHash(txHash, 'transactionHash');
 *
 * // Invalid hash - throws ValidationError
 * validateHash('0xshort');
 * // Throws: ValidationError: Invalid hash for 'hash'...
 */
export function validateHash(hash, fieldName = 'hash') {
  if (!isValidHash(hash)) {
    throw new ValidationError(
      `Invalid hash for '${fieldName}'. ` +
      `Expected format: 0x followed by 64 hexadecimal characters.`,
      fieldName
    );
  }
}

/**
 * Validates a block tag and throws a ValidationError if invalid.
 *
 * This is the throwing variant of isValidBlockTag for use in fail-fast
 * validation scenarios. The error message lists all valid named tags
 * plus the hex format option.
 *
 * @function validateBlockTag
 * @param {string} tag - The tag to validate
 * @param {string} [fieldName='tag'] - The field name for error messages
 * @returns {void}
 * @throws {ValidationError} When the block tag is invalid
 *
 * @example
 * // Valid tags - no error thrown
 * validateBlockTag('latest');
 * validateBlockTag('0x10d4f');
 *
 * // Custom field name
 * validateBlockTag(blockParam, 'blockNumber');
 *
 * // Invalid tag - throws ValidationError
 * validateBlockTag('newest');
 * // Throws: ValidationError: Invalid block tag for 'tag'...
 */
export function validateBlockTag(tag, fieldName = 'tag') {
  if (!isValidBlockTag(tag)) {
    throw new ValidationError(
      `Invalid block tag for '${fieldName}'. ` +
      `Expected: 'latest', 'earliest', 'pending', 'safe', 'finalized', or a hex block number (e.g., '0x1234').`,
      fieldName
    );
  }
}

/**
 * Validates a network identifier and throws a ValidationError if not allowed.
 *
 * This security-critical function ensures that only known network identifiers
 * are accepted, preventing URL injection attacks. The error message includes
 * example valid networks and a link to documentation.
 *
 * @function validateNetwork
 * @param {string} network - The network identifier to validate
 * @returns {void}
 * @throws {ValidationError} When the network is not in the allowed list
 *
 * @example
 * // Valid networks - no error thrown
 * validateNetwork('mainnet');
 * validateNetwork('polygon-mainnet');
 * validateNetwork('arbitrum-sepolia');
 *
 * // Invalid network - throws ValidationError with helpful message
 * validateNetwork('invalid-network');
 * // Throws: ValidationError: Invalid network: 'invalid-network'. Valid networks include: mainnet, sepolia, ...
 *
 * // Injection attempt - safely rejected
 * validateNetwork('mainnet.evil.com/attack');
 * // Throws: ValidationError
 */
export function validateNetwork(network) {
  if (!isValidNetwork(network)) {
    const examples = ALLOWED_NETWORKS.slice(0, 5).join(', ');
    throw new ValidationError(
      `Invalid network: '${network}'. Valid networks include: ${examples}, and ${ALLOWED_NETWORKS.length - 5} more. ` +
      `See https://github.com/qbandev/infura-mcp-server#supported-networks for the full list.`,
      'network'
    );
  }
}
