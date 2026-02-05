/**
 * Structured Error Classes for Infura MCP Server
 *
 * This module provides custom error classes and utilities for handling
 * and classifying errors from the Infura API. It enables:
 * - Distinguishing between transient and permanent failures
 * - Automatic retry decisions based on error classification
 * - User-friendly, actionable error messages
 *
 * @module errors
 *
 * @example
 * import { InfuraApiError, classifyHttpError, createActionableMessage } from './lib/errors.js';
 *
 * // Create and classify an API error
 * const { isTransient, category } = classifyHttpError(429);
 * const error = new InfuraApiError('Rate limited', { httpStatus: 429, isTransient });
 *
 * if (error.isTransient) {
 *   // Retry the request
 * } else {
 *   // Report to user
 *   const message = createActionableMessage(error, { network: 'mainnet' });
 * }
 */

/**
 * Custom error class for Infura API failures with error classification.
 *
 * InfuraApiError extends the standard Error with additional properties that
 * enable intelligent error handling:
 * - `httpStatus`: The HTTP status code (for HTTP-level errors)
 * - `rpcCode`: The JSON-RPC error code (for RPC-level errors)
 * - `isTransient`: Whether the error is likely to succeed on retry
 *
 * @class InfuraApiError
 * @extends Error
 *
 * @property {string} name - Always 'InfuraApiError'
 * @property {string} message - Human-readable error description
 * @property {number|null} httpStatus - HTTP status code (e.g., 429, 500, 401)
 * @property {number|null} rpcCode - JSON-RPC error code (e.g., -32600, -32601)
 * @property {boolean} isTransient - True if the error may succeed on retry
 *
 * @example
 * // Rate limit error (transient)
 * const rateLimitError = new InfuraApiError(
 *   'Rate limit exceeded',
 *   { httpStatus: 429, isTransient: true }
 * );
 *
 * @example
 * // Authentication error (permanent)
 * const authError = new InfuraApiError(
 *   'Invalid API key',
 *   { httpStatus: 401, isTransient: false }
 * );
 *
 * @example
 * // JSON-RPC error
 * const rpcError = new InfuraApiError(
 *   'Method not found',
 *   { rpcCode: -32601, isTransient: false }
 * );
 */
export class InfuraApiError extends Error {
  /**
   * Creates a new InfuraApiError instance.
   *
   * @param {string} message - A descriptive error message
   * @param {Object} [options={}] - Error classification options
   * @param {number|null} [options.httpStatus=null] - HTTP status code if applicable
   * @param {number|null} [options.rpcCode=null] - JSON-RPC error code if applicable
   * @param {boolean} [options.isTransient=false] - Whether the error is transient
   */
  constructor(message, { httpStatus = null, rpcCode = null, isTransient = false } = {}) {
    super(message);
    this.name = 'InfuraApiError';
    this.httpStatus = httpStatus;
    this.rpcCode = rpcCode;
    this.isTransient = isTransient;
  }
}

/**
 * Classifies an HTTP status code for appropriate error handling.
 *
 * This function categorizes HTTP errors to determine:
 * 1. Whether the error is transient (may succeed on retry)
 * 2. The error category for logging and user messaging
 *
 * Error classifications:
 * - **429 (Rate Limit)**: Transient - retry after delay
 * - **5xx (Server Error)**: Transient - server-side issues may resolve
 * - **401/403 (Auth Error)**: Permanent - requires credential fix
 * - **404 (Not Found)**: Permanent - resource doesn't exist
 * - **Other 4xx**: Permanent - client-side errors
 *
 * @function classifyHttpError
 * @param {number} status - The HTTP status code to classify
 * @returns {{ isTransient: boolean, category: string }} Classification result
 * @returns {boolean} .isTransient - True if the error may succeed on retry
 * @returns {string} .category - Error category: 'rate_limit', 'server_error', 'auth_error', 'not_found', or 'client_error'
 *
 * @example
 * // Rate limiting - should retry
 * classifyHttpError(429);
 * // Returns: { isTransient: true, category: 'rate_limit' }
 *
 * @example
 * // Server error - should retry
 * classifyHttpError(503);
 * // Returns: { isTransient: true, category: 'server_error' }
 *
 * @example
 * // Authentication error - don't retry
 * classifyHttpError(401);
 * // Returns: { isTransient: false, category: 'auth_error' }
 *
 * @example
 * // Usage with retry logic
 * const { isTransient, category } = classifyHttpError(response.status);
 * if (isTransient && attempt < maxRetries) {
 *   await sleep(calculateRetryDelay(attempt));
 *   continue;
 * }
 */
