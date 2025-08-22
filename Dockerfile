# Use official Node.js LTS image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy source code
COPY . .

# Expose port (if your app listens on a port, e.g. 3000)
EXPOSE 3000

# Default command (adjust if your entry point is different)
CMD ["node", "src/index.js"]
