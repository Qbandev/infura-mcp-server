/**
 * @fileoverview Tool for retrieving EIP-1559 fee history via Infura JSON-RPC API.
 * @module tools/eth-fee-history
 *
 * This tool fetches historical gas fee data to help estimate appropriate gas prices
 * for EIP-1559 transactions. It returns base fee trends and priority fee percentiles
 * across a range of recent blocks.
 *
 * EIP-1559 introduced a new fee model with:
 * - Base fee: Algorithmically determined, burned (not paid to validators)
 * - Priority fee (tip): User-specified amount paid to validators
 * - Max fee: Maximum total fee user is willing to pay
 *
 * The returned data helps wallets and dApps:
 * - Predict future base fees based on network congestion
 * - Suggest appropriate priority fees based on recent successful transactions
 * - Display gas price trends to users
 * - Implement dynamic fee estimation algorithms
 *
 * @see {@link https://docs.infura.io/api/networks/ethereum/json-rpc-methods/eth_feehistory|Infura eth_feeHistory docs}
 * @see {@link https://eips.ethereum.org/EIPS/eip-1559|EIP-1559 specification}
 *
 * @example
 * // Get fee history for last 4 blocks with common percentiles
 * const result = await eth_getFeeHistory({
 *   blockCount: "0x4",
 *   newestBlock: "latest",
 *   rewardPercentiles: [25, 50, 75],
 *   network: "mainnet"
 * });
 * // Returns: { baseFeePerGas: [...], gasUsedRatio: [...], oldestBlock: "0x...", reward: [[...]] }
 *
 * @example
 * // Analyze fee trends on Sepolia
 * const result = await eth_getFeeHistory({
 *   blockCount: "0xa", // 10 blocks
 *   newestBlock: "latest",
 *   rewardPercentiles: [10, 50, 90],
 *   network: "sepolia"
 * });
 */

import { callInfura } from "../lib/infura-client.js";
import { validateBlockTag, isValidHexQuantity, ValidationError } from "../lib/validators.js";

/**
 * Executes the eth_feeHistory JSON-RPC call to retrieve historical fee data.
 *
 * @param {Object} args - The function arguments.
 * @param {string} args.blockCount - Number of blocks to analyze as hex (e.g., "0x4" for 4 blocks, max ~1024).
 * @param {string} args.newestBlock - Latest block to include: "latest", "pending", "safe", "finalized", or hex block number.
 * @param {Array<number>} args.rewardPercentiles - Array of percentile values (0-100) for priority fee sampling.
 * @param {string} [args.network="mainnet"] - Target Ethereum network (e.g., "mainnet", "sepolia", "holesky").
 * @returns {Promise<Object>} Object containing baseFeePerGas (array of hex values for each block + next block), gasUsedRatio (array of decimals), oldestBlock (hex), and reward (2D array of priority fees at each percentile per block).
 * @throws {ValidationError} If blockCount is not a valid hex quantity.
 * @throws {ValidationError} If newestBlock format is invalid.
 * @throws {ValidationError} If rewardPercentiles is not an array of numbers between 0 and 100.
 * @throws {McpError} If the Infura API is unavailable or returns an error.
 */
const executeFunction = async ({
  blockCount,
  newestBlock,
  rewardPercentiles,
  network = "mainnet",
}) => {
  if (!isValidHexQuantity(blockCount)) {
    throw new ValidationError('Invalid blockCount format. Expected hex quantity (e.g., "0x1", "0xa").', 'blockCount');
  }
  validateBlockTag(newestBlock, 'newestBlock');
  if (!Array.isArray(rewardPercentiles) || !rewardPercentiles.every(p => typeof p === 'number' && p >= 0 && p <= 100)) {
    throw new ValidationError('Invalid rewardPercentiles. Expected an array of numbers between 0 and 100.', 'rewardPercentiles');
  }
  const params = [blockCount, newestBlock, rewardPercentiles];
  return callInfura("eth_feeHistory", params, network);
};

/**
 * Tool configuration for getting fee history using Infura's Ethereum JSON-RPC.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: "function",
    function: {
      name: "eth_getFeeHistory",
      description:
        "Get historical gas fee data for EIP-1559 fee estimation.\n\nArgs:\n  - blockCount (string): Number of blocks to analyze as hex (e.g., '0x4' for 4 blocks).\n  - newestBlock (string): Latest block to include ('latest', 'pending', or hex block number).\n  - rewardPercentiles (array): Percentiles for priority fee sampling (e.g., [25, 50, 75]).\n  - network (string, optional): Ethereum network to query. Defaults to 'mainnet'.\n\nReturns:\n  - Object with baseFeePerGas array, gasUsedRatio array, oldestBlock, and reward matrix.\n\nExamples:\n  - \"Get last 4 blocks fee history\": { \"blockCount\": \"0x4\", \"newestBlock\": \"latest\", \"rewardPercentiles\": [25, 50, 75] }\n  - \"Query Sepolia fees\": { \"blockCount\": \"0xa\", \"newestBlock\": \"latest\", \"rewardPercentiles\": [10, 50, 90], \"network\": \"sepolia\" }\n\nErrors:\n  - InvalidParams: When blockCount format, newestBlock, or rewardPercentiles are invalid.\n  - InternalError: When Infura API is unavailable or returns an error.",
      parameters: {
        type: "object",
        properties: {
          blockCount: {
            type: "string",
            description: "The number of blocks to check.",
          },
          newestBlock: {
            type: "string",
            description: "The latest block number or tag (e.g., 'latest').",
          },
          rewardPercentiles: {
            type: "array",
            items: {
              type: "number",
            },
            description: "A list of percentiles for gas rewards.",
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
        required: ["blockCount", "newestBlock", "rewardPercentiles"],
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