# ==========================================
# Dockerfile для Backend API (NestJS)
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Установка зависимостей для сборки
RUN apk add --no-cache python3 make g++

# Копирование корневых файлов
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
COPY packages/database/package*.json ./packages/database/

# Установка зависимостей
RUN npm ci

# Копирование исходного кода
COPY . .

# Генерация Prisma клиента
RUN npx prisma generate --schema=./packages/database/prisma/schema.prisma

# Сборка приложения
RUN npm run build --workspace=apps/api

# ------------------------------------------
# Production образ
# ------------------------------------------
FROM node:20-alpine AS production

WORKDIR /app

# Установка runtime зависимостей
RUN apk add --no-cache openssl

# Копирование package.json
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
COPY packages/database/package*.json ./packages/database/

# Установка только production зависимостей
RUN npm ci --only=production

# Копирование собранного приложения и Prisma клиента
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/packages/database/node_modules/.prisma ./packages/database/node_modules/.prisma
COPY --from=builder /app/packages/database/prisma ./packages/database/prisma

# Проброс порта
EXPOSE 4000

# Запуск приложения
CMD ["node", "apps/api/dist/main.js"]
