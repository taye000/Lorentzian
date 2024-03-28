import {
  GetWalletBalanceParamsV5,
  RestClientV5,
} from "bybit-api";
import logger from "./utils/logger";

export class BybitWrapper {
  private client: RestClientV5;

  constructor(apiKey: string, apiSecret: string, testnet = false) {
    this.client = new RestClientV5({
      key: apiKey,
      secret: apiSecret,
      testnet: false,
      parse_exceptions: true,
    });
  }

  async getWalletBalance(params: GetWalletBalanceParamsV5) {
    try {
      const walletBalance = await this.client.getWalletBalance(params);
      if (walletBalance.retCode === 0 && walletBalance.retMsg === "OK") {
        return walletBalance.result.list[0];
      } else {
        logger.error("Error getting wallet balance", walletBalance);
        throw new Error("Error getting wallet balance");
      }
    } catch (error: any) {
      logger.error("Error getting wallet balance", error);
      throw error;
    }
  }
}
