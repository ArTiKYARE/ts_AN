# ======================================
# Dockerfile для Web Frontend (Next.js)
# ======================================

FROM node:20-alpine AS builder

WORKDIR /app

# Установка зависимостей для сборки
RUN apk add --no-cache openssl

# Копирование package.json корня и workspace пакетов
COPY package*.json ./
COPY apps/web/package*.json ./apps/web/

# Установка всех зависимостей (включая dev)
RUN npm install

# Копирование исходного кода
COPY . .

# Аргументы сборки
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

# Сборка приложения
RUN npm run build --workspace=apps/web

# ======================================
# Production образ
# ======================================

FROM node:20-alpine AS production

WORKDIR /app

# Установка runtime зависимостей
RUN apk add --no-cache openssl

# Копирование package.json
COPY package*.json ./
COPY apps/web/package*.json ./apps/web/

# Установка только production зависимостей
RUN npm install --omit=dev

# Копирование собранного приложения
COPY --from=builder /app/apps/web/.next ./apps/web/.next
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/apps/web/next.config.* ./apps/web/

# Проброс порта
EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000

# Запуск приложения
CMD ["npm", "run", "start", "--workspace=apps/web"]
