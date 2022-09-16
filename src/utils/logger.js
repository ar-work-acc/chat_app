import {existsSync, mkdirSync} from 'fs';
import path from 'path';
import winston from 'winston';
import WinstonDaily from 'winston-daily-rotate-file';
import {cwd} from 'node:process';
import {LOG_DIR, CONSOLE_LOG_LEVEL} from '../config/index';

// create log directory if it does not exist yet:
const logDir = path.join(
    new URL('.', import.meta.url).pathname,
    '..',
    '..',
    LOG_DIR,
);
if (!existsSync(logDir)) {
  mkdirSync(logDir);
}

/**
 * Create a logger.
 *
 * By default you pass __filename to get a logger for that module:
 * const logger = logging(__filename)
 * or:
 * const logger = logging(new URL("", import.meta.url).pathname)
 * for ESModules.
 *
 * Or use a custom tag:
 * const logger = logging(tag, false)
 *
 * @param {string} tag __filename or custom tag
 *
 * @param {boolean} isFileName default is true,
 * strips down file name with src as base;
 * pass false if you want to use a custom tag name instead
 *
 * @return {Logger}
 */
const logging = (tag, isFileName = true) => {
  if (isFileName) {
    tag = path.relative(cwd(), tag);
  }

  // add file name info to log format:
  const logFormat = winston.format.printf(
      ({timestamp, level, message}) =>
        `${timestamp} ${level} [${tag}]: ${message}`,
  );

  const logger = winston.createLogger({
    format: winston.format.combine(
        winston.format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss',
        }),
        logFormat,
    ),
    // log level => error: 0, warn: 1, info: 2,
    // http: 3, verbose: 4, debug: 5, silly: 6
    transports: [
      // daily file debug log settings:
      new WinstonDaily({
        level: 'debug',
        datePattern: 'YYYY-MM-DD',
        dirname: logDir + '/debug', // log file /logs/debug/*.log in save
        filename: `%DATE%.log`,
        maxFiles: 30, // 30 Days saved
        json: false,
        zippedArchive: true,
      }),
      // daily file error log settings:
      new WinstonDaily({
        level: 'error',
        datePattern: 'YYYY-MM-DD',
        dirname: logDir + '/error', // log file /logs/error/*.log in save
        filename: `%DATE%.log`,
        maxFiles: 30, // 30 Days saved
        // will cause a leak: "Possible EventEmitter memory leak detected.";
        // enable when needed
        // probably because there are so many different loggers
        // handleExceptions: true,
        json: false,
        zippedArchive: true,
      }),
      // console log settings:
      new winston.transports.Console({
        level: CONSOLE_LOG_LEVEL,
        format: winston.format.combine(
            winston.format.splat(),
            winston.format.colorize(),
        ),
      }),
    ],
  });

  return logger;
};

const logger = logging(new URL('', import.meta.url).pathname);
logger.debug(`*** Log check directory: ${LOG_DIR}, app version = 0.1 ***`);

export {logging};
