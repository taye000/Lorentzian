import "dotenv/config";
import logger from "../utils/logger";

const botToken = process.env.BOT_TOKEN;
const chatId = process.env.CHAT_ID;
const port = process.env.PORT;

const apiKey = process.env.API_KEY;
const apiSecret = process.env.API_SECRET;

const buyPercentage = process.env.BUY_PERCENTAGE;
const accountType = process.env.ACCOUNT_TYPE;
const coin = process.env.COIN;
const leverage = process.env.LEVERAGE;

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

if (!buyPercentage) {
  logger.error("Error: BUY_PERCENTAGE environment variable is missing.");
  process.exit(1);
}

if (!accountType) {
  logger.error("Error: ACCOUNT_TYPE environment variable is missing.");
  process.exit(1);
}

if (!coin) {
  logger.error("Error: COIN environment variable is missing.");
  process.exit(1);
}

if (!leverage) {
  logger.error("Error: LEVERAGE environment variable is missing.");
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
  accountType,
  coin,
  leverage,
  bybit: {
    apiKey,
    apiSecret,
  },
};
