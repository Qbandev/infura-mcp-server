import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";

/**
 * Calls the Infura JSON-RPC API.
 *
 * @param {string} method - The JSON-RPC method to call.
 * @param {Array} params - The parameters for the JSON-RPC method.
 * @param {string} network - The Ethereum network to connect to.
 * @returns {Promise<any>} - The result from the JSON-RPC call.
 */
export async function callInfura(method, params, network) {
  const apiKey = process.env.INFURA_API_KEY;

  if (!apiKey) {
    throw new McpError(
      ErrorCode.InvalidRequest,
      "INFURA_API_KEY environment variable not set."
    );
  }

  const url = `https://${network}.infura.io/v3/${apiKey}`;

  const body = {
    jsonrpc: "2.0",
    method,
    params,
    id: 1,
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Infura API error (${response.status}): ${
          errorData.error?.message || response.statusText
        }`
      );
    }

    const data = await response.json();
    if (data.error) {
      throw new Error(`Infura API error: ${data.error.message}`);
    }

    return data.result;
  } catch (error) {
    console.error(`[Infura Client] Error calling ${method}:`, error);
    // Re-throw as an McpError for the server to handle
    throw new McpError(ErrorCode.InternalError, error.message);
  }
} 