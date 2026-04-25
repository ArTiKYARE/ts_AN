# ==========================================
# Dockerfile для Frontend (Next.js)
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_API_URL

ENV NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

# Установка зависимостей для сборки
RUN apk add --no-cache python3 make g++

# Копирование всех package.json файлов
COPY package*.json ./
COPY apps/web/package*.json ./apps/web/
COPY apps/api/package*.json ./apps/api/
COPY apps/admin/package*.json ./apps/admin/
COPY packages/database/package*.json ./packages/database/

# Генерация package-lock.json если его нет
RUN if [ ! -f package-lock.json ]; then npm install --package-lock-only; fi

# Установка всех зависимостей
RUN npm install

# Копирование исходного кода
COPY . .

# Генерация Prisma клиента (если требуется для типов)
RUN npx prisma generate --schema=./packages/database/prisma/schema.prisma || true

# Сборка Next.js приложения
RUN npm run build --workspace=apps/web

# ------------------------------------------
# Production образ
# ------------------------------------------
FROM node:20-alpine AS production

WORKDIR /app

ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_API_URL

ENV NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NODE_ENV=production

# Установка runtime зависимостей
COPY --from=builder /app/apps/web/.next ./apps/web/.next
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/apps/web/package*.json ./apps/web/
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/web/node_modules ./apps/web/node_modules

EXPOSE 3000

WORKDIR /app/apps/web

CMD ["npm", "run", "start"]
