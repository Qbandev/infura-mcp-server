/**
 * @fileoverview Tool for retrieving Ethereum network version via Infura JSON-RPC API.
 * @module tools/net-version
 *
 * This tool returns the network ID (also known as network version) of the connected
 * Ethereum network. While similar to chain ID, the network ID is a legacy identifier
 * primarily used in older transaction signing schemes.
 *
 * Common network IDs:
 * - Mainnet: "1"
 * - Sepolia: "11155111"
 * - Holesky: "17000"
 * - Goerli (deprecated): "5"
 *
 * Difference from eth_chainId:
 * - net_version returns a decimal string (e.g., "1")
 * - eth_chainId returns a hex string (e.g., "0x1")
 * - For most modern networks, they represent the same value
 * - eth_chainId (EIP-155) is preferred for transaction signing
 *
 * Use cases:
 * - Legacy dApp compatibility
 * - Network identification in older protocols
 * - Verification of node connectivity
 *
 * @see {@link https://docs.infura.io/api/networks/ethereum/json-rpc-methods/net_version|Infura net_version docs}
 * @see {@link https://ethereum.org/en/developers/docs/apis/json-rpc/#net_version|Ethereum JSON-RPC spec}
 *
 * @example
 * // Get mainnet network ID
 * const result = await net_getVersion({});
 * // Returns: "1"
 *
 * @example
 * // Verify Sepolia network ID
 * const result = await net_getVersion({ network: "sepolia" });
 * // Returns: "11155111"
 */

import { callInfura } from "../lib/infura-client.js";

/**
 * Executes the net_version JSON-RPC call to retrieve the network ID.
 *
 * @param {Object} args - The function arguments.
 * @param {string} [args.network="mainnet"] - Target Ethereum network (e.g., "mainnet", "sepolia", "holesky").
 * @returns {Promise<string>} Network ID as a decimal string (e.g., "1" for mainnet, "11155111" for Sepolia).
 * @throws {McpError} If the Infura API is unavailable or returns an error.
 */
const executeFunction = async ({ network = "mainnet" }) => {
  return callInfura("net_version", [], network);
};

/**
 * Tool configuration for getting the network ID from Infura Ethereum JSON-RPC.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: "function",
    function: {
      name: "net_getVersion",
      description:
        "Returns the current network ID. Useful for identifying which Ethereum network the node is connected to (1=mainnet, 11155111=sepolia, etc.).\n\nArgs:\n  - network (string, optional): Ethereum network to query, defaults to 'mainnet'\n\nReturns:\n  - String representing the network ID (e.g., '1' for mainnet, '11155111' for Sepolia)\n\nExamples:\n  - \"Get mainnet network ID\": {}\n  - \"Verify Sepolia network ID\": { \"network\": \"sepolia\" }\n\nErrors:\n  - InternalError: When Infura API is unavailable",
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