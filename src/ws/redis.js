import {REDIS_CHANNEL_NAME, REDIS_HOSTNAME} from '../config';
import {logging} from '../utils/logger';
import {webSocketMap} from './websocket';
import Redis from 'ioredis';

const logger = logging(new URL('', import.meta.url).pathname);

/**
 * Send a message to client ID via websocket.
 * @param {*} clientId
 * @param {*} message
 */
const sendWebSocketMessageToClient = (clientId, message) => {
  const userUUIDtoWSMap = webSocketMap.get(clientId);
  if (userUUIDtoWSMap) {
    for (const [uuid, clientWebSocket] of userUUIDtoWSMap.entries()) {
      logger.debug(
          `Subscriber sending message to client: ${clientId}, uuid: ${uuid}`,
      );
      clientWebSocket.send(message);
    }
  }
};

/**
 * Initialize Redis pub/sub for WebSocket messages.
 *
 * @return {Redis} the Redis publisher instance
 */
export const initRedisPubSub = () => {
  const REDIS_URL = `redis://:pw2022r@${REDIS_HOSTNAME}:6379/1`;
  logger.debug(
      `*** Initialize Redis pub/sub for websocket messages,` +
      `Redis URL = ${REDIS_URL} ***`,
  );

  // set up subscriber:
  const subscriber = new Redis(REDIS_URL);

  subscriber.subscribe(REDIS_CHANNEL_NAME, (err, count) => {
    if (err) {
      // Just like other commands, subscribe() can fail for some reasons,
      // ex network issues.
      logger.error(`Failed to subscribe: ${err.message}`);
    } else {
      // `count` represents the number of channels
      // this client are currently subscribed to.
      logger.debug(
          `Subscribed successfully! ` +
          `This client is currently subscribed to ${count} channels.`,
      );
    }
  });

  subscriber.on('message', (channel, message) => {
    const parsedMessage = JSON.parse(message);
    logger.debug(`Got message: ${parsedMessage} from channel ${channel}`);
    sendWebSocketMessageToClient(parsedMessage.from, message);
    sendWebSocketMessageToClient(parsedMessage.to, message);
  });

  // set up publisher and return it:
  const publisher = new Redis(REDIS_URL);

  return publisher;
};
