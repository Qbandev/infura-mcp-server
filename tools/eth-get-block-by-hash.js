import { callInfura } from "../lib/infura-client.js";
import { validateHash } from "../lib/validators.js";

/**
 * Function to get block information by hash from the Ethereum network using Infura.
 *
 * @param {Object} args - Arguments for the block retrieval.
 * @param {string} args.blockHash - The 32-byte hash of the block to retrieve.
 * @param {boolean} args.fullTransactions - If true, returns full transaction objects; if false, returns transaction hashes.
 * @param {string} [args.network="mainnet"] The network to query.
 * @returns {Promise<Object>} - The result of the block retrieval.
 */
const executeFunction = async ({
  blockHash,
  fullTransactions = false,
  network = "mainnet",
}) => {
  validateHash(blockHash, 'blockHash');
  return callInfura(
    "eth_getBlockByHash",
    [blockHash, fullTransactions],
    network
  );
};

/**
 * Tool configuration for retrieving block information by hash from Infura.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: "function",
    function: {
      name: "eth_getBlockByHash",
      description:
        "Get detailed block information using its hash.\n\nArgs:\n  - blockHash (string): 32-byte block hash (66 chars with 0x prefix).\n  - fullTransactions (boolean): If true, returns full tx objects; if false, returns tx hashes only.\n  - network (string, optional): Ethereum network to query. Defaults to 'mainnet'.\n\nReturns:\n  - Block object with number, hash, parentHash, transactions, gasUsed, timestamp, etc. Returns null if block not found.\n\nExamples:\n  - \"Get block with tx hashes\": { \"blockHash\": \"0x...\", \"fullTransactions\": false }\n  - \"Get block with full txs\": { \"blockHash\": \"0x...\", \"fullTransactions\": true, \"network\": \"mainnet\" }\n\nErrors:\n  - InvalidParams: When blockHash format is invalid (not 66 char hex).\n  - InternalError: When Infura API is unavailable or returns an error.",
      parameters: {
        type: "object",
        properties: {
          blockHash: {
            type: "string",
            description: "The 32-byte hash of the block to retrieve.",
          },
          fullTransactions: {
            type: "boolean",
            description:
              "If true, returns full transaction objects; if false, returns transaction hashes.",
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
        required: ["blockHash"],
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