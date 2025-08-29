# --- Stage 1: Build ---
FROM node:20 AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# --- Stage 2: Production runtime ---
FROM node:20-alpine AS runner

WORKDIR /app

# Debug: Check Node.js and npm versions
RUN node --version && npm --version

COPY package*.json ./

# Debug: Verify package.json exists
RUN ls -la && cat package.json

RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/main.js"]