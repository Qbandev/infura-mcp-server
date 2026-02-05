/**
 * Infura JSON-RPC Client Module
 *
 * This module provides a robust HTTP client for interacting with the Infura
 * Ethereum JSON-RPC API. It includes automatic retry logic with exponential
 * backoff for transient failures, proper error classification, and network
 * validation to prevent URL injection attacks.
 *
 * @module infura-client
 * @requires @modelcontextprotocol/sdk/types.js
 * @requires ./validators.js
 * @requires ./errors.js
 * @requires ./constants.js
 *
 * @example
 * // Basic usage
 * import { callInfura } from './lib/infura-client.js';
 *
 * // Get the latest block number
 * const blockNumber = await callInfura('eth_blockNumber', [], 'mainnet');
 *
 * // Get account balance
 * const balance = await callInfura(
 *   'eth_getBalance',
 *   ['0x742d35Cc6634C0532925a3b844Bc454e4438f44e', 'latest'],
 *   'mainnet'
 * );
 */

import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import { validateNetwork } from "./validators.js";
import { InfuraApiError, classifyHttpError, createActionableMessage } from "./errors.js";
import { MAX_RETRIES, INITIAL_RETRY_DELAY_MS } from "./constants.js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

// Read package version for User-Agent header
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageJson = JSON.parse(readFileSync(path.join(__dirname, "../package.json"), "utf-8"));

/**
 * User-Agent header string sent with all Infura API requests.
 * Format: "infura-mcp-server/{version}" where version is read from package.json.
 *
 * @constant {string}
 * @example
 * // Results in header like: "infura-mcp-server/1.0.6"
 */
const USER_AGENT = `infura-mcp-server/${packageJson.version}`;

/**
 * Pauses execution for a specified duration.
 *
 * Used internally for implementing retry delays with exponential backoff.
 * This is a non-blocking sleep that returns a Promise.
 *
 * @function sleep
 * @param {number} ms - The number of milliseconds to sleep
 * @returns {Promise<void>} A promise that resolves after the specified delay
 *
 * @example
 * // Wait for 1 second before continuing
 * await sleep(1000);
 *
 * // Use in retry logic
 * for (let attempt = 0; attempt < 3; attempt++) {
 *   try {
 *     return await makeRequest();
 *   } catch (error) {
 *     await sleep(1000 * Math.pow(2, attempt));
 *   }
 * }
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Calculates the delay before the next retry attempt using exponential backoff.
 *
 * If a Retry-After header value is provided (from rate limiting responses),
 * that value takes precedence over the calculated backoff. Otherwise, uses
 * exponential backoff starting from INITIAL_RETRY_DELAY_MS (1 second).
 *
 * Backoff sequence: 1s, 2s, 4s (for attempts 0, 1, 2)
 *
 * @function calculateRetryDelay
 * @param {number} attempt - The current attempt number (0-indexed)
 * @param {number|null} [retryAfter=null] - Optional Retry-After header value in seconds
 * @returns {number} The delay in milliseconds before the next retry
 *
 * @example
 * // First retry after 1 second
 * calculateRetryDelay(0);        // Returns 1000
 *
 * // Second retry after 2 seconds
 * calculateRetryDelay(1);        // Returns 2000
 *
 * // Third retry after 4 seconds
 * calculateRetryDelay(2);        // Returns 4000
 *
 * // With Retry-After header (30 seconds)
 * calculateRetryDelay(0, 30);    // Returns 30000
 */
function calculateRetryDelay(attempt, retryAfter = null) {
  if (retryAfter !== null) {
    return retryAfter * 1000;
  }
  // Exponential backoff: 1s, 2s, 4s
  return INITIAL_RETRY_DELAY_MS * Math.pow(2, attempt);
}

/**
 * Parses the Retry-After HTTP header from a response.
 *
 * The Retry-After header can be specified in two formats according to RFC 7231:
 * 1. Seconds (integer): Number of seconds to wait (e.g., "60")
 * 2. HTTP-date: A specific date/time to retry after (e.g., "Wed, 21 Oct 2015 07:28:00 GMT")
 *
 * This function handles both formats and converts them to seconds.
 *
 * @function parseRetryAfter
 * @param {Response} response - The Fetch API Response object containing headers
 * @returns {number|null} The retry delay in seconds, or null if header is not present or unparseable
 *
 * @example
 * // Parsing seconds format
 * const response = new Response(null, {
 *   headers: { 'Retry-After': '60' }
 * });
 * parseRetryAfter(response); // Returns 60
 *
 * @example
 * // Parsing HTTP-date format
 * const response = new Response(null, {
 *   headers: { 'Retry-After': 'Wed, 21 Oct 2025 07:28:00 GMT' }
 * });
 * parseRetryAfter(response); // Returns seconds until that date
 *
 * @example
 * // No header present
 * const response = new Response(null, {});
 * parseRetryAfter(response); // Returns null
 */
function parseRetryAfter(response) {
  const retryAfter = response.headers.get('Retry-After');
  if (!retryAfter) return null;

  // Retry-After can be seconds or HTTP date
  const seconds = parseInt(retryAfter, 10);
  if (!isNaN(seconds)) return seconds;

  // Try parsing as HTTP date
  const date = Date.parse(retryAfter);
  if (!isNaN(date)) {
    const delayMs = date - Date.now();
    return Math.max(0, Math.ceil(delayMs / 1000));
  }

  return null;
}

