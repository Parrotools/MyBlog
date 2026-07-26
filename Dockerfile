# ---- deps + build --------------------------------------------------------
FROM node:22-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci

COPY . .
# DATABASE_URL is needed at build only for `prisma generate` (already run by
# npm ci postinstall in most setups; run explicitly to be safe)
RUN npx prisma generate
ENV BUILD_STANDALONE=1
RUN npm run build

# ---- runtime -------------------------------------------------------------
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# non-root user
RUN addgroup -S app && adduser -S app -G app

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.bin/prisma ./node_modules/.bin/prisma
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# uploads volume mount point
RUN mkdir -p /data/uploads && chown -R app:app /data /app
ENV UPLOADS_DIR=/data/uploads

USER app
EXPOSE 3000

# apply migrations, then start
CMD ["sh", "-c", "node_modules/.bin/prisma migrate deploy && node server.js"]