export function classifyHttpError(status) {
  if (status === 429) return { isTransient: true, category: 'rate_limit' };
  if (status >= 500) return { isTransient: true, category: 'server_error' };
  if (status === 401 || status === 403) return { isTransient: false, category: 'auth_error' };
  if (status === 404) return { isTransient: false, category: 'not_found' };
  return { isTransient: false, category: 'client_error' };
}

/**
 * Creates user-friendly error messages with actionable guidance.
 *
 * This function transforms technical API errors into helpful messages that:
 * 1. Explain what went wrong in plain language
 * 2. Provide specific steps the user can take to resolve the issue
 * 3. Include relevant links to documentation or pricing pages
 *
 * Message types:
 * - **Rate limit (429)**: Suggests waiting or upgrading plan
 * - **Auth errors (401/403)**: Points to API key configuration
 * - **Server errors (5xx)**: Explains transient nature, suggests retry
 * - **Timeout**: Suggests retry or simpler queries
 * - **Other**: Returns original error message
 *
 * @function createActionableMessage
 * @param {InfuraApiError|Error} error - The error to create a message for
 * @param {Object} [context={}] - Additional context for the error message
 * @param {string} [context.network] - The network being accessed (for auth error messages)
 * @returns {string} A user-friendly, actionable error message
 *
 * @example
 * // Rate limit error
 * const error = new InfuraApiError('', { httpStatus: 429 });
 * createActionableMessage(error);
 * // Returns: "Rate limit exceeded. Wait 60 seconds before retrying, or upgrade your Infura plan at https://infura.io/pricing"
 *
 * @example
 * // Authentication error with network context
 * const error = new InfuraApiError('', { httpStatus: 401 });
 * createActionableMessage(error, { network: 'polygon-mainnet' });
 * // Returns: "Authentication failed. Verify your INFURA_API_KEY is correct and has access to polygon-mainnet."
 *
 * @example
 * // Server error
 * const error = new InfuraApiError('', { httpStatus: 503 });
 * createActionableMessage(error);
 * // Returns: "Infura service temporarily unavailable (HTTP 503). This is a transient error - retry in a few seconds."
 *
 * @example
 * // Timeout error
 * const error = new Error('Request timed out');
 * error.name = 'AbortError';
 * createActionableMessage(error);
 * // Returns: "Request timed out. The network may be congested - try again or use a simpler query."
 */
export function createActionableMessage(error, context = {}) {
  if (error.httpStatus === 429) {
    return `Rate limit exceeded. Wait 60 seconds before retrying, or upgrade your Infura plan at https://infura.io/pricing`;
  }
  if (error.httpStatus === 401 || error.httpStatus === 403) {
    return `Authentication failed. Verify your INFURA_API_KEY is correct and has access to ${context.network || 'this network'}.`;
  }
  if (error.httpStatus >= 500) {
    return `Infura service temporarily unavailable (HTTP ${error.httpStatus}). This is a transient error - retry in a few seconds.`;
  }
  if (error.name === 'AbortError' || error.message?.includes('timeout')) {
    return `Request timed out. The network may be congested - try again or use a simpler query.`;
  }
  return error.message || 'An unexpected error occurred';
}
