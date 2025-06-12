#!/usr/bin/env node

/**
 * Integration Tests
 * Tests actual API functionality with real Infura calls (requires valid API key)
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Known test data for integration tests
const INTEGRATION_TEST_DATA = {
  // Well-known addresses
  ADDRESSES: {
    ZERO: '0x0000000000000000000000000000000000000000',
    VITALIK: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
    USDC_MAINNET: '0xA0b86a33E6441C8C1Afe8C76E4D5EB6e8c97e8B8'
  },
  // Networks to test
  NETWORKS: ['mainnet', 'sepolia'],
  // Expected chain IDs
  CHAIN_IDS: {
    mainnet: '0x1',
    sepolia: '0xaa36a7'
  }
};

class IntegrationTester {
  constructor() {
    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      errors: []
    };
    
    this.hasApiKey = !!process.env.INFURA_API_KEY && 
                     process.env.INFURA_API_KEY !== 'test_key_for_validation' &&
                     process.env.INFURA_API_KEY !== 'your_infura_api_key_here';
  }

  log(level, message) {
    const timestamp = new Date().toISOString();
    const prefix = level === 'error' ? '❌' : level === 'warn' ? '⚠️' : level === 'success' ? '✅' : 'ℹ️';
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async discoverTools() {
    const toolsPath = join(__dirname, '../lib/tools.js');
    const { discoverTools } = await import(toolsPath);
    return await discoverTools();
  }

  async testBasicNetworkFunctionality() {
    this.log('info', 'Testing basic network functionality...');
    
    const tools = await this.discoverTools();
    const chainIdTool = tools.find(t => t.definition.function.name === 'eth_chainId');
    const blockNumberTool = tools.find(t => t.definition.function.name === 'eth_blockNumber');
    const gasPriceTool = tools.find(t => t.definition.function.name === 'eth_gasPrice');

    for (const network of INTEGRATION_TEST_DATA.NETWORKS) {
      this.results.total += 3; // 3 tests per network

      try {
        // Test chain ID
        const chainId = await chainIdTool.function({ network });
        const expectedChainId = INTEGRATION_TEST_DATA.CHAIN_IDS[network];
        
        if (chainId === expectedChainId) {
          this.results.passed++;
          this.log('success', `✅ ${network} chain ID: ${chainId}`);
        } else {
          this.results.failed++;
          this.results.errors.push({
            test: `${network}_chainId`,
            error: `Expected ${expectedChainId}, got ${chainId}`
          });
          this.log('error', `❌ ${network} chain ID mismatch: expected ${expectedChainId}, got ${chainId}`);
        }

        // Test block number
        const blockNumber = await blockNumberTool.function({ network });
        if (blockNumber && typeof blockNumber === 'string' && blockNumber.startsWith('0x')) {
          this.results.passed++;
          this.log('success', `✅ ${network} block number: ${blockNumber}`);
        } else {
          this.results.failed++;
          this.results.errors.push({
            test: `${network}_blockNumber`,
            error: `Invalid block number: ${blockNumber}`
          });
          this.log('error', `❌ ${network} invalid block number: ${blockNumber}`);
        }

        // Test gas price
        const gasPrice = await gasPriceTool.function({ network });
        if (gasPrice && typeof gasPrice === 'string' && gasPrice.startsWith('0x')) {
          this.results.passed++;
          this.log('success', `✅ ${network} gas price: ${gasPrice}`);
        } else {
          this.results.failed++;
          this.results.errors.push({
            test: `${network}_gasPrice`,
            error: `Invalid gas price: ${gasPrice}`
          });
          this.log('error', `❌ ${network} invalid gas price: ${gasPrice}`);
        }

      } catch (error) {
        this.results.failed += 3;
        this.results.errors.push({
          test: `${network}_basic_functionality`,
          error: error.message
        });
        this.log('error', `❌ ${network} basic functionality failed: ${error.message}`);
      }
    }
  }

  async testAccountOperations() {
    this.log('info', 'Testing account operations...');
    
    const tools = await this.discoverTools();
    const balanceTool = tools.find(t => t.definition.function.name === 'eth_getBalance');
    const transactionCountTool = tools.find(t => t.definition.function.name === 'eth_getTransactionCount');
    const codeTool = tools.find(t => t.definition.function.name === 'eth_getCode');

    for (const network of INTEGRATION_TEST_DATA.NETWORKS) {
      this.results.total += 3;

      try {
        // Test balance for zero address (should be 0)
        const zeroBalance = await balanceTool.function({ 
          address: INTEGRATION_TEST_DATA.ADDRESSES.ZERO, 
          tag: 'latest',
          network 
        });
        
        if (zeroBalance === '0x0') {
          this.results.passed++;
          this.log('success', `✅ ${network} zero address balance: ${zeroBalance}`);
        } else {
          this.results.failed++;
          this.results.errors.push({
            test: `${network}_zero_balance`,
            error: `Expected 0x0, got ${zeroBalance}`
          });
          this.log('error', `❌ ${network} zero address balance unexpected: ${zeroBalance}`);
        }

        // Test transaction count for zero address (should be 0)
        const zeroTxCount = await transactionCountTool.function({ 
          address: INTEGRATION_TEST_DATA.ADDRESSES.ZERO, 
          tag: 'latest',
          network 
        });
        
        if (zeroTxCount === '0x0') {
          this.results.passed++;
          this.log('success', `✅ ${network} zero address tx count: ${zeroTxCount}`);
        } else {
          this.results.failed++;
          this.results.errors.push({
            test: `${network}_zero_tx_count`,
            error: `Expected 0x0, got ${zeroTxCount}`
          });
          this.log('error', `❌ ${network} zero address tx count unexpected: ${zeroTxCount}`);
        }

        // Test code for zero address (should be 0x)
        const zeroCode = await codeTool.function({ 
          contractAddress: INTEGRATION_TEST_DATA.ADDRESSES.ZERO,
          network 
        });
        
        if (zeroCode === '0x') {
          this.results.passed++;
          this.log('success', `✅ ${network} zero address code: ${zeroCode}`);
        } else {
          this.results.failed++;
          this.results.errors.push({
            test: `${network}_zero_code`,
            error: `Expected 0x, got ${zeroCode}`
          });
          this.log('error', `❌ ${network} zero address code unexpected: ${zeroCode}`);
        }

      } catch (error) {
        this.results.failed += 3;
        this.results.errors.push({
          test: `${network}_account_operations`,
          error: error.message
        });
        this.log('error', `❌ ${network} account operations failed: ${error.message}`);
      }
    }
  }

  async testSmartContractInteractions() {
    this.log('info', 'Testing smart contract interactions...');
    
    const tools = await this.discoverTools();
    const callTool = tools.find(t => t.definition.function.name === 'eth_call');
    const estimateGasTool = tools.find(t => t.definition.function.name === 'eth_estimateGas');

    // Only test on mainnet for contract interactions
    const network = 'mainnet';
    this.results.total += 2;

    try {
      // Test eth_call with a simple contract call (USDC totalSupply)
      // totalSupply() function signature: 0x18160ddd
      const totalSupplyCall = await callTool.function({
        to: INTEGRATION_TEST_DATA.ADDRESSES.USDC_MAINNET,
        data: '0x18160ddd',
        network
      });
      
      if (totalSupplyCall && typeof totalSupplyCall === 'string' && totalSupplyCall.startsWith('0x')) {
        this.results.passed++;
        this.log('success', `✅ ${network} contract call (USDC totalSupply): ${totalSupplyCall.slice(0, 20)}...`);
      } else {
        this.results.failed++;
        this.results.errors.push({
          test: `${network}_contract_call`,
          error: `Invalid contract call result: ${totalSupplyCall}`
        });
        this.log('error', `❌ ${network} contract call failed: ${totalSupplyCall}`);
      }

      // Test gas estimation for a simple transfer
      const gasEstimate = await estimateGasTool.function({
        from: INTEGRATION_TEST_DATA.ADDRESSES.VITALIK,
        to: INTEGRATION_TEST_DATA.ADDRESSES.ZERO,
        value: '0x1',
        network
      });
      
      if (gasEstimate && typeof gasEstimate === 'string' && gasEstimate.startsWith('0x')) {
        this.results.passed++;
        this.log('success', `✅ ${network} gas estimate: ${gasEstimate}`);
      } else {
        this.results.failed++;
        this.results.errors.push({
          test: `${network}_gas_estimate`,
          error: `Invalid gas estimate: ${gasEstimate}`
        });
        this.log('error', `❌ ${network} gas estimate failed: ${gasEstimate}`);
      }

    } catch (error) {
      this.results.failed += 2;
      this.results.errors.push({
        test: `${network}_contract_interactions`,
        error: error.message
      });
      this.log('error', `❌ ${network} contract interactions failed: ${error.message}`);
    }
  }

  async testErrorHandling() {
    this.log('info', 'Testing error handling...');
    
    const tools = await this.discoverTools();
    const balanceTool = tools.find(t => t.definition.function.name === 'eth_getBalance');

    this.results.total += 2;

    try {
      // Test with invalid address
      try {
        await balanceTool.function({ 
          address: 'invalid_address', 
          tag: 'latest',
          network: 'mainnet' 
        });
        
        // If we get here, the test failed (should have thrown)
        this.results.failed++;
        this.results.errors.push({
          test: 'invalid_address_error_handling',
          error: 'Expected error for invalid address, but got success'
        });
        this.log('error', '❌ Invalid address should have thrown an error');
      } catch (error) {
        // This is expected
        this.results.passed++;
        this.log('success', '✅ Invalid address properly rejected');
      }

      // Test with invalid network
      try {
        await balanceTool.function({ 
          address: INTEGRATION_TEST_DATA.ADDRESSES.ZERO, 
          tag: 'latest',
          network: 'invalid_network' 
        });
        
        // If we get here, the test failed (should have thrown)
        this.results.failed++;
        this.results.errors.push({
          test: 'invalid_network_error_handling',
          error: 'Expected error for invalid network, but got success'
        });
        this.log('error', '❌ Invalid network should have thrown an error');
      } catch (error) {
        // This is expected
        this.results.passed++;
        this.log('success', '✅ Invalid network properly rejected');
      }

    } catch (error) {
      this.results.failed += 2;
      this.results.errors.push({
        test: 'error_handling',
        error: error.message
      });
      this.log('error', `❌ Error handling test failed: ${error.message}`);
    }
  }

  async runIntegrationTests() {
    this.log('info', 'Starting integration tests...');
    
    if (!this.hasApiKey) {
      this.log('warn', '⚠️ No valid Infura API key found. Skipping integration tests.');
      this.log('info', 'Set INFURA_API_KEY environment variable to run integration tests.');
      return;
    }

    this.log('info', '🔑 Valid API key detected. Running integration tests...');

    try {
      await this.testBasicNetworkFunctionality();
      await this.testAccountOperations();
      await this.testSmartContractInteractions();
      await this.testErrorHandling();

      // Print summary
      this.log('info', '═══════════════════════════════════════════');
      this.log('info', 'INTEGRATION TEST SUMMARY');
      this.log('info', '═══════════════════════════════════════════');
      this.log('info', `Total Tests: ${this.results.total}`);
      this.log('info', `Passed: ${this.results.passed}`);
      this.log('info', `Failed: ${this.results.failed}`);
      this.log('info', `Success Rate: ${((this.results.passed / this.results.total) * 100).toFixed(1)}%`);

      if (this.results.errors.length > 0) {
        this.log('error', '\nFailed Tests:');
        this.results.errors.forEach(error => {
          this.log('error', `  ${error.test}: ${error.error}`);
        });
      }

      if (this.results.failed === 0) {
        this.log('success', '\n🎉 All integration tests passed!');
        process.exit(0);
      } else {
        this.log('error', '\n❌ Some integration tests failed.');
        process.exit(1);
      }

    } catch (error) {
      this.log('error', `Integration test suite failed: ${error.message}`);
      process.exit(1);
    }
  }
}

// Run tests if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new IntegrationTester();
  tester.runIntegrationTests();
}

export { IntegrationTester }; 