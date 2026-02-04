# OpenWork Gateway - Telegram Bot
FROM oven/bun:alpine

WORKDIR /app

# Install git and ripgrep for runtime needs
# Also create symlink to where opencode expects ripgrep
RUN apk add --no-cache git ripgrep && \
    mkdir -p /root/.local/share/opencode/bin && \
    ln -sf /usr/bin/rg /root/.local/share/opencode/bin/rg

# Copy package files first for better caching
COPY package.json bun.lock* ./
COPY packages/gateway/package.json ./packages/gateway/
COPY packages/openwork/package.json ./packages/openwork/
COPY packages/util/package.json ./packages/util/
COPY packages/plugin/package.json ./packages/plugin/
COPY packages/script/package.json ./packages/script/
COPY packages/sdk/js/package.json ./packages/sdk/js/
COPY patches/ ./patches/

# Install dependencies
RUN bun install

# Copy source code
COPY . .

# Create business directory for agent working directory
RUN mkdir -p /data/business

# Set environment variables
ENV NODE_ENV=production
ENV OPENWORK_WORKING_DIR=/data/business

# Run the gateway
CMD ["bun", "run", "packages/gateway/src/index.ts"]
