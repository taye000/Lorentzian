import { Context, Telegraf } from "telegraf";
import { message } from "telegraf/filters";
import { configs } from "./configs";
import { formatMessage, formatWalletBalance } from "./utils";
import logger from "./utils/logger";
import { BybitWrapper } from "./bybit";
import { GetWalletBalanceParamsV5 } from "bybit-api";

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
    const params: GetWalletBalanceParamsV5 = {
      accountType: "CONTRACT",
      coin: "USDT",
    };
    const walletBalance = await bybit.getWalletBalance(params);

    // Format and summarize the wallet balance
    const summaryMessage = formatWalletBalance(walletBalance);
    await ctx.reply(summaryMessage);
  } catch (error: any) {
    logger.error("Error fetching wallet balance", error);
    await ctx.reply("Error fetching wallet balance");
  }
});

bot.on(message("text"), async (ctx: Context) => {
  await ctx.reply("👍");
});

export { bot, sendMessage };
