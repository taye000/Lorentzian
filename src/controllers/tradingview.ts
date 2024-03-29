import { Request, Response } from "express";
import { sendMessage } from "../bot";
import logger from "../utils/logger";

export const tradingviewWebHook = async (req: Request, res: Response) => {
  try {
    logger.info("TradingView Webhook testing...");
    console.log("req.body", req.body);
    logger.info("req.headers", req.headers);
    logger.info("req.method", req.method);
    logger.info("req.body", req.body);

    // Get the Content-Type header
    const contentType = req.get("Content-Type");

    // Parse the body based on the Content-Type header
    let kernelData;
    if (contentType && contentType.startsWith("application/json")) {
      // If the content type is JSON, parse the body as JSON
      kernelData = req.body;
    } else {
      // Otherwise, use the body as is
      kernelData = req.body;
    }

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
