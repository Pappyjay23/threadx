FROM node:22-slim AS builder
WORKDIR /app
COPY package*.json tsconfig*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:22-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/package*.json ./
RUN npm install --omit=dev
COPY --from=builder /app/dist ./dist
EXPOSE 5001
CMD ["node", "dist/server.js"]