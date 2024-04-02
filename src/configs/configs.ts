import "dotenv/config";
import logger from "../utils/logger";

const botToken = process.env.BOT_TOKEN;
const chatId = process.env.CHAT_ID;
const port = process.env.PORT;
const apiKey = process.env.API_KEY;
const apiSecret = process.env.API_SECRET;
const buyPercentage = process.env.BUY_PERCENTAGE;

if (!botToken) {
  logger.error("Error: BOT_TOKEN environment variable is missing.");
  process.exit(1);
}

if (!chatId) {
  logger.error("Error: CHAT_ID environment variable is missing.");
  process.exit(1);
}

if (!apiKey) {
  logger.error("Error: API_KEY environment variable is missing.");
  process.exit(1);
}

if (!apiSecret) {
  logger.error("Error: API_SECRET environment variable is missing.");
  process.exit(1);
}

const parsedPort = parseInt(port || "", 10);
if (isNaN(parsedPort) || parsedPort <= 0) {
  logger.error("Error: Invalid PORT environment variable.");
  process.exit(1);
}

export const configs = {
  bot_token: botToken,
  chat_id: chatId,
  port: parsedPort,
  buyPercentage: parseFloat(buyPercentage || "0.1"),
  bybit: {
    apiKey,
    apiSecret,
  },
};
