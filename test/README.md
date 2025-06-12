# Test Suite Documentation

This directory contains comprehensive tests for the Infura MCP Server, covering all 40+ tools with multiple testing approaches.

## 🧪 Test Structure

### Core Test Files

| File | Purpose | Coverage |
|------|---------|----------|
| `validate.js` | Package validation | Structure, metadata |
| `tools.js` | Basic tool discovery | Tool loading, definitions |
| `comprehensive-tools.js` | **Complete tool validation** | All 40 tools structure & parameters |
| `integration.js` | **Real API functionality** | Network calls, error handling |
| `test-sse.js` | **SSE server testing** | WebSocket connections |

### Test Categories

```
📊 Test Coverage Overview
├── 🔍 Structure Tests (100% - 40/40 tools)
├── 📋 Parameter Validation (100% - 40/40 tools)
├── 🛠️ Function Execution (100% - 40/40 tools)
├── 🌐 Network Integration (depends on API key)
├── 🔌 SSE Connectivity (depends on server)
└── ❌ Error Handling (100% coverage)
```

## 🚀 Running Tests

### Basic Test Commands

```bash
# Quick validation (package + tool discovery)
npm test

# Comprehensive tool testing (all 40 tools)
npm run test:comprehensive

# Integration tests (requires INFURA_API_KEY)
npm run test:integration

# SSE server tests (requires running server)
npm run test:sse

# All tests together
npm run test:all

# Full test suite (includes integration)
npm run test:full
```

### Test Requirements

| Test Type | Requirements | Skips Gracefully |
|-----------|-------------|-------------------|
| **Basic** | None | ✅ Always runs |
| **Comprehensive** | None | ✅ Always runs |
| **Integration** | `INFURA_API_KEY` | ✅ Skips if no API key |
| **SSE** | Running server | ✅ Skips if server down |

## 📋 Tool Categories Tested

### Account & Balance Tools (3 tools)
- `eth_getBalance` - Get account balance
- `eth_getCode` - Get contract bytecode  
- `eth_getTransactionCount` - Get nonce/transaction count

### Block Tools (8 tools)
- `eth_getBlockNumber` - Get latest block number
- `eth_getBlockByHash` - Get block by hash
- `eth_getBlockByNumber` - Get block by number
- `eth_getUncleByBlockHashAndIndex` - Get uncle block
- `eth_getUncleByBlockNumberAndIndex` - Get uncle block
- `eth_getUncleCountByBlockHash` - Count uncle blocks
- `eth_getUncleCountByBlockNumber` - Count uncle blocks
- `eth_newBlockFilter` - Create block filter

### Transaction Tools (7 tools)
- `eth_getBlockTransactionCountByHash` - Count transactions in block
- `eth_getBlockTransactionCountByNumber` - Count transactions in block
- `eth_getTransactionByBlockHashAndIndex` - Get transaction by index
- `eth_getTransactionByBlockNumberAndIndex` - Get transaction by index
- `eth_getTransactionByHash` - Get transaction details
- `eth_getTransactionReceipt` - Get transaction receipt
- `eth_sendRawTransaction` - Send signed transaction

### Smart Contract Tools (3 tools)
- `eth_call` - Execute read-only contract call
- `eth_estimateGas` - Estimate gas for transaction
- `eth_getStorageAt` - Read contract storage

### Network Tools (5 tools)
- `eth_chainId` - Get chain ID
- `net_isListening` - Check if node is listening
- `net_getPeerCount` - Get peer count
- `net_getVersion` - Get network version
- `web3_getClientVersion` - Get client version

### Filter Tools (5 tools)
- `eth_getFilterChanges` - Get filter changes
- `eth_getFilterLogs` - Get filter logs
- `eth_getLogs` - Get event logs with filters
- `eth_newFilter` - Create event filter
- `eth_uninstallFilter` - Remove filter

### Mining Tools (2 tools)
- `eth_getWork` - Get work for mining
- `eth_submitWork` - Submit mining work

### Utility Tools (7 tools)
- `eth_getFeeHistory` - Get fee history
- `eth_getGasPrice` - Get current gas price
- `eth_getHashrate` - Get network hashrate
- `eth_isMining` - Check if mining
- `eth_getProtocolVersion` - Get protocol version
- `eth_isSyncing` - Check sync status
- `parity_getNextNonce` - Get next nonce (Parity)

## 🔍 Test Validation Levels

