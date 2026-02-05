/**
 * @fileoverview Tool for retrieving Ethereum chain ID via Infura JSON-RPC API.
 * @module tools/eth-chain-id
 *
 * This tool returns the chain ID of the connected Ethereum network, which is essential
 * for EIP-155 transaction signing to prevent replay attacks across different chains.
 *
 * Chain IDs uniquely identify Ethereum networks:
 * - Mainnet: 0x1 (1)
 * - Sepolia: 0xaa36a7 (11155111)
 * - Holesky: 0x4268 (17000)
 * - Goerli (deprecated): 0x5 (5)
 *
 * Use cases:
 * - Verify connected network before signing transactions
 * - Implement EIP-155 replay protection
 * - Display correct network in wallet UIs
 * - Validate network configuration in dApps
 *
 * @see {@link https://docs.infura.io/api/networks/ethereum/json-rpc-methods/eth_chainid|Infura eth_chainId docs}
 * @see {@link https://eips.ethereum.org/EIPS/eip-155|EIP-155 specification}
 * @see {@link https://chainlist.org/|Complete list of chain IDs}
 *
 * @example
 * // Get mainnet chain ID
 * const result = await eth_chainId({});
 * // Returns: "0x1"
 *
 * @example
 * // Verify Sepolia testnet chain ID
 * const result = await eth_chainId({ network: "sepolia" });
 * // Returns: "0xaa36a7" (11155111 in decimal)
 */

import { callInfura } from "../lib/infura-client.js";

/**
 * Executes the eth_chainId JSON-RPC call to retrieve the network's chain ID.
 *
 * @param {Object} args - The function arguments.
 * @param {string} [args.network="mainnet"] - Target Ethereum network (e.g., "mainnet", "sepolia", "holesky").
 * @returns {Promise<string>} Chain ID as a hexadecimal string (e.g., "0x1" for mainnet, "0xaa36a7" for Sepolia).
 * @throws {McpError} If the Infura API is unavailable or returns an error.
 */
const executeFunction = async ({ network = "mainnet" }) => {
  return callInfura("eth_chainId", [], network);
};

/**
 * Tool configuration for getting the Ethereum chain ID from Infura.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: "function",
    function: {
      name: "eth_chainId",
      description:
        "Get the chain ID of an Ethereum network for EIP-155 transaction signing.\n\nArgs:\n  - network (string, optional): Ethereum network to query. Defaults to 'mainnet'.\n\nReturns:\n  - Hexadecimal string representing the chain ID (e.g., '0x1' for mainnet, '0xaa36a7' for Sepolia).\n\nExamples:\n  - \"Get mainnet chain ID\": {}\n  - \"Get Sepolia chain ID\": { \"network\": \"sepolia\" }\n\nErrors:\n  - InternalError: When Infura API is unavailable or returns an error.",
      parameters: {
        type: "object",
        properties: {
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
        required: [],
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