/**
 * Calls the Infura JSON-RPC API with automatic retry logic for transient failures.
 *
 * This is the main function for interacting with Infura's Ethereum API. It handles:
 * - Network validation to prevent URL injection attacks
 * - Automatic retries with exponential backoff for transient errors (429, 5xx)
 * - Proper error classification and user-friendly error messages
 * - JSON-RPC 2.0 protocol compliance
 *
 * The function requires the INFURA_API_KEY environment variable to be set.
 *
 * @async
 * @function callInfura
 * @param {string} method - The JSON-RPC method to call (e.g., 'eth_blockNumber', 'eth_getBalance')
 * @param {Array<any>} params - The parameters for the JSON-RPC method (varies by method)
 * @param {string} network - The Ethereum network to connect to (e.g., 'mainnet', 'sepolia', 'polygon-mainnet')
 * @returns {Promise<any>} The result field from the JSON-RPC response (type varies by method)
 *
 * @throws {McpError} With ErrorCode.InvalidRequest if INFURA_API_KEY is not set
 * @throws {McpError} With ErrorCode.InvalidParams if network is not in the allowed list
 * @throws {McpError} With ErrorCode.InternalError for API errors or after max retries exceeded
 *
 * @example
 * // Get latest block number
 * const blockNumber = await callInfura('eth_blockNumber', [], 'mainnet');
 * // Returns: "0x10d4f"
 *
 * @example
 * // Get account balance at latest block
 * const balance = await callInfura(
 *   'eth_getBalance',
 *   ['0x742d35Cc6634C0532925a3b844Bc454e4438f44e', 'latest'],
 *   'mainnet'
 * );
 * // Returns: "0x1234567890abcdef"
 *
 * @example
 * // Get transaction by hash
 * const tx = await callInfura(
 *   'eth_getTransactionByHash',
 *   ['0xabc123...'],
 *   'polygon-mainnet'
 * );
 * // Returns: { hash: '0x...', from: '0x...', to: '0x...', ... }
 *
 * @example
 * // Error handling
 * try {
 *   const result = await callInfura('eth_call', [txObject, 'latest'], 'mainnet');
 * } catch (error) {
 *   if (error.code === ErrorCode.InvalidParams) {
 *     console.error('Invalid network specified');
 *   }
 * }
 */
export async function callInfura(method, params, network) {
  const apiKey = process.env.INFURA_API_KEY;

  if (!apiKey) {
    throw new McpError(
      ErrorCode.InvalidRequest,
      "INFURA_API_KEY environment variable not set."
    );
  }

  // Validate network against allowlist to prevent URL injection
  try {
    validateNetwork(network);
  } catch (error) {
    throw new McpError(ErrorCode.InvalidParams, error.message);
  }

  const url = `https://${network}.infura.io/v3/${apiKey}`;

  const body = {
    jsonrpc: "2.0",
    method,
    params,
    id: 1,
  };

  let lastError = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": USER_AGENT,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const { isTransient, category } = classifyHttpError(response.status);
        let errorMessage;

        try {
          const errorData = await response.json();
          errorMessage = errorData.error?.message || response.statusText;
        } catch {
          errorMessage = response.statusText;
        }

        const apiError = new InfuraApiError(
          `Infura API error (${response.status}): ${errorMessage}`,
          {
            httpStatus: response.status,
            isTransient,
          }
        );

        // Retry transient errors
        if (isTransient && attempt < MAX_RETRIES - 1) {
          const retryAfter = parseRetryAfter(response);
          const delay = calculateRetryDelay(attempt, retryAfter);
          console.error(
            `[Infura Client] Transient error (${category}), retrying in ${delay}ms (attempt ${attempt + 1}/${MAX_RETRIES})`
          );
          lastError = apiError;
          await sleep(delay);
          continue;
        }

        // Non-transient error or max retries reached
        const actionableMessage = createActionableMessage(apiError, { network });
        throw new McpError(ErrorCode.InternalError, actionableMessage);
      }

      const data = await response.json();
      if (data.error) {
        const apiError = new InfuraApiError(
          `Infura API error: ${data.error.message}`,
          {
            rpcCode: data.error.code,
            isTransient: false,
          }
        );
        throw new McpError(ErrorCode.InternalError, apiError.message);
      }

      return data.result;
    } catch (error) {
      // If it's already an McpError, re-throw it
      if (error instanceof McpError) {
        throw error;
      }

      // Handle network errors (timeout, connection refused, etc.)
      const isNetworkError = error.name === 'AbortError' ||
                             error.name === 'TypeError' ||
                             error.message?.includes('fetch');

      if (isNetworkError && attempt < MAX_RETRIES - 1) {
        const delay = calculateRetryDelay(attempt);
        console.error(
          `[Infura Client] Network error, retrying in ${delay}ms (attempt ${attempt + 1}/${MAX_RETRIES}):`,
          error.message
        );
        lastError = error;
        await sleep(delay);
        continue;
      }

      console.error(`[Infura Client] Error calling ${method}:`, error);

      // Create actionable message for the error
      const apiError = new InfuraApiError(error.message, { isTransient: false });
      const actionableMessage = createActionableMessage(apiError, { network });

      throw new McpError(ErrorCode.InternalError, actionableMessage);
    }
  }

  // This should not be reached, but handle it just in case
  const errorMessage = lastError?.message || 'Max retries exceeded';
  throw new McpError(ErrorCode.InternalError, `Failed after ${MAX_RETRIES} attempts: ${errorMessage}`);
}
