FROM node:20-alpine AS builder

WORKDIR /app

# Копируем package.json и lock файл
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
COPY packages/database/package*.json ./packages/database/ 2>/dev/null || true

# Устанавливаем зависимости
RUN npm ci

# Копируем весь код
COPY . .

# Генерируем Prisma клиент
RUN cd packages/database && npx prisma generate || true

# Собираем приложение
RUN npm run build:api

# Production stage
FROM node:20-alpine

WORKDIR /app

# Копируем package.json
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
COPY packages/database/package*.json ./packages/database/ 2>/dev/null || true

# Устанавливаем production зависимости
RUN npm ci --only=production

# Копируем собранные файлы
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/packages/database/node_modules/.prisma ./packages/database/node_modules/.prisma
COPY --from=builder /app/packages/database/prisma ./packages/database/prisma

EXPOSE 3001

WORKDIR /app/apps/api

CMD ["npm", "run", "start:prod"]
