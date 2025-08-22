# Build stage: install dependencies
FROM node:22-slim AS build
WORKDIR /app

# Copy package manifests and lockfile first for better caching
COPY package.json package-lock.json ./

# Install production dependencies (use npm ci when lockfile exists)
RUN if [ -f package-lock.json ]; then npm ci --production; else npm install --production; fi

# Copy application source
COPY . .

# Final minimal runtime image
FROM node:22-slim AS runtime
WORKDIR /app

# Copy node_modules and built app from build stage
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app .

# Expose port in case the MCP server needs it
EXPOSE 3000

# Default command: use the CLI entry which starts the MCP server
CMD ["node", "bin/cli.js"]
