import { Context, Telegraf } from "telegraf";
import { message } from "telegraf/filters";
import { configs } from "./configs";
import {
  formatMessage,
  formatPositionInfo,
  formatWalletBalance,
} from "./utils";
import logger from "./utils/logger";
import { BybitWrapper } from "./bybit";
import {
  AccountTypeV5,
  CancelOrderParamsV5,
  GetWalletBalanceParamsV5,
  PositionInfoParamsV5,
} from "bybit-api";

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
    `Hello ${ctx.from?.first_name}!, 🤖 *Welcome to the Lorentzian Bot* 🤖
    /help to see available commands.`
  );
  await ctx.replyWithMarkdownV2(welcomeMessage);
});

bot.help(async (ctx: Context) => {
  const helpMessage = `
  🤖 *Welcome to the Lorentzian Bot* 🤖
    Available Commands:
    /balance [accountType] [coin] \\- Check wallet balance for the specified account type and coin\\. 
    /order [category] [symbol] [side] [orderType] [qty] \\- Submit a new order\\. 
    /cancelorder [category] [symbol] [orderId] \\- Cancel a specific order\\. 
    /cancelallorders [category] [symbol] \\- Cancel all orders for the specified symbol\\. 
    /positioninfo [category] [symbol] \\- Fetch position information for the specified category and symbol\\. 
    `;
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
    ctx.reply("Error fetching wallet balance, try again.", error);
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
        "Invalid command format. Usage: /order [category] [symbol] [side] [orderType] [qty]. Valid orderTypes: 'Market' | 'Limit'. Example: /order spot BTCUSD buy market 100"
      );
      throw new Error(
        "Invalid command format. Usage: /order [category] [symbol] [side] [orderType] [qty]. Valid orderTypes: 'Market' | 'Limit'. Example: /order spot BTCUSD buy market 100"
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
    ctx.reply("Error submitting order, try again.", error);
    logger.error("Error submitting order", error);
  }
});

bot.command("cancelorder", async (ctx: Context) => {
  try {
    // Extract the parameters from the user's message
    const message = (ctx.message as any)?.text;
    if (!message) {
      ctx.reply("Invalid message format");
      throw new Error("Invalid message format");
    }

    // Split the message into parts and extract relevant parameters
    const parts = message.split(" ");
    if (parts.length !== 4) {
      ctx.reply(
        "Invalid command format. Usage: /cancelorder [symbol] [orderId]. Example: /cancelorder BTCUSD c6f055d9-7f21-4079-913d-e6523a9cfffa"
      );
      throw new Error(
        "Invalid command format. Usage: /cancelorder [symbol] [orderId]. Example: /cancelorder BTCUSD c6f055d9-7f21-4079-913d-e6523a9cfffa"
      );
    }

    const category = parts[1];
    const symbol = parts[2];
    const orderId = parts[3];

    // Construct the params object
    const params: CancelOrderParamsV5 = {
      category,
      symbol,
      orderId,
    };

    // Cancel the order using the provided parameters
    const cancellationResult = await bybit.cancelOrder(params);

    // Check if the cancellation was successful
    if (!cancellationResult) {
      throw new Error("Failed to cancel order");
    }

    await ctx.reply("Order cancelled successfully");
  } catch (error: any) {
    ctx.reply("Error cancelling order, try again.", error);
    logger.error("Error cancelling order", error);
  }
});

bot.command("cancelallorders", async (ctx: Context) => {
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
        "Invalid command format. Usage: /cancelallorders [symbol]. Example: /cancelallorders BTCUSD"
      );
      throw new Error(
        "Invalid command format. Usage: /cancelallorders [symbol]. Example: /cancelallorders BTCUSD"
      );
    }

    const category = parts[1];
    const symbol = parts[2];

    // Construct the params object
    const params: CancelOrderParamsV5 = {
      category,
      symbol,
    };

    // Cancel all orders using the provided parameters
    const cancellationResult = await bybit.cancelAllOrders(params);

    // Check if the cancellation was successful
    if (!cancellationResult) {
      throw new Error("Failed to cancel all orders");
    }

    await ctx.reply("All orders cancelled successfully");
  } catch (error: any) {
    ctx.reply("Error cancelling all orders, try again.", error);
    logger.error("Error cancelling all orders", error);
  }
});

bot.command("positioninfo", async (ctx: Context) => {
  try {
    // Extract the parameters from the user's message
    const message = (ctx.message as any)?.text;
    if (!message) {
      ctx.reply("Invalid message format");
      throw new Error("Invalid message format");
    }

    // Split the message into parts and extract relevant parameters
    const parts = message.split(" ");
    if (parts.length < 2 || parts.length > 7) {
      ctx.reply(
        "Invalid command format. Usage: /positioninfo [symbol]. Example: /positioninfo BTCUSD"
      );
      throw new Error(
        "Invalid command format. Usage: /positioninfo [symbol]. Example: /positioninfo BTCUSD"
      );
    }

    const category = parts[1];
    const symbol = parts[2];

    // Construct the params object
    const params: PositionInfoParamsV5 = {
      category,
      symbol,
    };

    // Fetch the position info using the provided parameters
    const positionInfo = await bybit.getPositionInfo(params);

    // Check if position info data is empty or null
    if (!positionInfo) {
      throw new Error("Empty position info data");
    }

    // Format and summarize the position info
    // You can customize this based on the response structure
    const summaryMessage = formatPositionInfo(positionInfo);
    await ctx.reply(summaryMessage);
  } catch (error: any) {
    ctx.reply("Error fetching position info, try again.", error);
    logger.error("Error fetching position info", error);
  }
});

bot.on(message("text"), async (ctx: Context) => {
  await ctx.reply("👍");
});

export { bot, sendMessage };
