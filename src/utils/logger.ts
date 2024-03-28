import winston from "winston";

// Create a Winston logger instance
const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
    // Add additional transports as needed, such as file or database transports
  ],
});

export default logger;
