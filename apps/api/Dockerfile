# ==========================================
# Dockerfile для Backend API (NestJS)
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Установка зависимостей для сборки
RUN apk add --no-cache python3 make g++

# Копирование всех package.json файлов
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
COPY apps/web/package*.json ./apps/web/
COPY apps/admin/package*.json ./apps/admin/
COPY packages/database/package*.json ./packages/database/

# Генерация package-lock.json если его нет
RUN if [ ! -f package-lock.json ]; then npm install --package-lock-only; fi

# Установка всех зависимостей
RUN npm install

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
RUN npm install --only=production --ignore-scripts

# Копирование собранного приложения и Prisma клиента
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/packages/database/node_modules/.prisma ./packages/database/node_modules/.prisma
COPY --from=builder /app/packages/database/prisma ./packages/database/prisma

# Проброс порта
EXPOSE 4000

# Запуск приложения
CMD ["node", "apps/api/dist/main.js"]
