import { Request, Response } from "express";
import { sendMessage } from "../bot";

export const tradingviewWebHook = async (req: Request, res: Response) => {
  try {
    console.log("TradingView Webhook testing...");
    console.log("req.body", req.body);
    const kernelData = req.body;
    console.log({ kernelData });

    sendMessage(kernelData);

    res.status(200).json({
      message: "TradingView Webhook received",
      success: true,
      data: kernelData,
    });
  } catch (error: any) {
    console.error("Error processing TradingView Webhook", error);
  }
};
