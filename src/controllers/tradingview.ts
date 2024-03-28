import { Request, Response } from "express";
import { sendMessage } from "../bot";
import logger from "../utils/logger";

export const tradingviewWebHook = async (req: Request, res: Response) => {
  try {
    logger.info("TradingView Webhook testing...");
    logger.info("req.body", req.body);
    const kernelData = req.body;
    logger.info({ kernelData });

    sendMessage(kernelData);

    res.status(200).json({
      message: "TradingView Webhook received",
      success: true,
      data: kernelData,
    });
  } catch (error: any) {
    logger.error("Error processing TradingView Webhook", error);

    // Sending an error response back to TradingView
    res.status(500).json({
      message: "Error processing TradingView Webhook",
      success: false,
      error: error.message,
    });
  }
};
