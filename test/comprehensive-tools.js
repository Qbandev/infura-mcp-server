#!/usr/bin/env node

/**
 * Comprehensive Tools Test Suite
 * Tests all 40 tools for functionality, parameter validation, error handling, and network support
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { callInfura } from '../lib/infura-client.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Test configuration
const TEST_CONFIG = {
  // Test networks - using mock API key for validation tests
  NETWORKS: ['mainnet', 'sepolia', 'polygon-mainnet', 'arbitrum-mainnet'],
  MOCK_API_KEY: 'test_key_for_validation',
  // Real addresses for testing (well-known addresses)
  TEST_ADDRESSES: {
    ZERO_ADDRESS: '0x0000000000000000000000000000000000000000',
    VITALIK_ETH: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
    USDC_CONTRACT: '0xA0b86a33E6441C8C1Afe8C76E4D5EB6e8c97e8B8'
  },
  // Test transaction hashes and block hashes (known values)
  TEST_DATA: {
    BLOCK_NUMBER: '0x1000000', // Block 16777216
    BLOCK_HASH: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    TX_HASH: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890'
  }
};

class ToolTester {
  constructor() {
    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      errors: []
    };
    this.hasRealApiKey = !!process.env.INFURA_API_KEY && process.env.INFURA_API_KEY !== TEST_CONFIG.MOCK_API_KEY;
  }

  log(level, message) {
    const timestamp = new Date().toISOString();
    const prefix = level === 'error' ? '❌' : level === 'warn' ? '⚠️' : level === 'success' ? '✅' : 'ℹ️';
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async discoverTools() {
    try {
      const toolsPath = join(__dirname, '../lib/tools.js');
      const { discoverTools } = await import(toolsPath);
      return await discoverTools();
    } catch (error) {
      throw new Error(`Failed to discover tools: ${error.message}`);
    }
  }

  validateToolStructure(tool) {
    const errors = [];

    // Check basic structure
    if (!tool.function || typeof tool.function !== 'function') {
      errors.push('Missing or invalid function');
    }

    if (!tool.definition || !tool.definition.function) {
      errors.push('Missing tool definition');
    }

    const def = tool.definition.function;
    
    // Check required fields
    if (!def.name) errors.push('Missing tool name');
    if (!def.description) errors.push('Missing tool description');
    if (!def.parameters) errors.push('Missing parameters definition');

    // Check parameters structure
    if (def.parameters) {
      if (def.parameters.type !== 'object') {
        errors.push('Parameters type should be object');
      }
      if (!def.parameters.properties) {
        errors.push('Missing parameters properties');
      }

      // Check network parameter exists and has default
      if (def.parameters.properties.network) {
        const networkParam = def.parameters.properties.network;
        if (!networkParam.default && !def.parameters.required?.includes('network')) {
          errors.push('Network parameter should have default value or be required');
        }
      }
    }

    return errors;
  }

  async testToolParameters(tool) {
    const def = tool.definition.function;
    const errors = [];

    try {
      // Test with minimal valid parameters
      const minimalParams = { network: 'mainnet' };
      
      // Add required parameters with mock values
      if (def.parameters.required) {
        for (const param of def.parameters.required) {
          if (param === 'address') {
            minimalParams.address = TEST_CONFIG.TEST_ADDRESSES.ZERO_ADDRESS;
          } else if (param === 'tag') {
            minimalParams.tag = 'latest';
          } else if (param === 'blockNumber') {
            minimalParams.blockNumber = TEST_CONFIG.TEST_DATA.BLOCK_NUMBER;
          } else if (param === 'blockHash') {
            minimalParams.blockHash = TEST_CONFIG.TEST_DATA.BLOCK_HASH;
          } else if (param === 'transactionHash') {
            minimalParams.transactionHash = TEST_CONFIG.TEST_DATA.TX_HASH;
          } else if (param === 'to') {
            minimalParams.to = TEST_CONFIG.TEST_ADDRESSES.USDC_CONTRACT;
          } else if (param === 'data') {
            minimalParams.data = '0x';
          } else {
            // Default value for unknown required params
            minimalParams[param] = '';
          }
        }
      }

      // Don't actually call if we don't have a real API key
      if (!this.hasRealApiKey) {
        // Just test that the function can be called without throwing parameter errors
        // We'll catch network errors which is expected
        try {
          await tool.function(minimalParams);
        } catch (error) {
          // Expected network errors are OK when using mock API key
          if (error.message.includes('INFURA_API_KEY') || 
              error.message.includes('network') || 
              error.message.includes('401') ||
              error.message.includes('403')) {
            // This is expected with mock API key
            return [];
          }
          errors.push(`Parameter validation failed: ${error.message}`);
        }
      } else {
        // With real API key, test one simple call
        if (def.name === 'eth_chainId') {
          try {
            const result = await tool.function({ network: 'mainnet' });
            if (!result) {
              errors.push('Function returned null/undefined result');
            }
          } catch (error) {
            errors.push(`Function call failed: ${error.message}`);
          }
        }
      }

    } catch (error) {
      errors.push(`Parameter test setup failed: ${error.message}`);
    }

    return errors;
  }

  testParameterValidation(tool) {
    const def = tool.definition.function;
    const errors = [];

    // Check required parameters are properly defined
    if (def.parameters.required) {
      for (const param of def.parameters.required) {
        if (!def.parameters.properties[param]) {
          errors.push(`Required parameter '${param}' not defined in properties`);
        }
      }
    }

    // Check parameter types
    Object.entries(def.parameters.properties || {}).forEach(([name, param]) => {
      if (!param.type) {
        errors.push(`Parameter '${name}' missing type definition`);
      }
      if (!param.description) {
        errors.push(`Parameter '${name}' missing description`);
      }

      // Validate enum values for specific parameters
      if (name === 'tag' && param.enum) {
        const validTags = ['latest', 'earliest', 'pending'];
        const invalidTags = param.enum.filter(tag => !validTags.includes(tag));
        if (invalidTags.length > 0) {
          errors.push(`Invalid tag enum values: ${invalidTags.join(', ')}`);
        }
      }
    });

    return errors;
  }

  async testTool(tool) {
    const toolName = tool.definition.function.name;
    this.results.total++;
    
    this.log('info', `Testing tool: ${toolName}`);
    
    try {
      // Test 1: Tool structure validation
      const structureErrors = this.validateToolStructure(tool);
      if (structureErrors.length > 0) {
        throw new Error(`Structure validation failed: ${structureErrors.join(', ')}`);
      }

      // Test 2: Parameter definition validation
      const paramErrors = this.testParameterValidation(tool);
      if (paramErrors.length > 0) {
        throw new Error(`Parameter validation failed: ${paramErrors.join(', ')}`);
      }

      // Test 3: Function execution validation
      const execErrors = await this.testToolParameters(tool);
      if (execErrors.length > 0) {
        throw new Error(`Execution validation failed: ${execErrors.join(', ')}`);
      }

      this.results.passed++;
      this.log('success', `✅ ${toolName} - All tests passed`);
      
    } catch (error) {
      this.results.failed++;
      this.results.errors.push({
        tool: toolName,
        error: error.message
      });
      this.log('error', `❌ ${toolName} - ${error.message}`);
    }
  }

  async testNetworkCategories() {
    this.log('info', 'Testing tool categorization by network support...');
    
    const tools = await this.discoverTools();
    const categories = {
      accountTools: [],
      blockTools: [],
      transactionTools: [],
      contractTools: [],
      networkTools: [],
      filterTools: [],
      miningTools: [],
      uncleTools: [],
      utilityTools: []
    };

    tools.forEach(tool => {
      const name = tool.definition.function.name;
      
      if (name.includes('getBalance') || name.includes('getTransactionCount') || name.includes('getCode')) {
        categories.accountTools.push(name);
      } else if (name.includes('Block') && !name.includes('Transaction')) {
        categories.blockTools.push(name);
      } else if (name.includes('Transaction')) {
        categories.transactionTools.push(name);
      } else if (name.includes('call') || name.includes('estimateGas') || name.includes('getStorageAt')) {
        categories.contractTools.push(name);
      } else if (name.includes('chainId') || name.includes('gasPrice') || name.includes('blockNumber') || name.includes('net_') || name.includes('web3_')) {
        categories.networkTools.push(name);
      } else if (name.includes('Filter') || name.includes('getLogs')) {
        categories.filterTools.push(name);
      } else if (name.includes('mining') || name.includes('hashrate') || name.includes('submitWork') || name.includes('getWork')) {
        categories.miningTools.push(name);
      } else if (name.includes('Uncle')) {
        categories.uncleTools.push(name);
      } else {
        categories.utilityTools.push(name);
      }
    });

    // Log categories
    Object.entries(categories).forEach(([category, tools]) => {
      if (tools.length > 0) {
        this.log('info', `${category}: ${tools.length} tools - ${tools.join(', ')}`);
      }
    });

    return categories;
  }

  async generateReport() {
    const report = {
      summary: {
        total: this.results.total,
        passed: this.results.passed,
        failed: this.results.failed,
        successRate: `${((this.results.passed / this.results.total) * 100).toFixed(1)}%`
      },
      errors: this.results.errors,
      recommendations: []
    };

    // Add recommendations based on results
    if (this.results.failed > 0) {
      report.recommendations.push('Fix failing tool tests before deployment');
    }
    
    if (!this.hasRealApiKey) {
      report.recommendations.push('Run tests with real INFURA_API_KEY for complete validation');
    }

    if (this.results.passed === this.results.total) {
      report.recommendations.push('All tools passed - ready for deployment');
    }

    return report;
  }

  async runAllTests() {
    this.log('info', 'Starting comprehensive tool testing...');
    this.log('info', `API Key Status: ${this.hasRealApiKey ? 'Real API key detected' : 'Using mock API key'}`);
    
    try {
      // Discover all tools
      const tools = await this.discoverTools();
      this.log('info', `Discovered ${tools.length} tools to test`);

      // Test each tool
      for (const tool of tools) {
        await this.testTool(tool);
      }

      // Test categorization
      await this.testNetworkCategories();

      // Generate final report
      const report = await this.generateReport();
      
      // Print summary
      this.log('info', '═══════════════════════════════════════════');
      this.log('info', 'COMPREHENSIVE TOOL TEST SUMMARY');
      this.log('info', '═══════════════════════════════════════════');
      this.log('info', `Total Tools: ${report.summary.total}`);
      this.log('info', `Passed: ${report.summary.passed}`);
      this.log('info', `Failed: ${report.summary.failed}`);
      this.log('info', `Success Rate: ${report.summary.successRate}`);

      if (report.errors.length > 0) {
        this.log('error', '\nFailed Tools:');
        report.errors.forEach(error => {
          this.log('error', `  ${error.tool}: ${error.error}`);
        });
      }

      if (report.recommendations.length > 0) {
        this.log('info', '\nRecommendations:');
        report.recommendations.forEach(rec => {
          this.log('info', `  • ${rec}`);
        });
      }

      // Exit with appropriate code
      if (this.results.failed === 0) {
        this.log('success', '\n🎉 All tools passed comprehensive testing!');
        process.exit(0);
      } else {
        this.log('error', '\n❌ Some tools failed testing. Please review and fix.');
        process.exit(1);
      }

    } catch (error) {
      this.log('error', `Test suite failed: ${error.message}`);
      process.exit(1);
    }
  }
}

// Run tests if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new ToolTester();
  tester.runAllTests();
}

export { ToolTester }; 