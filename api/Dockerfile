# ======================================
# Dockerfile для Backend API (NestJS)
# ======================================

FROM node:20-alpine AS builder

WORKDIR /app

# Установка зависимостей для Prisma и сборки
RUN apk add --no-cache openssl

# Копирование package.json
COPY package*.json ./

# Установка всех зависимостей (включая dev)
RUN npm install

# Копирование исходного кода
COPY . .

# Генерация Prisma Client
RUN npx prisma generate

# Сборка приложения
RUN npm run build

# ======================================
# Production образ
# ======================================

FROM node:20-alpine AS production

WORKDIR /app

# Установка runtime зависимостей
RUN apk add --no-cache openssl

# Копирование package.json
COPY package*.json ./

# Установка только production зависимостей
RUN npm install --omit=dev

# Копирование собранного приложения и Prisma клиента
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/prisma ./prisma

# Проброс порта
EXPOSE 3001

# Запуск приложения
CMD ["node", "dist/main.js"]
