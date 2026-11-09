FROM node:22-alpine

WORKDIR /app

# Copy root package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application source code
COPY . .

# Build Vite frontend production bundle
RUN npm run build

# Default environment
ENV NODE_ENV=production
ENV PORT=10000
ENV NODE_OPTIONS="--experimental-sqlite"

EXPOSE 10000

# Start unified server
CMD ["node", "--experimental-sqlite", "backend/server.js"]
