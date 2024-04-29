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
  CancelAllOrdersParamsV5,
  CancelOrderParamsV5,
  CategoryV5,
  OrderParamsV5,
  OrderSideV5,
  OrderTypeV5,
  PositionInfoParamsV5,
} from "bybit-api";
import { GetWalletBalanceParamsV5 } from "./@types/bybit-types";

const bot = new Telegraf(configs.bot_token!);
export const bybit = new BybitWrapper(
  configs.bybit.apiKey!,
  configs.bybit.apiSecret!
);

// Middleware for authorization
const authMiddleware = async (ctx: Context, next: () => void) => {
  try {
    if (configs.whitelisted.includes(ctx.from?.id || 0)) {
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
    for (const chatId of configs.whitelisted) {
      await bot.telegram.sendMessage(chatId, message, {
        parse_mode: "MarkdownV2",
      });
    }
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
    /bal [accountType] [coin] \\- Check wallet balance for the specified account type and coin\\. 
    /order [symbol] [side] [orderType] [qty] \\- Submit a new order\\. 
    /cancel [symbol] [orderId] \\- Cancel a specific order\\. 
    /cancelall [symbol] \\- Cancel all orders for the specified symbol\\. 
    /position [symbol] \\- Fetch position information for the specified symbol\\.
    `;
  await ctx.replyWithMarkdownV2(helpMessage);
});

bot.command("bal", async (ctx: Context) => {
  try {
    // Extract the parameters from the user's message
    const message = (ctx.message as any)?.text;
    if (!message) {
      ctx.reply("Invalid message format");
      throw new Error("Invalid message format");
    }

    // Split the message into parts and extract relevant parameters
    const parts = message.split(" ");
    if (parts.length !== 2) {
      ctx.reply(
        "Invalid command format. Usage: /bal [accountType]. Valid a/c types: CONTRACT, SPOT,INVESTMENT, OPTION, UNIFIED,FUND. Example: /bal SPOT"
      );
      throw new Error(
        "Invalid command format. Usage: /bal [accountType]. Valid a/c types: CONTRACT, SPOT,INVESTMENT, OPTION, UNIFIED,FUND. Example: /bal SPOT"
      );
    }

    const accountType = parts[1] as AccountTypeV5;
    const coin = parts[2];

    // Construct the params object
    const params: GetWalletBalanceParamsV5 = {
      accountType,
      coin,
      timestamp: Date.now(),
    };

    // Fetch the wallet balance using the provided parameters
    const bal = await bybit.getWalletBalance(params);
    const walletBalance = bal?.coin;

    const equity = bal?.coin[0].equity;

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
    if (parts.length !== 5) {
      ctx.reply(
        "Invalid command format. Usage: /order [side] [symbol] [orderType] [qty]. Valid orderTypes: 'Market' | 'Limit'. Example: /order Buy BTCUSD market 100."
      );
      throw new Error(
        "Invalid command format. Usage: /order [side] [symbol] [orderType] [qty]. Valid orderTypes: 'Market' | 'Limit'. Example: /order Buy BTCUSD market 100."
      );
    }

    const [side, symbol, orderType, qty] = parts.slice(1);
    let category: CategoryV5 = "linear";

    // Construct the params object
    const params: OrderParamsV5 = {
      category: category as CategoryV5,
      symbol: symbol as string,
      side: side as OrderSideV5,
      orderType: orderType as OrderTypeV5,
      qty: qty as string,
      // takeProfit,
      // stopLoss,
    };

    // Submit the order using the provided parameters
    const order = await bybit.submitOrder(params);

    // Check if order data is empty or null
    if (!order) {
      throw new Error("Empty order data");
    }

    await ctx.reply(`Order submitted successfully. Order ID: ${order.id}`);
  } catch (error: any) {
    ctx.reply("Error submitting order, try again.", error);
    logger.error("Error submitting order", error);
  }
});

bot.command("cancel", async (ctx: Context) => {
  try {
    // Extract the parameters from the user's message
    const message = (ctx.message as any)?.text;
    if (!message) {
      ctx.reply("Invalid message format");
      throw new Error("Invalid message format");
    }

    // Split the message into parts and extract relevant parameters
    const parts = message.split(" ");
    if (parts.length !== 2) {
      ctx.reply(
        "Invalid command format. Usage: /cancel [symbol]. Example: /cancel BTCUSD"
      );
      throw new Error(
        "Invalid command format. Usage: /cancel [symbol]. Example: /cancel BTCUSD"
      );
    }

    const symbol = parts[1];

    let category: CategoryV5 = "linear";

    // Construct the params object
    const params: CancelOrderParamsV5 = {
      category,
      symbol,
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

bot.command("cancelall", async (ctx: Context) => {
  try {
    // Extract the parameters from the user's message
    const message = (ctx.message as any)?.text;
    if (!message) {
      ctx.reply("Invalid message format");
      throw new Error("Invalid message format");
    }

    // Split the message into parts and extract relevant parameters
    const parts = message.split(" ");
    if (parts.length !== 1) {
      ctx.reply(
        "Invalid command format. Usage: /cancelall. Example: /cancelall"
      );
      throw new Error(
        "Invalid command format. Usage: /cancelall. Example: /cancelall"
      );
    }

    let category: CategoryV5 = "linear";

    // Construct the params object
    const params: CancelAllOrdersParamsV5 = {
      category,
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

bot.command("position", async (ctx: Context) => {
  try {
    // Extract the parameters from the user's message
    const message = (ctx.message as any)?.text;
    if (!message) {
      ctx.reply("Invalid message format");
      throw new Error("Invalid message format");
    }

    // Split the message into parts and extract relevant parameters
    const parts = message.split(" ");
    if (parts.length < 2) {
      ctx.reply(
        "Invalid command format. Usage: /position or /position [symbol]. Example: /position or /position BTCUSDT"
      );
      throw new Error(
        "Invalid command format. Usage: /position or /position [symbol]. Example: /position or /position BTCUSDT"
      );
    }

    let symbol: string | undefined;
    const category: CategoryV5 = "linear";

    // Check if a symbol is provided
    if (parts.length === 2) {
      symbol = parts[1];
    }

    // Construct the params object
    const params: PositionInfoParamsV5 = {
      category,
      symbol,
    };

    // Fetch the position info using the provided parameters
    const data = await bybit.getPositionInfo(params);

    const positionInfo = data?.list;

    if (!positionInfo || positionInfo.length < 1) {
      await ctx.reply("Empty position info data");
      throw new Error("Empty position info data");
    } else {
      // Format and summarize the position info
      // You can customize this based on the response structure
      const summaryMessage = formatPositionInfo(positionInfo);
      await ctx.reply(summaryMessage);
    }
  } catch (error: any) {
    ctx.reply("Error fetching position info, try again.", error);
    logger.error("Error fetching position info", error);
  }
});

bot.on(message("text"), async (ctx: Context) => {
  const welcomeMessage = await formatMessage(
    `Hello ${ctx.from?.first_name}!, That was an unsupported command.
    /help to see available commands.`
  );
  await ctx.replyWithMarkdownV2(welcomeMessage);
});

export { bot, sendMessage };
