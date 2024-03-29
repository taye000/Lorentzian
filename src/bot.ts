import { Context, Telegraf } from "telegraf";
import { message } from "telegraf/filters";
import { configs } from "./configs";
import { formatMessage, formatWalletBalance } from "./utils";
import logger from "./utils/logger";
import { BybitWrapper } from "./bybit";
import { AccountTypeV5, GetWalletBalanceParamsV5 } from "bybit-api";

const bot = new Telegraf(configs.bot_token!);
export const bybit = new BybitWrapper(
  configs.bybit.apiKey!,
  configs.bybit.apiSecret!
);

// Middleware for authorization
const authMiddleware = async (ctx: Context, next: () => void) => {
  try {
    if (ctx.from?.id === Number(configs.chat_id)) {
      return next();
    }
    logger.warn(`Unauthorized access attempt by user ID ${ctx.from?.id}`);
    return ctx.reply("You are not authorized to use this bot");
  } catch (error) {
    logger.error("Error in authorization middleware", error);
  }
};

bot.use(authMiddleware);

// Function to send a message
const sendMessage = async (message: any) => {
  try {
    // Send the message
    await bot.telegram.sendMessage(configs.chat_id!, message, {
      parse_mode: "MarkdownV2",
    });

    // Log successful message sending
    logger.info("Message sent successfully", { message: message });
  } catch (error) {
    // Log any errors that occur during message sending
    logger.error("Error sending message", error);
    throw new Error("Failed to send message");
  }
};

// Commands and event handlers
bot.start(async (ctx: Context) => {
  const welcomeMessage = await formatMessage(
    `Hello ${ctx.from?.first_name}!, Welcome to The Bot.`
  );
  await ctx.replyWithMarkdownV2(welcomeMessage);
});

bot.help(async (ctx: Context) => {
  const helpMessage = await formatMessage("This is the Lorentzian Bot 💯.");
  await ctx.replyWithMarkdownV2(helpMessage);
});

bot.command("balance", async (ctx: Context) => {
  try {
    // Extract the parameters from the user's message
    const message = (ctx.message as any)?.text;
    if (!message) {
      ctx.reply("Invalid message format");
      throw new Error("Invalid message format");
    }

    // Split the message into parts and extract relevant parameters
    const parts = message.split(" ");
    if (parts.length !== 3) {
      ctx.reply(
        "Invalid command format. Usage: /balance [accountType] [coin]. Valid a/c types: CONTRACT, SPOT,INVESTMENT, OPTION, UNIFIED,FUND. Example: /balance SPOT USDT"
      );
      throw new Error(
        "Invalid command format. Usage: /balance [accountType] [coin]. Valid a/c types: CONTRACT, SPOT,INVESTMENT, OPTION, UNIFIED,FUND. Example: /balance SPOT USDT"
      );
    }

    const accountType = parts[1] as AccountTypeV5;
    const coin = parts[2];

    // Construct the params object
    const params: GetWalletBalanceParamsV5 = {
      accountType,
      coin,
    };

    // Fetch the wallet balance using the provided parameters
    const walletBalance = await bybit.getWalletBalance(params);

    // Check if wallet balance data is empty or null
    if (!walletBalance) {
      throw new Error("Empty wallet balance data");
    }

    // Format and summarize the wallet balance
    const summaryMessage = formatWalletBalance(walletBalance);
    await ctx.reply(summaryMessage);
  } catch (error: any) {
    logger.error("Error fetching wallet balance", error);
  }
});

bot.command("order", async (ctx: Context) => {
  try {
    // Extract the parameters from the user's message
    const message = (ctx.message as any)?.text;
    if (!message) {
      ctx.reply("Invalid message format");
      throw new Error("Invalid message format");
    }

    // Split the message into parts and extract relevant parameters
    const parts = message.split(" ");
    if (parts.length !== 6) {
      ctx.reply(
        "Invalid command format. Usage: /order [category] [symbol] [side] [orderType] [qty]. Example: /order spot BTCUSD buy market 100"
      );
      throw new Error(
        "Invalid command format. Usage: /order [category] [symbol] [side] [orderType] [qty]. Example: /order spot BTCUSD buy market 100"
      );
    }

    const category = parts[1];
    const symbol = parts[2];
    const side = parts[3];
    const orderType = parts[4];
    const qty = parts[5];

    // Construct the params object
    const params = {
      category,
      symbol,
      side,
      orderType,
      qty,
    };

    // Submit the order using the provided parameters
    const order = await bybit.submitOrder(params);

    // Check if order data is empty or null
    if (!order) {
      throw new Error("Empty order data");
    }

    await ctx.reply(
      `Order submitted successfully. Order ID: ${order.result.orderId}, Order Link ID: ${order.result.orderLinkId}`
    );
  } catch (error: any) {
    logger.error("Error submitting order", error);
  }
});

bot.on(message("text"), async (ctx: Context) => {
  await ctx.reply("👍");
});

export { bot, sendMessage };
