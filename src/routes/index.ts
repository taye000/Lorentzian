import { Application } from "express";
import tradingviewHookRouter from "./api/tradingview-hook";

export const routes = (app: Application) => {
  app.use("/api/tradingview", tradingviewHookRouter);

  app.get("/", (req, res) => {
    res.send("Lorentzian Bot 🚀🚀🚀");
  });
};
