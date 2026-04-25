// packages/database/prisma/prisma.config.ts
import { defineConfig } from 'prisma/config';

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL,
    // Для миграций в dev можно указать shadow database:
    // shadowDatabaseUrl: process.env.SHADOW_DATABASE_URL,
  },
});