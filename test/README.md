# Infura MCP Server - Testing Framework

## 🧪 Overview

This testing framework validates **all 29 read-only Ethereum JSON-RPC tools** with comprehensive testing across multiple levels:

1. **Structure Validation** - Tool definitions, parameters, schemas
2. **Parameter Validation** - Required fields, types, enum values  
3. **API Functionality** - Real Infura API calls (when API key available)
4. **Integration Testing** - End-to-end functionality validation
5. **SSE Transport** - Server-Sent Events functionality

## 🔑 API Key Setup

### Local Development (.env file)

Create a `.env` file in the project root:

```bash
INFURA_API_KEY="your_real_infura_api_key_here"
```

### GitHub Actions (Repository Secrets)

Set up repository secrets for CI/CD testing:

1. Go to your GitHub repository
2. Navigate to **Settings** > **Secrets and variables** > **Actions**
3. Click **New repository secret**
4. Name: `INFURA_API_KEY`
5. Value: Your real Infura API key
6. Click **Add secret**

## 🚀 Test Commands

### Basic Testing (No API Key Required)
```bash
# Structure validation only
npm test                    # Basic validation + tool discovery
npm run test:comprehensive  # All 29 tools structure validation
npm run test:sse           # SSE transport testing
```

### Full API Testing (Requires API Key)
```bash
# Real API validation - all 29 tools
INFURA_API_KEY=your_key npm run test:comprehensive

# Integration testing - selected API calls
INFURA_API_KEY=your_key npm run test:integration

# Complete API testing suite
INFURA_API_KEY=your_key npm run test:api

# Everything - structure + API + SSE
INFURA_API_KEY=your_key npm run test:full
```

### Debug Mode
```bash
# Enable detailed logging
INFURA_API_KEY=your_key DEBUG=true npm run test:comprehensive
```

## 📊 Test Types

| Test Type | Command | API Key | Description |
|-----------|---------|---------|-------------|
| **Structure** | `npm test` | ❌ Not required | Package validation, tool discovery |
| **Comprehensive** | `test:comprehensive` | ✅ Enhanced with API key | All 29 tools validation |
| **Integration** | `test:integration` | ✅ Required | Real API functionality |
| **SSE** | `test:sse` | ❌ Not required | Transport layer testing |
| **API Suite** | `test:api` | ✅ Required | Comprehensive + Integration |
| **Full Suite** | `test:full` | ✅ Enhanced with API key | Everything |

## 🔧 Comprehensive Testing (29 tools)

When a valid `INFURA_API_KEY` is provided, the comprehensive test validates **all 29 tools** with real API calls:

### Tool Categories Tested:
- **Account Tools** (3): `eth_getBalance`, `eth_getTransactionCount`, `eth_getCode`
- **Block Tools** (8): `eth_getBlockByNumber`, `eth_getBlockByHash`, etc.
- **Transaction Tools** (7): `eth_getTransactionByHash`, `eth_getTransactionReceipt`, etc.
- **Smart Contract Tools** (3): `eth_call`, `eth_estimateGas`, `eth_getStorageAt`
- **Network Tools** (5): `eth_chainId`, `eth_gasPrice`, `net_version`, etc.
- **Log Query Tools** (1): `eth_getLogs` for event filtering
- **Utility Tools** (4): `eth_getFeeHistory`, `eth_isSyncing`, etc.

### API Call Examples:
```bash
🔑 Testing eth_getBalance with real API call...
✅ eth_getBalance API call successful: 0x1b1ae4d6e2ef500000...

🔑 Testing eth_call with real API call...  
✅ eth_call API call successful: 0x0000000000000000000000000000000000000000000000000000000...

🔑 Testing eth_chainId with real API call...
✅ eth_chainId API call successful: 0x1
```

## 🏗️ CI/CD Integration

All workflows automatically use GitHub secrets when available:

### GitHub Actions Workflows:
- **CI (`ci.yml`)**: Tests PRs and main branch
- **Release (`release.yml`)**: Pre-release validation
- **NPM Publish (`npm-publish.yml`)**: Pre-publish validation

### Workflow Behavior:
```bash
# With INFURA_API_KEY secret configured:
🔑 Using real API key for comprehensive testing...
🔗 Running integration tests with real API...
✅ All tests including real API validation passed!

# Without INFURA_API_KEY secret:
⚠️ No API key available, running structure validation only...
ℹ️ Skipping integration tests (no API key)
```

## 🛡️ Security Features

- ✅ **Zero hardcoded keys** - All API keys from environment
- ✅ **Graceful fallbacks** - Works without API key
- ✅ **GitHub secrets** - Secure CI/CD testing
- ✅ **Local .env support** - Developer-friendly
- ✅ **Error handling** - Validates API responses

## 📈 Test Results

### Without API Key (Structure Only):
```
COMPREHENSIVE TOOL TEST SUMMARY
Total Tools: 29
Passed: 29  
Failed: 0
Success Rate: 100.0%
• Run tests with real INFURA_API_KEY for complete validation
```

### With API Key (Full Validation):
```
COMPREHENSIVE TOOL TEST SUMMARY
Total Tools: 29
Passed: 29
Failed: 0  
Success Rate: 100.0%
• All tools passed - ready for deployment
• Real API validation completed for all 29 tools
```

## 🎯 Usage Examples

### Local Development:
```bash
# Create .env file
echo "INFURA_API_KEY=your_key_here" > .env

# Test all 29 tools with real API
npm run test:comprehensive

# Output shows real API calls:
🔑 Testing eth_getBalance with real API call...
✅ eth_getBalance API call successful: 0x1b1ae4d6e2ef500000...
```

### GitHub Actions:
```yaml
# .github/workflows/ci.yml (already configured)
env:
  INFURA_API_KEY: ${{ secrets.INFURA_API_KEY }}
run: |
  if [ -n "$INFURA_API_KEY" ]; then
    echo "🔑 Using real API key for comprehensive testing..."
    npm run test:comprehensive
  fi
```

### Manual Verification:
```bash
# Test specific networks
INFURA_API_KEY=your_key INFURA_NETWORK=polygon-mainnet npm run test:integration
INFURA_API_KEY=your_key INFURA_NETWORK=arbitrum-mainnet npm run test:integration
```

## 🚨 Requirements

- **Node.js** 16+
- **Valid Infura API Key** (for API testing)
- **Network connectivity** (for API calls)

## 🐛 Troubleshooting

### Test Failures:
```bash
# Check API key validity
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}' \
  https://mainnet.infura.io/v3/YOUR_API_KEY

# Expected response:
{"jsonrpc":"2.0","id":1,"result":"0x1"}
```

### Common Issues:
- **401/403 errors**: Invalid or missing API key
- **Rate limiting**: Too many requests (use delays)
- **Network errors**: Check internet connectivity
- **Tool failures**: Review specific error messages

---

**Ready to validate all 29 tools with real Infura API calls!** 🎉 