import express from "express";
import http from "http";
import { configs } from "./configs";
import { bot } from "./bot";
import { middleware } from "./middleware/middleware";
import { routes } from "./routes";
import logger from "./utils/logger";

const main = async () => {
  const app = express();

  app.set("trust proxy", "loopback");

  middleware(app);

  routes(app);

  const port = configs.port || 5001;

  const server = http.createServer(app);

  server.listen(port, () => {
    logger.info(
      `🔥🔥🔥 Server running... ${port},` + ` http://localhost:${port}`
    );
  });

  server.on("error", (error: any) => {
    logger.error("Error starting server", error);
    process.exit(1);
  });

  try {
    logger.info("Starting the Bot...");
    await bot.launch();
  } catch (error: any) {
    logger.error("Error starting bot", error);
    process.exit(1);
  }
};

main().catch((error) => {
  logger.error("Error starting application", error);
  process.exit(1);
});
