import { Application, Request, Response, NextFunction } from "express";
import tradingviewHookRouter from "./api/tradingview-hook";
import logger from "../utils/logger";

export const routes = (app: Application) => {
  // Use routes from tradingviewHookRouter for TradingView webhook handling
  app.use("/api/tradingview", tradingviewHookRouter);

  // Default route to show a welcome message
  app.get("/", (req: Request, res: Response) => {
    try {
      res.send("Lorentzian Bot 🚀🚀🚀");
    } catch (error) {
      logger.error("Error sending welcome message", error);
      res.status(500).send("Internal Server Error");
    }
  });

  // Route not found handler
  app.use((_req: Request, res: Response, next: NextFunction) => {
    res.status(404).send("Route not found");
  });

  // Error handler
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    logger.error("Internal Server Error", err);
    res.status(500).send("Internal Server Error");
  });
};
