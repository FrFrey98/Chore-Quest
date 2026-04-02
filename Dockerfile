FROM node:20-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# Compile seed.ts to seed.js for production use (no tsx needed at runtime)
RUN node -e "\
  const { execSync } = require('child_process');\
  execSync('npx esbuild prisma/seed.ts --bundle --platform=node --outfile=prisma/seed.js --external:better-sqlite3 --external:bcryptjs --external:@prisma/client --external:@prisma/adapter-better-sqlite3 --external:dotenv', { stdio: 'inherit' });\
"

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
# Copy generated Prisma client (output is in src/generated/prisma, not node_modules/.prisma)
COPY --from=builder /app/src/generated ./src/generated

# Copy all node_modules from builder (Prisma CLI has many transitive deps)
COPY --from=builder /app/node_modules ./node_modules

# Copy compiled seed script
COPY --from=builder /app/prisma/seed.js ./prisma/seed.js

# Copy entrypoint script
COPY --chown=nextjs:nodejs scripts/docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x docker-entrypoint.sh

RUN mkdir -p /app/data && chown nextjs:nodejs /app/data

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

ENTRYPOINT ["./docker-entrypoint.sh"]
