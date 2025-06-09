import { callInfura } from "../lib/infura-client.js";

/**
 * Function to submit a Proof of Work solution to the Ethereum network.
 *
 * @param {Object} args - Arguments for the submission.
 * @param {string} args.nonce - The retrieved nonce (8 Bytes).
 * @param {string} args.powHash - The hash of the block header (32 Bytes).
 * @param {string} args.mixDigest - The mix digest (32 Bytes).
 * @param {string} [args.network="mainnet"] The network to query.
 * @returns {Promise<Object>} - The result of the submission, indicating if the solution is valid.
 */
const executeFunction = async ({
  nonce,
  powHash,
  mixDigest,
  network = "mainnet",
}) => {
  return callInfura("eth_submitWork", [nonce, powHash, mixDigest], network);
};

/**
 * Tool configuration for submitting Proof of Work solutions to Ethereum.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: "function",
    function: {
      name: "eth_submitWork",
      description: "Submits a Proof of Work (Ethash) solution to a specified network.",
      parameters: {
        type: "object",
        properties: {
          nonce: {
            type: "string",
            description: "Retrieved nonce (8 Bytes).",
          },
          powHash: {
            type: "string",
            description: "Hash of the block header (32 Bytes).",
          },
          mixDigest: {
            type: "string",
            description: "Mix digest (32 Bytes).",
          },
          network: {
            type: "string",
            description: "The Ethereum network to query, e.g., 'mainnet' or 'sepolia'.",
            default: "mainnet",
          },
        },
        required: ["nonce", "powHash", "mixDigest"],
      },
    },
  },
};

export { apiTool };