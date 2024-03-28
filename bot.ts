import { Telegraf } from "telegraf";
import { configs } from "./src/configs";

const bot = new Telegraf(configs.bot_token!);
