# Production-ready Dockerfile for Next.js
FROM node:22-slim AS base
WORKDIR /app

# Install dependencies (use legacy-peer-deps to match local install behaviour)
COPY package.json package-lock.json* pnpm-lock.yaml* ./
RUN npm ci --legacy-peer-deps --silent || npm install --legacy-peer-deps --silent

# Copy source and build
COPY . .
RUN npm run build

# Runtime image
FROM node:22-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy built app and node_modules
COPY --from=base /app/.next ./.next
COPY --from=base /app/public ./public
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/package.json ./package.json

EXPOSE 3000
CMD ["npm","start"]
