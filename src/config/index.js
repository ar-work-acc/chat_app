export const {
  NODE_ENV = 'development',
  PORT = 3000,
  LOG_DIR = '_logs',
  CONSOLE_LOG_LEVEL = 'debug',
  KOA_APP_KEY_0 = 'dev-koa-app-key-0',
  KOA_APP_KEY_1 = 'dev-koa-app-key-1',
  JWT_SECRET = 'dev-jwt-secret',
  MONGODB_HOST = 'localhost',
  MONGODB_PORT = 27017,
  MONGODB_USERNAME = 'root',
  MONGODB_PASSWORD = 'admin',
  MONGODB_DB_NAME = 'test',
  ORIGIN = 'https://localhost:3000',
  REDIS_CHANNEL_NAME = 'wss',
  REDIS_HOSTNAME = 'localhost',
} = process.env;
