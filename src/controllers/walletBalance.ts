import { Request, Response } from "express";
import logger from "../utils/logger";
import {
  AccountTypeV5,
  GetWalletBalanceParamsV5,
  WalletBalanceV5,
} from "bybit-api";
import { bybit } from "../bot";

// walletBalance controller function for the API
export async function walletBalance(req: Request, res: Response) {
  try {
    // Extract query parameters from the request
    const { accountType, coin } = req.query;

    // Check if required parameters are provided
    if (!accountType || !coin) {
      return res.status(400).json({
        message: "Missing required query parameters",
        success: false,
      });
    }

    // Ensure accountType is of type AccountTypeV5
    let validAccountTypes: AccountTypeV5[] = [
      "CONTRACT",
      "SPOT",
      "INVESTMENT",
      "OPTION",
      "UNIFIED",
      "FUND",
    ];

    if (!validAccountTypes.includes(accountType as AccountTypeV5)) {
      return res.status(400).json({
        message: "Invalid accountType",
        success: false,
      });
    }

    // Construct parameters object for getWalletBalance
    const params: GetWalletBalanceParamsV5 = {
      accountType: accountType as AccountTypeV5,
      coin: coin as string,
    };

    const walletBalance: WalletBalanceV5 = await bybit.getWalletBalance(params);
    logger.info("Wallet balance fetched successfully");

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

// getWalletBalance function for the bot
export async function getWalletBalance(accountType: AccountTypeV5, coin: any) {
  try {
    // Construct parameters object for getWalletBalance
    const params: GetWalletBalanceParamsV5 = {
      accountType: accountType as AccountTypeV5,
      coin: coin as string,
    };

    const walletBalance: WalletBalanceV5 = await bybit.getWalletBalance(params);
    logger.info("Wallet balance fetched successfully");

    return {
      message: "Wallet balance fetched successfully",
      success: true,
      data: walletBalance,
    };
  } catch (error: any) {
    logger.error("Error fetching wallet balance", error);

    return {
      message: "Error fetching wallet balance",
      success: false,
      error: error.message,
    };
  }
}
