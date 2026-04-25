# ======================================
# Dockerfile для Admin Panel (Next.js)
# ======================================

FROM node:20-alpine AS builder

WORKDIR /app

# Установка зависимостей для сборки
RUN apk add --no-cache openssl

# Копирование package.json корня и workspace пакетов
COPY package*.json ./
COPY apps/admin/package*.json ./apps/admin/

# Установка всех зависимостей (включая dev)
RUN npm install

# Копирование исходного кода
COPY . .

# Аргументы сборки
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

# Сборка приложения
RUN npm run build --workspace=apps/admin

# ======================================
# Production образ
# ======================================

FROM node:20-alpine AS production

WORKDIR /app

# Установка runtime зависимостей
RUN apk add --no-cache openssl

# Копирование package.json
COPY package*.json ./
COPY apps/admin/package*.json ./apps/admin/

# Установка только production зависимостей
RUN npm install --omit=dev

# Копирование собранного приложения
COPY --from=builder /app/apps/admin/.next ./apps/admin/.next
COPY --from=builder /app/apps/admin/public ./apps/admin/public
COPY --from=builder /app/apps/admin/next.config.* ./apps/admin/

# Проброс порта
EXPOSE 3002

ENV NODE_ENV=production
ENV PORT=3002

# Запуск приложения
CMD ["npm", "run", "start", "--workspace=apps/admin"]
