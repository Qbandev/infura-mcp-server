#!/usr/bin/env node

/**
 * Simple test script for the MCP SSE server
 * This script tests the basic SSE connection and message flow
 */

import fetch from 'node-fetch';
import EventSource from 'eventsource';

const SERVER_URL = 'http://localhost:3001';

async function testSSEConnection() {
  console.log('🧪 Testing MCP SSE Server...\n');

  try {
    // Step 1: Connect to SSE endpoint
    console.log('📡 Connecting to SSE endpoint...');
    const sse = new EventSource(`${SERVER_URL}/sse`);
    
    let sessionId = null;
    let messageEndpoint = null;
    const responses = new Map(); // Track responses by ID

    // Handle SSE events
    sse.addEventListener('endpoint', (event) => {
      messageEndpoint = event.data;
      console.log(`✅ Received endpoint: ${messageEndpoint}`);
      
      // Extract sessionId from the endpoint URL
      const url = new URL(messageEndpoint, SERVER_URL);
      sessionId = url.searchParams.get('sessionId');
      if (sessionId) {
        console.log(`✅ Extracted sessionId: ${sessionId}`);
      }
    });

    // Listen for JSON-RPC messages on the SSE stream
    sse.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log('📥 SSE Message received:', JSON.stringify(message, null, 2));
        
        // If it's a response (has an id), store it
        if (message.id !== undefined) {
          responses.set(message.id, message);
        }
      } catch (error) {
        console.log('📥 SSE Non-JSON message:', event.data);
      }
    };

    sse.onopen = () => {
      console.log('✅ SSE connection opened');
    };

    sse.onerror = (error) => {
      console.error('❌ SSE error:', error);
    };

    // Helper function to send JSON-RPC message and wait for response
    async function sendJsonRpcMessage(method, params = {}, id = null) {
      const message = {
        jsonrpc: '2.0',
        method,
        ...(id !== null && { id }),
        ...(Object.keys(params).length > 0 && { params })
      };

      console.log(`📤 Sending ${method}:`, JSON.stringify(message, null, 2));

      const response = await fetch(`${SERVER_URL}${messageEndpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message)
      });

      if (response.ok) {
        console.log(`✅ ${method} request acknowledged (${response.status})`);
        
        // If we expect a response, wait for it on the SSE stream
        if (id !== null) {
          return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
              reject(new Error(`Timeout waiting for response to ${method} (id: ${id})`));
            }, 5000);

            const checkResponse = () => {
              if (responses.has(id)) {
                clearTimeout(timeout);
                const result = responses.get(id);
                responses.delete(id);
                resolve(result);
              } else {
                setTimeout(checkResponse, 100);
              }
            };
            checkResponse();
          });
        }
        return null; // No response expected for notifications
      } else {
        const errorText = await response.text();
        throw new Error(`${method} failed: ${response.status} ${errorText}`);
      }
    }

    // Wait for connection to be established
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Timeout waiting for SSE connection'));
      }, 10000);

      const checkConnection = () => {
        if (sessionId && messageEndpoint) {
          clearTimeout(timeout);
          resolve();
        } else {
          setTimeout(checkConnection, 100);
        }
      };
      checkConnection();
    });

    // Step 2: Send initialize request
    console.log('\n📨 Sending initialize request...');
    const initResult = await sendJsonRpcMessage('initialize', {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: {
        name: 'test-client',
        version: '1.0.0'
      }
    }, 1);
    
    console.log('✅ Initialize response:', JSON.stringify(initResult, null, 2));

    // Step 3: Send initialized notification
    console.log('\n📨 Sending initialized notification...');
    await sendJsonRpcMessage('notifications/initialized');
    console.log('✅ Initialized notification sent');

    // Step 4: List tools
    console.log('\n📨 Listing tools...');
    const toolsResult = await sendJsonRpcMessage('tools/list', {}, 2);
    console.log('✅ Tools response:', JSON.stringify(toolsResult, null, 2));

    // Step 5: Test a tool (if available)
    if (toolsResult.result && toolsResult.result.tools && toolsResult.result.tools.length > 0) {
      const firstTool = toolsResult.result.tools[0];
      console.log(`\n📨 Testing tool: ${firstTool.name}...`);
      
      const toolResult = await sendJsonRpcMessage('tools/call', {
        name: firstTool.name,
        arguments: { network: 'mainnet' }
      }, 3);
      
      console.log('✅ Tool response:', JSON.stringify(toolResult, null, 2));
    }

    // Clean up
    setTimeout(() => {
      sse.close();
      console.log('\n🎉 Test completed successfully!');
      process.exit(0);
    }, 1000);

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Make sure we have the required dependencies
try {
  testSSEConnection();
} catch (error) {
  if (error.code === 'MODULE_NOT_FOUND') {
    console.error('❌ Missing dependencies. Please run: npm install node-fetch eventsource');
    process.exit(1);
  } else {
    throw error;
  }
} 