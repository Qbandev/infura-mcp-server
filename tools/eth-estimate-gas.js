/**
 * @fileoverview Tool for estimating transaction gas costs via Infura JSON-RPC API.
 * @module tools/eth-estimate-gas
 *
 * This tool estimates the gas required to execute a transaction without actually
 * broadcasting it to the network. It simulates the transaction against the current
 * blockchain state and returns the estimated gas units needed.
 *
 * Use cases:
 * - Calculate gas costs before sending transactions
 * - Verify transactions will not revert
 * - Determine appropriate gas limits for wallet UIs
 * - Pre-flight checks for complex contract interactions
 *
 * Important notes:
 * - Estimation is based on current state; actual gas may differ if state changes
 * - A simple ETH transfer uses exactly 21,000 gas (0x5208)
 * - Contract calls vary based on execution path and storage operations
 * - If the transaction would revert, this call will fail with an error
 *
 * @see {@link https://docs.infura.io/api/networks/ethereum/json-rpc-methods/eth_estimategas|Infura eth_estimateGas docs}
 * @see {@link https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_estimategas|Ethereum JSON-RPC spec}
 *
 * @example
 * // Estimate gas for a simple ETH transfer
 * const result = await eth_estimateGas({
 *   from: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
 *   to: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
 *   value: "0xde0b6b3a7640000", // 1 ETH in wei
 *   network: "mainnet"
 * });
 * // Returns: "0x5208" (21000 gas for simple transfer)
 *
 * @example
 * // Estimate gas on Sepolia testnet
 * const result = await eth_estimateGas({
 *   from: "0x...",
 *   to: "0x...",
 *   value: "0x0",
 *   network: "sepolia"
 * });
 */

import { callInfura } from "../lib/infura-client.js";
import { validateAddress, isValidHexString, ValidationError } from "../lib/validators.js";

/**
 * Executes the eth_estimateGas JSON-RPC call to estimate transaction gas requirements.
 *
 * @param {Object} args - The function arguments.
 * @param {string} args.from - Sender address (0x-prefixed, 40 hex characters).
 * @param {string} args.to - Recipient address (0x-prefixed, 40 hex characters).
 * @param {string} args.value - Amount to send in wei as hex string (e.g., "0xde0b6b3a7640000" for 1 ETH).
 * @param {string} [args.network="mainnet"] - Target Ethereum network (e.g., "mainnet", "sepolia", "holesky").
 * @returns {Promise<string>} Estimated gas units as a hexadecimal string (e.g., "0x5208" for 21000 gas).
 * @throws {ValidationError} If the "from" or "to" address format is invalid.
 * @throws {ValidationError} If the "value" is not a valid hex string starting with 0x.
 * @throws {McpError} If the transaction would revert or Infura API fails.
 */
const executeFunction = async ({ from, to, value, network = "mainnet" }) => {
  validateAddress(from, 'from');
  validateAddress(to, 'to');
  if (!isValidHexString(value)) {
    throw new ValidationError('Invalid value format. Expected hex string starting with 0x.', 'value');
  }
  const params = [
    {
      from,
      to,
      value,
    },
    "latest",
  ];
  return callInfura("eth_estimateGas", params, network);
};

/**
 * Tool configuration for estimating gas for a transaction on Ethereum.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: "function",
    function: {
      name: "eth_estimateGas",
      description:
        "Estimate the gas required to execute a transaction without broadcasting it.\n\nArgs:\n  - from (string): Sender address (20-byte hex, e.g., '0x...').\n  - to (string): Recipient address (20-byte hex, e.g., '0x...').\n  - value (string): Amount to send in wei as hex (e.g., '0xde0b6b3a7640000' for 1 ETH).\n  - network (string, optional): Ethereum network to query. Defaults to 'mainnet'.\n\nReturns:\n  - Hexadecimal string representing estimated gas units (e.g., '0x5208' for 21000 gas).\n\nExamples:\n  - \"Estimate ETH transfer\": { \"from\": \"0xYourAddress\", \"to\": \"0xRecipient\", \"value\": \"0xde0b6b3a7640000\" }\n  - \"Estimate on Sepolia\": { \"from\": \"0x...\", \"to\": \"0x...\", \"value\": \"0x0\", \"network\": \"sepolia\" }\n\nErrors:\n  - InvalidParams: When address format or value format is invalid.\n  - InternalError: When transaction would revert or Infura API fails.",
      parameters: {
        type: "object",
        properties: {
          from: {
            type: "string",
            description: "The address from which the transaction is sent.",
          },
          to: {
            type: "string",
            description: "The address to which the transaction is sent.",
          },
          value: {
            type: "string",
            description: "The amount of Ether to send (in wei).",
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
        required: ["from", "to", "value"],
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