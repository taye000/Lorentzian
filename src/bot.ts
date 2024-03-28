import { Context, Telegraf } from "telegraf";
import { message } from "telegraf/filters";
import { configs } from "./configs";
import { formatMessage } from "./utils";
import { MessageData } from "./@types/message";
import logger from "./utils/logger";

const bot = new Telegraf(configs.bot_token!);

// Middleware for authorization
bot.use(async (ctx: Context, next: () => void) => {
  try {
    // Check if the user is authorized
    if (ctx.from?.id === Number(configs.chat_id)) {
      return next();
    }
    // Log unauthorized access attempts
    logger.warn(`Unauthorized access attempt by user ID ${ctx.from?.id}`);
    // Reply with an unauthorized message
    return ctx.reply("You are not authorized to use this bot");
  } catch (error) {
    // Log any errors that occur in the middleware
    logger.error("Error in authorization middleware", error);
  }
});

// Function to send a message
const sendMessage = async (data: MessageData) => {
  logger.info("Sending message...", data);

  try {
    // Validate data
    if (!data || typeof data !== "object") {
      throw new Error("Invalid message data");
    }

    // Extract data from the message
    const { ticker, close, interval, condition } = data;

    // Construct the message
    const messageText = `*${ticker}* is at *${close}* on *${interval}* interval *${condition}*`;

    // Send the message
    await bot.telegram.sendMessage(configs.chat_id!, messageText, {
      parse_mode: "MarkdownV2",
    });

    // Log successful message sending
    logger.info("Message sent successfully", { message: messageText });
  } catch (error) {
    // Log any errors that occur during message sending
    logger.error("Error sending message", error);
  }
};

// Commands and event handlers
bot.start(async (ctx: Context) => {
  const welcomeMessage = await formatMessage(`Hello ${ctx.from?.first_name}!, Welcome to The Bot.`);
  await ctx.replyWithMarkdownV2(welcomeMessage);
});

bot.help(async (ctx: Context) => {
  const helpMessage = await formatMessage("This is the Lorentzian Bot 💯.");
  await ctx.replyWithMarkdownV2(helpMessage);
});

bot.on(message("text"), async (ctx: Context) => {
  await ctx.reply("👍");
});

export { bot, sendMessage };
