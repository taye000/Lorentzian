import logger from "../utils/logger";
import {
  AccountTypeV5,
  GetWalletBalanceParamsV5,
  WalletBalanceV5,
} from "bybit-api";
import { bybit } from "../bot";

// getWalletBalance function for the bot
export async function getWalletBalance(accountType: AccountTypeV5) {
  try {
    // Construct parameters object for getWalletBalance
    const params: GetWalletBalanceParamsV5 = {
      accountType: accountType as AccountTypeV5,
      timestamp: Date.now() // Include the current timestamp
    };

    const walletBalance: WalletBalanceV5 = (await bybit.getWalletBalance(
      params
    )) as WalletBalanceV5;

    const equity:number = parseFloat(walletBalance?.coin[0]?.equity);

    return equity;
  } catch (error: any) {
    logger.error("Error fetching wallet balance", error);
    return null;
  }
}