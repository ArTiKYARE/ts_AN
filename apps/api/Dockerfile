# ======================================
# Dockerfile для Backend API (NestJS)
# ======================================

FROM node:20-alpine AS builder

WORKDIR /app

# Установка зависимостей для Prisma и сборки
RUN apk add --no-cache openssl

# Копирование package.json корня и workspace пакетов
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
COPY packages/database/package*.json ./packages/database/

# Установка всех зависимостей (включая dev)
RUN npm install

# Копирование исходного кода
COPY . .

# Генерация Prisma Client
RUN npx prisma generate --schema=./packages/database/prisma/schema.prisma

# Сборка приложения
RUN npm run build --workspace=apps/api

# ======================================
# Production образ
# ======================================

FROM node:20-alpine AS production

WORKDIR /app

# Установка runtime зависимостей
RUN apk add --no-cache openssl

# Копирование package.json
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
COPY packages/database/package*.json ./packages/database/

# Установка только production зависимостей
RUN npm install --omit=dev

# Копирование собранного приложения и Prisma клиента
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/packages/database/node_modules/.prisma ./packages/database/node_modules/.prisma
COPY --from=builder /app/packages/database/prisma ./packages/database/prisma

# Проброс порта
EXPOSE 3001

# Запуск приложения
CMD ["node", "apps/api/dist/main.js"]
