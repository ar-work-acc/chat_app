import Koa from 'koa';
import {morgan} from '@ts-koa/koa-morgan';
import bodyParser from 'koa-bodyparser';
import {
  KOA_APP_KEY_0,
  KOA_APP_KEY_1,
  PORT,
  MONGODB_HOST,
  MONGODB_USERNAME,
  MONGODB_PASSWORD,
  MONGODB_DB_NAME,
  MONGODB_PORT,
} from './config/index';
import {logging} from './utils/logger';
import {jwtErrorSuppressor} from './middlewares/index';
import {router} from './routes';
import https from 'https';
import {readFileSync} from 'node:fs';
import {startWebSocketServer} from './ws/websocket';
import mongoose from 'mongoose';
import os from 'os';

const logger = logging(new URL('', import.meta.url).pathname);

// main Koa app
const app = new Koa();

// set signed cookie keys
app.keys = [KOA_APP_KEY_0, KOA_APP_KEY_1];

// apply middlewares
app.use(
    morgan('dev', {
      logger: logger.debug.bind(logging('MORGAN', false)),
      colored: true,
    }),
);
app.use(jwtErrorSuppressor);
app.use(bodyParser());

// routes
app.use(router.routes()).use(router.allowedMethods());

// create server instance with certs
const server = https.createServer(
    {
      key: readFileSync('./.certs/server.key'),
      cert: readFileSync('./.certs/server.crt'),
    },
    app.callback(),
);

// start web socket server
startWebSocketServer(server);

// connect to MongoDB
try {
  await mongoose.connect(`mongodb://${MONGODB_HOST}:${MONGODB_PORT}/?replicaSet=myReplicaSet`, {
    user: MONGODB_USERNAME,
    pass: MONGODB_PASSWORD,
    dbName: MONGODB_DB_NAME,
    autoCreate: false, // should be created by database/initdb.js already
  });
  logger.debug(
      `*** Connected to MongoDB:` +
      `${MONGODB_HOST}:${MONGODB_PORT}/${MONGODB_DB_NAME} ***`,
  );
} catch (error) {
  logger.error('Error, cannot connect to MongoDB');
}

// start Koa server
server.listen(PORT, () => {
  logger.debug(
      `*** Koa HTTPS server started at port: ${PORT},` +
      ` hostname: ${os.hostname()} ***`,
  );
});
