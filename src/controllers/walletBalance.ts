import { Request, Response } from "express";
import { BybitWrapper } from "../bybit";
import { configs } from "../configs";
import logger from "../utils/logger";
import { GetWalletBalanceParamsV5 } from "bybit-api";
import { bybit } from "../bot";

export async function walletBalance(req: Request, res: Response) {
  try {
    const params: GetWalletBalanceParamsV5 = {
      accountType: "CONTRACT",
      coin: "USDT",
    };
    const walletBalance = await bybit.getWalletBalance(params);
    logger.info("Wallet balance fetched successfully", walletBalance);

    res.status(200).json({
      message: "Wallet balance fetched successfully",
      success: true,
      data: walletBalance,
    });
  } catch (error: any) {
    logger.error("Error fetching wallet balance", error);

    res.status(500).json({
      message: "Error fetching wallet balance",
      success: false,
      error: error.message,
    });
  }
}
