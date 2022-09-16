import {WebSocketServer} from 'ws';
import {logging} from '../utils/logger';
import {parseCookies} from '../utils/etc';
import jwt from 'jsonwebtoken';
import {JWT_SECRET, ORIGIN, REDIS_CHANNEL_NAME} from '../config';
import {Message} from '../database/models';
import {initRedisPubSub} from './redis';
import {v4 as uuidv4} from 'uuid';

const logger = logging(new URL('', import.meta.url).pathname);

/**
 * Every incoming message is published to Redis;
 * each container subscribes to send messages back to clients.
 *
 * key: userId
 * value: Map<uuidv4, ws>
 */
export const webSocketMap = new Map();

const startWebSocketServer = (server) => {
  logger.debug(`*** Starting WSS sever ***`);

  const publisher = initRedisPubSub();

  // start WS
  const wss = new WebSocketServer({
    server,
    verifyClient: (info, cb) => {
      // only accept HTTPS connections
      if (info.secure !== true) {
        logger.debug(`Only WSS is accepted.`);
        cb(false);
        return;
      }

      // also verify the origin (block as required)
      if (info.origin !== ORIGIN) {
        logger.debug(`Origin ${info.origin} is not equal to ${info.origin}`);
        cb(false);
        return;
      }

      // validate JWT token, check if we should accept the connection
      const cookies = parseCookies(info.req);
      try {
        jwt.verify(cookies['jwt'], JWT_SECRET);
      } catch (error) {
        logger.error(`JWT token verification error! Aborting`);
        cb(false);
        return;
      }

      cb(true);
    },
  });

  wss.on('connection', (ws, req) => {
    // userID for this connection:
    let user = null;
    const uuid = uuidv4();

    const cookies = parseCookies(req);
    try {
      user = jwt.verify(cookies['jwt'], JWT_SECRET);
      console.log(user);

      let userUUIDtoWSMap = webSocketMap.get(user._id);
      if (userUUIDtoWSMap) {
        userUUIDtoWSMap.set(uuid, ws);
      } else {
        userUUIDtoWSMap = new Map();
        userUUIDtoWSMap.set(uuid, ws);
        webSocketMap.set(user._id, userUUIDtoWSMap);
      }
      logger.debug(
          `Creating new connection for user: ${user._id} with uuid: ${uuid}`,
      );
    } catch (error) {
      logger.error('JWT token verification failed! Closing connection.');
      ws.close();
    }

    ws.send('Hi, you\'re connected to our websocket server for chat app.');

    ws.on('message', async (data, isBinary) => {
      const message = isBinary ? data : data.toString();
      // Continue as before.

      const parsed = JSON.parse(message);
      const targetUserId = parsed.to;
      const targetMessage = parsed.message;

      logger.debug(
          `Get WS message: ${targetMessage}` +
          `from user: ${user.username} to ${targetUserId}`,
      );

      const newMessage = await new Message({
        from: user._id,
        to: targetUserId,
        content: targetMessage,
      }).save();

      publisher.publish(REDIS_CHANNEL_NAME, JSON.stringify(newMessage));
    });

    ws.on('close', (code, data) => {
      const reason = data.toString();
      // Continue as before.

      logger.debug(
          `Closing WebSocket connection for` +
          `user ID: ${user._id}, uuid: ${uuid}, reason = ${reason}`,
      );
      if (user._id) {
        const userUUIDtoWSMap = webSocketMap.get(user._id);
        if (userUUIDtoWSMap) {
          userUUIDtoWSMap.delete(uuid);
        }
      }
      logger.debug(`WS closed.`);
    });
  });
};

export {startWebSocketServer};
