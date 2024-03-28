import { Context, Telegraf } from "telegraf";
import { message } from "telegraf/filters";
import { configs } from "./configs";
import { formatMessage } from "./utils";

const bot = new Telegraf(configs.bot_token!);

bot.use(async (ctx: any, next: any) => {
  try {
    if (ctx.from?.id === Number(configs.chat_id)) {
      return next();
    }
    return ctx.reply("You are not authorized to use this bot");
  } catch (error: any) {
    console.error("Error in middleware", error);
  }
});

const messageBase = async (text: string, ctx: Context) => {
  return ctx.replyWithMarkdownV2(text);
};

bot.start(async (ctx) => {
  const defaultText = await formatMessage(`Hello ${ctx.from?.first_name}!, Welcome to The Bot.`);
  await messageBase(defaultText, ctx);
});

bot.help(async (ctx) => {
  const helpText = await formatMessage(
    "This is the Lorentzian Bot 💯."
  );
  await messageBase(helpText, ctx);
});

bot.on(message("text"), async (ctx) => await ctx.reply("👍"));

const sendMessage = async (text: string) => {
  try {
    if (typeof text !== "string" || !text.trim()) {
      throw new Error("Invalid message");
    }
    const formattedText = await formatMessage(text);
    await bot.telegram.sendMessage(configs.chat_id!, formattedText, {
      parse_mode: "MarkdownV2",
    });
  } catch (error: any) {
    console.error("Error sending message", error);
  }
};

export { bot, sendMessage };