### Level 1: Structure Validation
- ✅ Tool definition exists
- ✅ Function is callable
- ✅ Parameters schema is valid
- ✅ Required fields present
- ✅ Network parameter handling

### Level 2: Parameter Validation
- ✅ Required parameters defined
- ✅ Parameter types specified
- ✅ Enum values validated
- ✅ Default values present
- ✅ Description fields complete

### Level 3: Function Execution
- ✅ Functions execute without parameter errors
- ✅ Error handling for invalid inputs
- ✅ Network-specific behavior
- ✅ Mock API key handling

### Level 4: Integration Testing (with API key)
- ✅ Real network calls succeed
- ✅ Expected response formats
- ✅ Chain ID validation
- ✅ Error handling for invalid requests
- ✅ Contract interaction testing

## 🌐 Network Testing

### Supported Networks
- **mainnet** - Ethereum mainnet
- **sepolia** - Ethereum testnet
- **polygon-mainnet** - Polygon mainnet
- **arbitrum-mainnet** - Arbitrum mainnet
- **base-mainnet** - Base mainnet
- **optimism-mainnet** - Optimism mainnet

### Network-Specific Tests
- Chain ID validation
- Gas price retrieval
- Block number fetching
- Balance checking
- Transaction count verification

## 🛠️ Error Handling Tests

### Invalid Input Tests
- ❌ Invalid Ethereum addresses
- ❌ Invalid network names
- ❌ Missing required parameters
- ❌ Invalid parameter types
- ❌ Malformed data

### Network Error Tests
- ❌ Invalid API keys
- ❌ Network connectivity issues
- ❌ Rate limiting responses
- ❌ Invalid endpoints

## 📊 Test Results Format

### Success Output
```
✅ [timestamp] ✅ eth_getBalance - All tests passed
```

### Detailed Summary
```
═══════════════════════════════════════════
COMPREHENSIVE TOOL TEST SUMMARY
═══════════════════════════════════════════
Total Tools: 40
Passed: 40
Failed: 0
Success Rate: 100.0%

Recommendations:
  • Run tests with real INFURA_API_KEY for complete validation
  • All tools passed - ready for deployment
```

## 🚀 CI/CD Integration

### GitHub Actions Integration
The test suite is integrated into GitHub Actions workflows:

```yaml
- name: Run comprehensive tests
  run: npm run test:all

- name: Run integration tests (if API key available)
  run: npm run test:integration
  continue-on-error: true

- name: Check tool coverage
  run: npm run test:comprehensive
```

### Development Workflow
1. **Pre-commit**: Run `npm test` for quick validation
2. **Pre-push**: Run `npm run test:all` for comprehensive testing
3. **Release**: Run `npm run test:full` with real API key

## 🔧 Troubleshooting

### Common Issues

**Test Failures:**
- Check tool definitions in `/tools/` directory
- Verify parameter schemas are complete
- Ensure network parameter has default value

**Integration Test Skips:**
- Set `INFURA_API_KEY` environment variable
- Verify API key is valid and active
- Check network connectivity

**SSE Test Failures:**
- Start SSE server: `npm run start:sse`
- Check port 3001 is available
- Verify server configuration

### Debug Mode
```bash
# Enable debug logging
DEBUG=true npm run test:comprehensive

# Verbose integration testing
INFURA_API_KEY=your_key DEBUG=true npm run test:integration
```

## 📈 Coverage Metrics

| Test Type | Tools Covered | Success Rate | CI Integration |
|-----------|---------------|--------------|----------------|
| **Structure** | 40/40 (100%) | ✅ 100% | ✅ Required |
| **Parameters** | 40/40 (100%) | ✅ 100% | ✅ Required |
| **Execution** | 40/40 (100%) | ✅ 100% | ✅ Required |
| **Integration** | 40/40 (100%) | ⚠️ API dependent | ⚠️ Optional |
| **SSE** | Server testing | ✅ 100% | ⚠️ Optional |

## 🎯 Quality Gates

### Required for Deployment
- ✅ All 40 tools pass structure validation
- ✅ All parameters properly defined
- ✅ No execution errors with mock data
- ✅ Error handling works correctly

### Optional but Recommended
- ✅ Integration tests pass with real API
- ✅ SSE functionality verified
- ✅ Performance benchmarks met
- ✅ Security scans clean

---

**Ready for Official Deployment:** All core tests passing ensures the server is ready for production use as the official Infura MCP server. 