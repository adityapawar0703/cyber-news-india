# Stage 1: Build the React + Vite frontend
FROM node:22-alpine AS builder
WORKDIR /app

# Install client dependencies
COPY client/package.json client/package-lock.json* ./client/
RUN cd client && npm install

# Build client bundle
COPY client/ ./client/
RUN cd client && npm run build

# Stage 2: Production Node server
FROM node:22-alpine AS runner
WORKDIR /app/server
ENV NODE_ENV=production

# Install server production dependencies only
COPY server/package.json server/package-lock.json* ./
RUN npm install --omit=dev

# Copy server application source code and seed assets
COPY server/ ./

# Copy built frontend assets from builder stage
COPY --from=builder /app/client/dist /app/client/dist

# Expose server port
EXPOSE 5000

# Start server
CMD ["node", "server.js"]
