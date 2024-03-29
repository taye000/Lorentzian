import { Request, Response } from "express";
import { sendMessage } from "../bot";
import logger from "../utils/logger";
import { formatMessage } from "../utils";

export const tradingviewWebHook = async (req: Request, res: Response) => {
  try {
    logger.info("TradingView Webhook testing...");
    console.log("req.body", req.body);

    // Get the Content-Type header
    const contentType = req.get("Content-Type");

    // Parse the body based on the Content-Type header
    let kernelData;
    if (contentType && contentType.startsWith("application/json")) {
      // If the content type is JSON, parse the body as JSON
      const { action, ticker, close, interval } = req.body;

      // Format the message using formatMessage function
      kernelData = await formatMessage(`${action} ${ticker} ${close} ${interval}`);
    } else {
      // Otherwise, use the body as is
      kernelData = req.body.toString();
    }

    logger.info({ kernelData });

    // Send the message to Telegram
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
