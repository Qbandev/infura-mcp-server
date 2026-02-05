/**
 * Constants for Infura MCP Server
 *
 * This module contains all configuration constants used throughout the server.
 * Constants are organized by category:
 * - Response size limits
 * - Session management
 * - Rate limiting
 * - Retry configuration
 * - Response formatting
 *
 * Modify these values to tune server behavior for different environments
 * or performance requirements.
 *
 * @module constants
 *
 * @example
 * import {
 *   CHARACTER_LIMIT,
 *   MAX_RETRIES,
 *   truncationMessage
 * } from './lib/constants.js';
 *
 * if (response.length > CHARACTER_LIMIT) {
 *   response = response.slice(0, CHARACTER_LIMIT);
 * }
 */

// ============================================================================
// Response Size Limits
// ============================================================================

/**
 * Maximum character count for API response content.
 *
 * Responses exceeding this limit will be truncated to prevent memory issues
 * and ensure reasonable response times. Set to 100KB (100,000 characters).
 *
 * @constant {number}
 * @default 100000
 *
 * @example
 * if (responseText.length > CHARACTER_LIMIT) {
 *   responseText = responseText.slice(0, CHARACTER_LIMIT) + '... [truncated]';
 * }
 */
export const CHARACTER_LIMIT = 100000; // 100KB max response

/**
 * Maximum number of log entries returned per eth_getLogs query.
 *
 * Large log queries can be extremely slow and resource-intensive.
 * This limit prevents runaway queries and encourages pagination.
 *
 * @constant {number}
 * @default 1000
 *
 * @example
 * const logs = await callInfura('eth_getLogs', [filter], network);
 * if (logs.length > LOGS_RESULT_LIMIT) {
 *   // Suggest narrowing the block range
 * }
 */
export const LOGS_RESULT_LIMIT = 1000; // Max logs per eth_getLogs query

// ============================================================================
// Session Management
// ============================================================================

/**
 * Session timeout duration in milliseconds.
 *
 * Inactive sessions will be automatically cleaned up after this duration
 * to prevent memory leaks. Set to 30 minutes (1,800,000 ms).
 *
 * @constant {number}
 * @default 1800000
 *
 * @example
 * const isSessionExpired = (Date.now() - session.lastActivity) > SESSION_TIMEOUT_MS;
 */
export const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

/**
 * Maximum number of concurrent sessions allowed.
 *
 * When this limit is reached, the oldest inactive sessions will be
 * evicted to make room for new connections. This prevents unbounded
 * memory growth.
 *
 * @constant {number}
 * @default 1000
 *
 * @example
 * if (activeSessions.size >= MAX_SESSIONS) {
 *   evictOldestSession();
 * }
 */
export const MAX_SESSIONS = 1000;

// ============================================================================
// Rate Limiting
// ============================================================================

/**
 * Rate limit window duration in milliseconds.
 *
 * Request counts are tracked within this sliding window.
 * Set to 1 minute (60,000 ms).
 *
 * @constant {number}
 * @default 60000
 *
 * @example
 * const windowStart = Date.now() - RATE_LIMIT_WINDOW_MS;
 * const requestsInWindow = requests.filter(t => t > windowStart).length;
 */
export const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute

/**
 * Maximum number of requests allowed per rate limit window.
 *
 * Requests exceeding this limit will be rejected with a rate limit error.
 * This protects both the server and the Infura API from overload.
 *
 * @constant {number}
 * @default 100
 *
 * @example
 * if (requestsInWindow >= RATE_LIMIT_MAX_REQUESTS) {
 *   throw new Error('Rate limit exceeded');
 * }
 */
export const RATE_LIMIT_MAX_REQUESTS = 100; // per window

// ============================================================================
// Retry Configuration
// ============================================================================

/**
 * Maximum number of retry attempts for transient failures.
 *
 * Used by the Infura client for automatic retry logic. After this many
 * total attempts (including the initial request), the error will be
 * propagated to the caller.
 *
 * @constant {number}
 * @default 3
 *
 * @example
 * for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
 *   try {
 *     return await makeRequest();
 *   } catch (error) {
 *     if (!error.isTransient || attempt === MAX_RETRIES - 1) throw error;
 *   }
 * }
 */
export const MAX_RETRIES = 3;

/**
 * Initial retry delay in milliseconds for exponential backoff.
 *
 * Subsequent retries will use increasing delays: 1s, 2s, 4s (for 3 retries).
 * This follows the formula: delay = INITIAL_RETRY_DELAY_MS * 2^attempt
 *
 * @constant {number}
 * @default 1000
 *
 * @example
 * // Exponential backoff calculation
 * const delay = INITIAL_RETRY_DELAY_MS * Math.pow(2, attemptNumber);
 * // attempt 0: 1000ms
 * // attempt 1: 2000ms
 * // attempt 2: 4000ms
 */
export const INITIAL_RETRY_DELAY_MS = 1000;

// ============================================================================
// Response Formatting
// ============================================================================

/**
 * Generates a truncation notice message for large responses.
 *
 * This message is appended to truncated responses to inform users that
 * not all data is shown and suggests using pagination for complete results.
 *
 * @function truncationMessage
 * @param {number} actualCount - The actual number of items in the full result
 * @param {number} limit - The number of items shown after truncation
 * @returns {string} A formatted truncation notice message
 *
 * @example
 * const logs = await getLogs(filter);
 * if (logs.length > LOGS_RESULT_LIMIT) {
 *   const truncated = logs.slice(0, LOGS_RESULT_LIMIT);
 *   const message = truncationMessage(logs.length, LOGS_RESULT_LIMIT);
 *   return JSON.stringify(truncated) + message;
 * }
 * // Output: "\n\n[Response truncated: 5000 items found, showing first 1000. Use pagination parameters for more results.]"
 *
 * @example
 * truncationMessage(5000, 1000);
 * // Returns: "\n\n[Response truncated: 5000 items found, showing first 1000. Use pagination parameters for more results.]"
 */
export const truncationMessage = (actualCount, limit) =>
  `\n\n[Response truncated: ${actualCount} items found, showing first ${limit}. Use pagination parameters for more results.]`;
