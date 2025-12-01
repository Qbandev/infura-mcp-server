# Build stage
FROM node:25.2-alpine AS builder

WORKDIR /app

# Copy package files first for better layer caching
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Production stage
FROM node:25.2-alpine AS production

# Add metadata
LABEL org.opencontainers.image.title="Infura MCP Server"
LABEL org.opencontainers.image.description="MCP server for Infura API with 40+ Ethereum JSON-RPC tools"
LABEL org.opencontainers.image.vendor="qbandev"
LABEL org.opencontainers.image.licenses="MIT"
LABEL org.opencontainers.image.source="https://github.com/qbandev/infura-mcp-server"

# Create app user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S mcpserver -u 1001

WORKDIR /app

# Copy node_modules from builder stage
COPY --from=builder /app/node_modules ./node_modules

# Copy application files
COPY --chown=mcpserver:nodejs package.json package-lock.json ./
COPY --chown=mcpserver:nodejs lib/ ./lib/
COPY --chown=mcpserver:nodejs tools/ ./tools/
COPY --chown=mcpserver:nodejs commands/ ./commands/
COPY --chown=mcpserver:nodejs mcpServer.js index.js ./

# Switch to non-root user
USER mcpserver

# Expose ports (only needed for SSE mode)
EXPOSE 3001

# Health check (only works in SSE mode, disabled by default for stdio mode)
# Uncomment for SSE deployments:
# HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
#   CMD node -e "const http = require('http'); \
#     const options = { hostname: 'localhost', port: 3001, path: '/health', timeout: 5000 }; \
#     const req = http.request(options, (res) => process.exit(res.statusCode === 200 ? 0 : 1)); \
#     req.on('error', () => process.exit(1)); req.end();" || exit 1

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3001

# Start the server in stdio mode by default (standard MCP approach)
CMD ["node", "mcpServer.js"]