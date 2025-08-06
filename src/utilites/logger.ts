import winston from 'winston';

const logger = winston.createLogger({
  level: 'info', // Set the default logging level
  handleRejections: true,
  handleExceptions: true,
  format: winston.format.combine(
    winston.format.prettyPrint(),
    winston.format.colorize(),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' })
  ),
  transports: [
    new winston.transports.Console(), // Log to the console
    new winston.transports.File({ filename: 'logs/app.log' }), // Log to a file
  ],
});

export default logger;
