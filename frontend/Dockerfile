# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN npm install -g pnpm && \
    pnpm install --frozen-lockfile

COPY public ./public
COPY src ./src
COPY index.html vite.config.js postcss.config.js tailwind.config.js ./

RUN pnpm run build

# Runtime stage
FROM node:20-alpine

WORKDIR /app

ENV PATH="/app/node_modules/.bin:$PATH"

COPY package.json pnpm-lock.yaml ./

RUN npm install -g pnpm && \
    pnpm install --frozen-lockfile --prod && \
    pnpm add --global serve

COPY --from=builder /app/dist ./dist

EXPOSE 5173

CMD ["serve", "-s", "dist", "-l", "5173"]
