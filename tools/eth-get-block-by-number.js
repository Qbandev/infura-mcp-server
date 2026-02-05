/**
 * @fileoverview Tool for retrieving block data by number via Infura JSON-RPC API.
 * @module tools/eth-get-block-by-number
 *
 * This tool fetches detailed information about a specific Ethereum block using its
 * block number or a block tag. It can return either full transaction objects or
 * just transaction hashes, depending on the use case.
 *
 * Block data includes:
 * - Block metadata (number, hash, parentHash, timestamp, nonce)
 * - Gas information (gasLimit, gasUsed, baseFeePerGas)
 * - State roots (stateRoot, transactionsRoot, receiptsRoot)
 * - Miner/validator information
 * - Transactions (full objects or hashes)
 *
 * @see {@link https://docs.infura.io/api/networks/ethereum/json-rpc-methods/eth_getblockbynumber|Infura eth_getBlockByNumber docs}
 * @see {@link https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getblockbynumber|Ethereum JSON-RPC spec}
 *
 * @example
 * // Get the latest block with transaction hashes only
 * const result = await eth_getBlockByNumber({
 *   blockNumber: "latest",
 *   fullTransactions: false,
 *   network: "mainnet"
 * });
 * // Returns: Block object with transactions as array of hashes
 *
 * @example
 * // Get a specific block with full transaction details
 * const result = await eth_getBlockByNumber({
 *   blockNumber: "0x10d4f",
 *   fullTransactions: true,
 *   network: "mainnet"
 * });
 * // Returns: Block object with transactions as array of full tx objects
 */

import { callInfura } from "../lib/infura-client.js";
import { validateBlockTag } from "../lib/validators.js";

/**
 * Executes the eth_getBlockByNumber JSON-RPC call to retrieve block information.
 *
 * @param {Object} args - The function arguments.
 * @param {string} args.blockNumber - Block identifier: hex number (e.g., "0x10d4f") or tag ("latest", "earliest", "pending", "safe", "finalized").
 * @param {boolean} args.fullTransactions - If true, returns full transaction objects; if false, returns only transaction hashes.
 * @param {string} [args.network="mainnet"] - Target Ethereum network (e.g., "mainnet", "sepolia", "holesky").
 * @returns {Promise<Object|null>} Block object with number, hash, parentHash, transactions, gasUsed, timestamp, etc. Returns null if block not found.
 * @throws {ValidationError} If blockNumber format is invalid or not a recognized tag.
 * @throws {McpError} If the Infura API is unavailable or returns an error.
 */
const executeFunction = async ({
  blockNumber,
  fullTransactions = false,
  network = "mainnet",
}) => {
  validateBlockTag(blockNumber, 'blockNumber');
  return callInfura(
    "eth_getBlockByNumber",
    [blockNumber, fullTransactions],
    network
  );
};

/**
 * Tool configuration for retrieving block information from the Infura Ethereum JSON-RPC API.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: "function",
    function: {
      name: "eth_getBlockByNumber",
      description:
        "Get detailed block information using its number or tag.\n\nArgs:\n  - blockNumber (string): Block number as hex (e.g., '0x10d4f') or tag ('latest', 'earliest', 'pending').\n  - fullTransactions (boolean): If true, returns full tx objects; if false, returns tx hashes only.\n  - network (string, optional): Ethereum network to query. Defaults to 'mainnet'.\n\nReturns:\n  - Block object with number, hash, parentHash, transactions, gasUsed, timestamp, etc. Returns null if block not found.\n\nExamples:\n  - \"Get latest block\": { \"blockNumber\": \"latest\", \"fullTransactions\": false }\n  - \"Get specific block with full txs\": { \"blockNumber\": \"0x10d4f\", \"fullTransactions\": true }\n\nErrors:\n  - InvalidParams: When blockNumber format is invalid.\n  - InternalError: When Infura API is unavailable or returns an error.",
      parameters: {
        type: "object",
        properties: {
          blockNumber: {
            type: "string",
            description:
              "The block number in hexadecimal format or one of the string tags `latest`, `earliest`, or `pending`.",
          },
          fullTransactions: {
            type: "boolean",
            description:
              "If true, returns the full transaction objects; if false, returns only the hashes of the transactions.",
            default: false,
          },
          network: {
            type: "string",
            description: "The Ethereum network to query, e.g., 'mainnet' or 'sepolia'.",
            default: "mainnet",
          },
          response_format: {
            type: "string",
            enum: ["json", "markdown"],
            description: "Output format: 'json' for structured data, 'markdown' for human-readable.",
            default: "json",
          },
        },
        required: ["blockNumber"],
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