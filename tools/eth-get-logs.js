/**
 * @fileoverview Tool for querying event logs from smart contracts via Infura JSON-RPC API.
 * @module tools/eth-get-logs
 *
 * This tool retrieves event logs emitted by smart contracts within a specified block range.
 * Logs can be filtered by contract address and indexed event parameters (topics). This is
 * essential for tracking token transfers, contract events, and blockchain activity.
 *
 * Common use cases include:
 * - Tracking ERC-20 Transfer events (topic: 0xddf252ad...)
 * - Monitoring DEX swaps and liquidity events
 * - Auditing contract state changes
 * - Building event-driven applications
 *
 * @see {@link https://docs.infura.io/api/networks/ethereum/json-rpc-methods/eth_getlogs|Infura eth_getLogs docs}
 * @see {@link https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getlogs|Ethereum JSON-RPC spec}
 *
 * @example
 * // Get all logs from a specific block range
 * const result = await eth_getLogs({
 *   fromBlock: "0x10d4f",
 *   toBlock: "0x10d50",
 *   network: "mainnet"
 * });
 *
 * @example
 * // Filter ERC-20 Transfer events from USDT contract
 * const result = await eth_getLogs({
 *   fromBlock: "latest",
 *   toBlock: "latest",
 *   address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
 *   topics: ["0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"],
 *   network: "mainnet"
 * });
 * // Returns: { logs: [...], pagination: { total, count, offset, limit, has_more, next_offset } }
 *
 * @example
 * // Paginate through large result sets
 * const result = await eth_getLogs({
 *   fromBlock: "0x10d4f",
 *   toBlock: "0x10d50",
 *   limit: 100,
 *   offset: 0
 * });
 * // Use result.pagination.next_offset for the next page if result.pagination.has_more is true
 */

import { callInfura } from "../lib/infura-client.js";
import { validateAddress, validateBlockTag } from "../lib/validators.js";

/**
 * Executes the eth_getLogs JSON-RPC call to retrieve filtered event logs.
 *
 * @param {Object} args - The function arguments.
 * @param {string} args.fromBlock - Starting block: hex number (e.g., "0x10d4f") or tag ("latest", "earliest", "pending", "safe", "finalized").
 * @param {string} args.toBlock - Ending block: hex number or tag.
 * @param {string} [args.address] - Optional contract address to filter logs from (0x-prefixed, 40 hex chars).
 * @param {Array<string|null>} [args.topics=[]] - Array of 32-byte topic filters for indexed event parameters. Use null for wildcards.
 * @param {string} [args.network="mainnet"] - Target Ethereum network (e.g., "mainnet", "sepolia", "holesky").
 * @param {number} [args.limit=1000] - Maximum number of logs to return (1-10000). Use with offset for pagination.
 * @param {number} [args.offset=0] - Number of logs to skip for pagination.
 * @returns {Promise<Object>} Object containing logs array and pagination metadata.
 * @throws {ValidationError} If fromBlock or toBlock format is invalid.
 * @throws {ValidationError} If address is provided but has invalid format.
 * @throws {McpError} If the query range is too large or Infura API fails.
 */
const executeFunction = async ({
  fromBlock,
  toBlock,
  address,
  topics = [],
  network = "mainnet",
  limit = 1000,
  offset = 0,
}) => {
  validateBlockTag(fromBlock, 'fromBlock');
  validateBlockTag(toBlock, 'toBlock');
  // Address is optional per Ethereum JSON-RPC spec (can get logs from all contracts)
  if (address) {
    validateAddress(address);
  }

  // Validate and clamp pagination parameters
  const validLimit = Math.max(1, Math.min(10000, Number(limit) || 1000));
  const validOffset = Math.max(0, Number(offset) || 0);

  const params = [
    {
      fromBlock,
      toBlock,
      ...(address && { address }),
      topics,
    },
  ];

  // Call Infura API (does not support pagination natively)
  const allLogs = await callInfura("eth_getLogs", params, network);

  // Apply pagination to results
  const total = allLogs.length;
  const paginatedLogs = allLogs.slice(validOffset, validOffset + validLimit);
  const hasMore = validOffset + paginatedLogs.length < total;

  // Return with pagination metadata
  return {
    logs: paginatedLogs,
    pagination: {
      total,
      count: paginatedLogs.length,
      offset: validOffset,
      limit: validLimit,
      has_more: hasMore,
      next_offset: hasMore ? validOffset + paginatedLogs.length : null,
    },
  };
};

/**
 * Tool configuration for retrieving logs from Ethereum using Infura.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: "function",
    function: {
      name: "eth_getLogs",
      description:
        "Query event logs emitted by smart contracts with flexible filters. Supports pagination for large result sets.\n\nArgs:\n  - fromBlock (string): Start block as hex (e.g., '0x10d4f') or tag ('latest', 'earliest', 'pending').\n  - toBlock (string): End block as hex or tag.\n  - address (string, optional): Contract address to filter logs from.\n  - topics (array, optional): Array of 32-byte topic filters for indexed event parameters.\n  - network (string, optional): Ethereum network to query. Defaults to 'mainnet'.\n  - limit (integer, optional): Maximum logs to return (1-10000). Defaults to 1000.\n  - offset (integer, optional): Number of logs to skip for pagination. Defaults to 0.\n\nReturns:\n  - Object with 'logs' array and 'pagination' metadata (total, count, offset, limit, has_more, next_offset).\n\nExamples:\n  - \"Get all logs in block range\": { \"fromBlock\": \"0x10d4f\", \"toBlock\": \"0x10d50\" }\n  - \"Filter by contract and topic\": { \"fromBlock\": \"latest\", \"toBlock\": \"latest\", \"address\": \"0xdAC17F958D2ee523a2206206994597C13D831ec7\", \"topics\": [\"0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef\"] }\n  - \"Paginate results\": { \"fromBlock\": \"0x10d4f\", \"toBlock\": \"0x10d50\", \"limit\": 100, \"offset\": 0 }\n\nErrors:\n  - InvalidParams: When block tags or address format is invalid.\n  - InternalError: When query range is too large or Infura API fails.",
      parameters: {
        type: "object",
        properties: {
          fromBlock: {
            type: "string",
            description: "The starting block number or block identifier.",
          },
          toBlock: {
            type: "string",
            description: "The ending block number or block identifier.",
          },
          address: {
            type: "string",
            description: "The address of the contract to filter logs.",
          },
          topics: {
            type: "array",
            items: {
              type: "string",
            },
            description: "An array of topics to filter logs.",
          },
          network: {
            type: "string",
            description: "The Ethereum network to query, e.g., 'mainnet' or 'sepolia'.",
            default: "mainnet",
          },
          limit: {
            type: "integer",
            description: "Maximum number of logs to return (default: 1000, max: 10000). Use with offset for pagination.",
            default: 1000,
            minimum: 1,
            maximum: 10000,
          },
          offset: {
            type: "integer",
            description: "Number of logs to skip for pagination (default: 0).",
            default: 0,
            minimum: 0,
          },
          response_format: {
            type: "string",
            enum: ["json", "markdown"],
            description: "Output format: 'json' for structured data, 'markdown' for human-readable.",
            default: "json",
          },
        },
        required: ["fromBlock", "toBlock"],
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
  },
};

export { apiTool };