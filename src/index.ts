import express from "express";
import http from "http";
import { configs } from "./configs";
import { bot } from "./bot";
import { middleware } from "./middleware/middleware";

const main = async () => {
  const app = express();

  middleware(app);

  const server = http.createServer(app);

  const port = configs.port || 5001;

  server.listen(port, () => {
    console.log(
      `🔥🔥🔥 Server running... ${port},` + ` http://localhost:${port}`
    );
  });

  server.on("error", (error: any) => {
    console.error("Error starting server", error);
    process.exit(1);
  });

  try {
    console.log("Starting the Bot...");
    await bot.launch();
  } catch (error: any) {
    console.error("Error starting bot", error);
    process.exit(1);
  }
};

main().catch((error) => {
  console.error("Error starting application", error);
  process.exit(1);
});
