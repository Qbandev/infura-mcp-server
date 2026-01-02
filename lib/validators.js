/**
 * Input Validators for Ethereum Data
 * Security module to validate user inputs before processing
 */

/**
 * Validates an Ethereum address format (0x followed by 40 hex characters)
 * @param {string} address - The address to validate
 * @returns {boolean} True if valid Ethereum address format
 */
export function isValidEthAddress(address) {
  if (typeof address !== 'string') return false;
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Validates a transaction or block hash format (0x followed by 64 hex characters)
 * @param {string} hash - The hash to validate
 * @returns {boolean} True if valid hash format
 */
export function isValidHash(hash) {
  if (typeof hash !== 'string') return false;
  return /^0x[a-fA-F0-9]{64}$/.test(hash);
}

/**
 * Validates a block tag (latest, earliest, pending, safe, finalized, or hex block number)
 * @param {string} tag - The block tag to validate
 * @returns {boolean} True if valid block tag
 */
export function isValidBlockTag(tag) {
  if (typeof tag !== 'string') return false;
  const validTags = ['latest', 'earliest', 'pending', 'safe', 'finalized'];
  return validTags.includes(tag) || /^0x[a-fA-F0-9]+$/.test(tag);
}

/**
 * Validates a hex string (0x followed by hex characters)
 * @param {string} hex - The hex string to validate
 * @returns {boolean} True if valid hex string
 */
export function isValidHexString(hex) {
  if (typeof hex !== 'string') return false;
  return /^0x[a-fA-F0-9]*$/.test(hex);
}

/**
 * Validates a hex quantity (non-zero-padded hex number)
 * @param {string} quantity - The hex quantity to validate
 * @returns {boolean} True if valid hex quantity
 */
export function isValidHexQuantity(quantity) {
  if (typeof quantity !== 'string') return false;
  // Allow 0x0 or 0x followed by non-zero-leading hex
  return /^0x(0|[1-9a-fA-F][a-fA-F0-9]*)$/.test(quantity);
}

/**
 * Validates a transaction index (hex format)
 * @param {string} index - The index to validate
 * @returns {boolean} True if valid index
 */
export function isValidIndex(index) {
  if (typeof index !== 'string') return false;
  return /^0x[a-fA-F0-9]+$/.test(index);
}

/**
 * Allowed Infura networks
 * Reference: https://docs.metamask.io/services/get-started/endpoints/
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
 * Validates if a network is in the allowed list
 * @param {string} network - The network to validate
 * @returns {boolean} True if network is allowed
 */
export function isValidNetwork(network) {
  if (typeof network !== 'string') return false;
  return ALLOWED_NETWORKS.includes(network);
}

/**
 * Validation error class for input validation failures
 */
export class ValidationError extends Error {
  constructor(message, field) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
  }
}

/**
 * Validates an Ethereum address and throws if invalid
 * @param {string} address - The address to validate
 * @param {string} fieldName - The field name for error messages
 * @throws {ValidationError} If address is invalid
 */
export function validateAddress(address, fieldName = 'address') {
  if (!isValidEthAddress(address)) {
    throw new ValidationError(
      `Invalid Ethereum address format for ${fieldName}. Expected 0x followed by 40 hex characters.`,
      fieldName
    );
  }
}

/**
 * Validates a hash and throws if invalid
 * @param {string} hash - The hash to validate
 * @param {string} fieldName - The field name for error messages
 * @throws {ValidationError} If hash is invalid
 */
export function validateHash(hash, fieldName = 'hash') {
  if (!isValidHash(hash)) {
    throw new ValidationError(
      `Invalid hash format for ${fieldName}. Expected 0x followed by 64 hex characters.`,
      fieldName
    );
  }
}

/**
 * Validates a block tag and throws if invalid
 * @param {string} tag - The tag to validate
 * @param {string} fieldName - The field name for error messages
 * @throws {ValidationError} If tag is invalid
 */
export function validateBlockTag(tag, fieldName = 'tag') {
  if (!isValidBlockTag(tag)) {
    throw new ValidationError(
      `Invalid block tag for ${fieldName}. Expected 'latest', 'earliest', 'pending', 'safe', 'finalized', or hex block number.`,
      fieldName
    );
  }
}

/**
 * Validates a network and throws if invalid
 * @param {string} network - The network to validate
 * @throws {ValidationError} If network is not allowed
 */
export function validateNetwork(network) {
  if (!isValidNetwork(network)) {
    throw new ValidationError(
      `Invalid network: ${network}. See documentation for supported networks.`,
      'network'
    );
  }
}
