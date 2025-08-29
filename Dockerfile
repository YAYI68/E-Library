# --- Stage 1: Build ---
FROM node:20 AS builder

WORKDIR /app

# Copy package files first (for better caching)
COPY package*.json ./

# Install all dependencies (dev + prod for build)
RUN npm install

# Copy source code
COPY . .

# Build the NestJS project
RUN npm run build


# --- Stage 2: Production runtime ---
FROM node:20-alpine AS runner

WORKDIR /app

# Copy only package files for prod deps
COPY package*.json ./

# Install only production dependencies
RUN npm install --omit=dev

# Copy built app from builder stage
COPY --from=builder /app/dist ./dist

# (Optional) If you need assets/public files, copy them too
# COPY --from=builder /app/public ./public

# Expose app port (documentation, infra may still map it differently)
EXPOSE 3000

# Run the app
CMD ["node", "dist/main.js"]
