import winston from 'winston';

const isTestEnv = process.env.NODE_ENV === 'test';

const transports = isTestEnv
  ? [
      new winston.transports.Console({
        silent: true,
      }),
    ]
  : [
      new winston.transports.Console({
        level: 'info',
        format: winston.format.combine(
          winston.format.colorize({ all: true }),
          winston.format.simple()
        ),
      }),
      new winston.transports.File({
        level: 'error',
        filename: 'logs/app.log',
        format: winston.format.combine(
          winston.format.errors({ stack: true }),
          winston.format.prettyPrint(),
          winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' })
        ),
      }),
    ];

const logger = winston.createLogger({
  level: 'info',
  handleRejections: true,
  handleExceptions: true,
  format: winston.format.combine(
    winston.format.errors({ stack: true }),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' })
  ),
  transports,
});

export default logger;
