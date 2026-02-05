# Security Documentation

This document describes the security architecture, controls, and best practices for the Infura MCP Server.

## Table of Contents

1. [Security Architecture](#security-architecture)
2. [Input Validation](#input-validation)
3. [HTTP Security](#http-security-when-using---http-mode)
4. [API Key Security](#api-key-security)
5. [Error Handling](#error-handling)
6. [Best Practices for Deployment](#best-practices-for-deployment)
7. [Reporting Security Issues](#reporting-security-issues)

---

## Security Architecture

### Overview

The Infura MCP Server is designed with security as a foundational principle. It provides a bridge between AI assistants and Ethereum blockchain networks through Infura's infrastructure, implementing multiple layers of protection to ensure safe operation.

### Design Principles

- **Least Privilege**: The server operates with minimal permissions, only performing read operations on blockchain data
- **Defense in Depth**: Multiple security layers protect against various attack vectors
- **Fail-Safe Defaults**: Secure defaults are applied unless explicitly overridden
- **Input Sanitization**: All user inputs are validated before processing
- **No Secrets in Logs**: API keys and sensitive data are never logged or exposed in error messages

### Defense-in-Depth Approach

The server implements security controls at multiple layers:

```
Layer 1: Network Security
   - HTTPS/TLS encryption for all Infura API calls
   - CORS restrictions for HTTP mode
   - DNS rebinding protection
   - Rate limiting

Layer 2: Input Validation
   - Strict format validation for addresses, hashes, and parameters
   - Network allowlist enforcement
   - Request size limits

Layer 3: Application Security
   - Read-only operation guarantee
   - No arbitrary code execution
   - Predefined JSON-RPC methods only
   - Session management and timeout

Layer 4: Error Handling
   - No internal error leakage
   - Actionable error messages
   - Structured error classification
```

### Read-Only Operation Guarantee

All 29 tools in this server are strictly read-only. The server:

- **Cannot modify blockchain state**: No transaction signing, sending, or state mutations
- **Cannot execute arbitrary code**: Only predefined JSON-RPC query methods are supported
- **Implements readOnlyHint annotations**: Each tool definition includes `readOnlyHint: true` and `destructiveHint: false`

The supported JSON-RPC methods are exclusively query operations:

| Category | Methods |
|----------|---------|
| Account | `eth_getBalance`, `eth_getCode`, `eth_getStorageAt`, `eth_getTransactionCount` |
| Block | `eth_blockNumber`, `eth_getBlockByHash`, `eth_getBlockByNumber`, `eth_getBlockTransactionCountByHash`, `eth_getBlockTransactionCountByNumber`, `eth_getUncleByBlockHashAndIndex`, `eth_getUncleByBlockNumberAndIndex`, `eth_getUncleCountByBlockHash`, `eth_getUncleCountByBlockNumber` |
| Transaction | `eth_getTransactionByHash`, `eth_getTransactionByBlockHashAndIndex`, `eth_getTransactionByBlockNumberAndIndex`, `eth_getTransactionReceipt`, `eth_getLogs` |
| Smart Contract | `eth_call`, `eth_estimateGas` |
| Network | `eth_chainId`, `eth_gasPrice`, `eth_feeHistory`, `eth_protocolVersion`, `eth_syncing`, `net_version`, `net_listening`, `net_peerCount`, `web3_clientVersion` |

---

## Input Validation

All user inputs are validated before being processed or sent to the Infura API. This prevents injection attacks and ensures data integrity.

### Address Validation

Ethereum addresses must conform to the standard format:

- **Format**: `0x` prefix followed by exactly 40 hexadecimal characters
- **Regex**: `^0x[a-fA-F0-9]{40}$`
- **Example**: `0x742d35Cc6634C0532925a3b844Bc454e4438f44e`

```javascript
// Valid addresses
"0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"  // Vitalik's address
"0x0000000000000000000000000000000000000000"  // Zero address

// Invalid addresses (rejected)
"0x742d35Cc6634C0532925a3b844Bc454e4438f44"   // Too short (39 chars)
"0x742d35Cc6634C0532925a3b844Bc454e4438f44eg" // Invalid character 'g'
"742d35Cc6634C0532925a3b844Bc454e4438f44e"    // Missing 0x prefix
```

### Hash Validation

Transaction and block hashes must be 32-byte hex strings:

- **Format**: `0x` prefix followed by exactly 64 hexadecimal characters
- **Regex**: `^0x[a-fA-F0-9]{64}$`
- **Example**: `0x88df016429689c079f3b2f6ad39fa052532c56795b733da78a91ebe6a713944b`

```javascript
// Valid hashes
"0x88df016429689c079f3b2f6ad39fa052532c56795b733da78a91ebe6a713944b"

// Invalid hashes (rejected)
"0x88df016429689c079f3b2f6ad39fa052532c56795b733da78a91ebe6a71394"   // Too short
"88df016429689c079f3b2f6ad39fa052532c56795b733da78a91ebe6a713944b"   // Missing 0x
```

### Block Tag Validation

Block references accept specific named tags or hex block numbers:

- **Named Tags**: `latest`, `earliest`, `pending`, `safe`, `finalized`
- **Hex Block Numbers**: `0x` prefix followed by hexadecimal digits
- **Regex for hex**: `^0x[a-fA-F0-9]+$`

```javascript
// Valid block tags
"latest"      // Most recent mined block
"earliest"    // Genesis block
"pending"     // Pending state/transactions
"safe"        // Latest safe head block
"finalized"   // Latest finalized block
"0x1"         // Block #1
"0x10C5E8B"   // Block #17,556,875

// Invalid block tags (rejected)
"newest"      // Not a valid tag
"block123"    // Invalid format
```

### Network Allowlist

Networks are validated against an explicit allowlist of 37 supported networks. This prevents URL injection attacks by ensuring only known network identifiers can be used in API URLs.

**Supported Networks:**

| Category | Networks |
|----------|----------|
| Ethereum | `mainnet`, `sepolia` |
| Arbitrum | `arbitrum-mainnet`, `arbitrum-sepolia` |
| Optimism | `optimism-mainnet`, `optimism-sepolia` |
| Polygon | `polygon-mainnet`, `polygon-amoy` |
| Base | `base-mainnet`, `base-sepolia` |
| Linea | `linea-mainnet`, `linea-sepolia` |
| ZKsync | `zksync-mainnet`, `zksync-sepolia` |
| Scroll | `scroll-mainnet`, `scroll-sepolia` |
| Blast | `blast-mainnet`, `blast-sepolia` |
| Mantle | `mantle-mainnet`, `mantle-sepolia` |
| Avalanche | `avalanche-mainnet`, `avalanche-fuji` |
| BNB Chain | `bsc-mainnet`, `bsc-testnet` |
| Celo | `celo-mainnet`, `celo-alfajores` |
| Palm | `palm-mainnet`, `palm-testnet` |
| Starknet | `starknet-mainnet`, `starknet-sepolia` |
| opBNB | `opbnb-mainnet`, `opbnb-testnet` |
| Swellchain | `swellchain-mainnet`, `swellchain-testnet` |
| Unichain | `unichain-mainnet`, `unichain-sepolia` |

Any network not in this list will be rejected with a clear error message.

### Hex String/Quantity Validation

Additional validators ensure proper formatting of hex data:

- **Hex String**: `^0x[a-fA-F0-9]*$` (allows empty hex data `0x`)
- **Hex Quantity**: `^0x(0|[1-9a-fA-F][a-fA-F0-9]*)$` (no leading zeros except for `0x0`)
- **Index**: `^0x[a-fA-F0-9]+$` (non-empty hex for transaction indices)

---

## HTTP Security (when using --http mode)

When running in HTTP mode (`npm run start:http` or `--http` flag), additional security controls protect the HTTP server.

### CORS Configuration

Cross-Origin Resource Sharing (CORS) is configured via the `CORS_ALLOWED_ORIGINS` environment variable:

```bash
# Default allowed origins (if not configured)
http://localhost:3000
http://localhost:3001
http://127.0.0.1:3000

# Configure custom origins (comma-separated)
CORS_ALLOWED_ORIGINS="https://app.example.com,https://admin.example.com"
```

The server:

- Only reflects `Access-Control-Allow-Origin` for origins in the allowlist
- Sets `Access-Control-Allow-Credentials: true` for credentialed requests
- Adds `Vary: Origin` header for proper caching behavior
- Rejects cross-origin requests from non-allowed origins

### DNS Rebinding Protection

The `ALLOWED_HOSTS` environment variable prevents DNS rebinding attacks:

```bash
# Default allowed hosts (if not configured)
localhost
127.0.0.1

# Configure for production
ALLOWED_HOSTS="api.myservice.com,localhost"
```

Requests with a `Host` header not in the allowlist are rejected with HTTP 403.

### Rate Limiting

The `/mcp` endpoint is protected by rate limiting:

| Setting | Default Value |
|---------|---------------|
| Window | 60 seconds |
| Max Requests | 100 per IP per window |
| Headers | Standard rate limit headers enabled |

```bash
# Rate limit response when exceeded
HTTP 429 Too Many Requests
{ "error": "Too many requests, please try again later" }
```

Rate limiting uses `X-Forwarded-For` header when behind a proxy, falling back to direct IP.

### Session Management

HTTP mode implements session management with security controls:

| Setting | Default | Environment Variable |
|---------|---------|---------------------|
| Session Timeout | 30 minutes | `SESSION_TIMEOUT_MS` |
| Max Sessions | 1000 | `MAX_SESSIONS` |
| Cleanup Interval | 5 minutes | (not configurable) |

- Sessions are automatically cleaned up after timeout
- New sessions are rejected when max sessions limit is reached (HTTP 503)
- Session activity timestamps are updated on each request

### Security Headers

All HTTP responses include protective headers:

| Header | Value | Purpose |
|--------|-------|---------|
| `X-Content-Type-Options` | `nosniff` | Prevents MIME type sniffing |
| `X-Frame-Options` | `DENY` | Prevents clickjacking |
| `Content-Security-Policy` | `default-src 'none'; frame-ancestors 'none'` | Restricts resource loading |
| `Referrer-Policy` | `no-referrer` | Prevents referrer leakage |
| `Permissions-Policy` | `geolocation=(), microphone=(), camera=()` | Disables unnecessary browser features |
| `Cache-Control` | `no-store` | Prevents caching of sensitive API responses |

Additionally:

- `X-Powered-By` header is disabled to prevent server fingerprinting
- `Vary: Origin` is set for proper CORS caching

### Request Body Size Limit

Request bodies are limited to prevent denial-of-service attacks:

```javascript
// Maximum request body size
100KB (102,400 bytes)
```

Requests exceeding this limit receive an HTTP 413 (Payload Too Large) response.

---

## API Key Security

### Environment Variable Storage

The Infura API key must be provided via environment variable:

```bash
# Required environment variable
INFURA_API_KEY=your_api_key_here
```

The server will fail to start if this variable is not set.

### Protection Measures

**Never Logged or Exposed:**

- API keys are never written to logs
- Error messages do not include API key values
- API keys are not included in response data

**User-Agent Identification:**

All requests to Infura include a User-Agent header for identification:

```
User-Agent: infura-mcp-server/1.0.6
```

This helps Infura track usage patterns and assists in debugging without exposing your API key.

**Secure Transmission:**

- All Infura API calls use HTTPS (TLS encrypted)
- API keys are only sent over encrypted connections
- URL format: `https://{network}.infura.io/v3/{apiKey}`

---

## Error Handling

### No Internal Error Leakage

The server implements careful error handling to prevent information disclosure:

- Internal stack traces are logged server-side but never sent to clients
- Implementation details are not exposed in error responses
- Generic error categories replace specific internal errors

### Actionable Error Messages

Error messages are designed to help users without revealing sensitive information:

| Error Type | User-Facing Message |
|------------|---------------------|
| Rate Limit (429) | "Rate limit exceeded. Wait 60 seconds before retrying, or upgrade your Infura plan at https://infura.io/pricing" |
| Auth Error (401/403) | "Authentication failed. Verify your INFURA_API_KEY is correct and has access to {network}." |
| Server Error (5xx) | "Infura service temporarily unavailable (HTTP {status}). This is a transient error - retry in a few seconds." |
| Timeout | "Request timed out. The network may be congested - try again or use a simpler query." |
| Validation Error | Specific guidance on the expected format |

### Retry Logic for Transient Failures

The server automatically retries transient failures with exponential backoff:

| Configuration | Value |
|---------------|-------|
| Max Retries | 3 attempts |
| Initial Delay | 1 second |
| Backoff | Exponential (1s, 2s, 4s) |
| Retry-After | Respected if provided |

Transient errors (automatically retried):

- HTTP 429 (Rate Limit)
- HTTP 5xx (Server Errors)
- Network errors (timeout, connection refused)

Non-transient errors (immediate failure):

- HTTP 401/403 (Authentication)
- HTTP 404 (Not Found)
- Validation errors
- JSON-RPC errors

---

## Best Practices for Deployment

### Use Environment Variables for Secrets

Never hardcode API keys:

```bash
# Good: Environment variable
export INFURA_API_KEY="your_key_here"

# Bad: Hardcoded in code or config (NEVER DO THIS)
# const apiKey = "your_key_here";
```

For production deployments, use secrets management:

- Docker secrets
- Kubernetes secrets
- AWS Secrets Manager / Parameter Store
- Azure Key Vault
- HashiCorp Vault

### Configure CORS for Production

Always restrict CORS origins in production:

```bash
# Development (default)
CORS_ALLOWED_ORIGINS="http://localhost:3000,http://localhost:3001"

# Production (restrict to your domains)
CORS_ALLOWED_ORIGINS="https://app.yourcompany.com"
```

### Set Appropriate Rate Limits

Consider your usage patterns and Infura plan limits:

```bash
# Conservative settings for shared infrastructure
# (Modify in code if needed - current default is 100/min)
```

### Set Allowed Hosts for Production

Restrict host headers to prevent DNS rebinding:

```bash
# Production
ALLOWED_HOSTS="api.yourcompany.com"
```

### Monitor for Unusual Activity

Set up monitoring for:

- Unusual request patterns or volumes
- Failed authentication attempts
- Rate limit violations
- Error rate spikes

Use the `/health` endpoint for uptime monitoring:

```bash
curl http://localhost:3001/health
# Returns: { "status": "ok", "activeSessions": N, "uptime": ... }
```

### Keep Dependencies Updated

Regularly update dependencies to patch security vulnerabilities:

```bash
# Check for outdated packages
npm outdated

# Update dependencies
npm update

# Audit for known vulnerabilities
npm audit

# Fix vulnerabilities automatically (when safe)
npm audit fix
```

### Use HTTPS in Production

When deploying the HTTP server, always use HTTPS:

- Deploy behind a reverse proxy (nginx, Caddy, AWS ALB)
- Use TLS certificates from a trusted CA
- Enable HTTP Strict Transport Security (HSTS)

Example nginx configuration:

```nginx
server {
    listen 443 ssl;
    server_name api.yourcompany.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Run with Minimal Privileges

- Run the server as a non-root user
- Use read-only filesystem where possible
- Limit network access to required endpoints only

Docker example:

```dockerfile
FROM node:20-slim
USER node
# ... rest of Dockerfile
```

---

## Reporting Security Issues

### How to Report Vulnerabilities

If you discover a security vulnerability in the Infura MCP Server, please report it responsibly:

1. **Do not** open a public GitHub issue for security vulnerabilities
2. Email your report to the project maintainers via GitHub private vulnerability reporting
3. Or open a private security advisory at: https://github.com/Qbandev/infura-mcp-server/security/advisories/new

### What to Include

Please provide:

- Description of the vulnerability
- Steps to reproduce
- Potential impact assessment
- Suggested fix (if any)
- Your contact information for follow-up

### Expected Response Time

| Stage | Target Time |
|-------|-------------|
| Initial acknowledgment | 48 hours |
| Initial assessment | 5 business days |
| Fix development | Varies by severity |
| Disclosure | Coordinated with reporter |

### Responsible Disclosure Policy

We follow coordinated disclosure practices:

1. **Report**: You report the vulnerability privately
2. **Assess**: We assess the severity and impact
3. **Fix**: We develop and test a fix
4. **Release**: We release the fix with a security advisory
5. **Credit**: We credit you in the security advisory (unless you prefer anonymity)

We kindly ask that you:

- Give us reasonable time to fix the vulnerability before public disclosure
- Do not exploit the vulnerability beyond what's necessary to demonstrate it
- Do not access or modify data belonging to others

### Security Advisories

Security advisories and patches are published at:

https://github.com/Qbandev/infura-mcp-server/security/advisories

### Supply Chain Security

This package implements supply chain security measures:

- **npm Trusted Publishing**: Uses OIDC for secure package publishing
- **Provenance Attestations**: Packages include cryptographic provenance
- **Dependency Auditing**: Regular `npm audit` checks in CI/CD

---

## Additional Resources

- [Infura Security Documentation](https://docs.infura.io/networks/ethereum/how-to/secure-a-project)
- [MetaMask Developer Portal](https://developer.metamask.io/)
- [Ethereum JSON-RPC Specification](https://ethereum.github.io/execution-apis/api-documentation/)
- [OWASP API Security Top 10](https://owasp.org/www-project-api-security/)
