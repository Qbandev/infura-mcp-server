import { callInfura } from "../lib/infura-client.js";

/**
 * Function to get fee history from Infura's Ethereum JSON-RPC.
 *
 * @param {Object} args - Arguments for the fee history.
 * @param {string} args.blockCount - The number of blocks to check.
 * @param {string} args.newestBlock - The latest block number or tag.
 * @param {Array<number>} args.rewardPercentiles - A list of percentiles for gas rewards.
 * @param {string} [args.network="mainnet"] The network to query.
 * @returns {Promise<Object>} - The result of the fee history.
 */
const executeFunction = async ({
  blockCount,
  newestBlock,
  rewardPercentiles,
  network = "mainnet",
}) => {
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
      description: "Get fee history for a specified Ethereum network.",
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
        },
        required: ["blockCount", "newestBlock", "rewardPercentiles"],
      },
    },
  },
};

export { apiTool };