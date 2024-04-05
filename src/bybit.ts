import {
  GetWalletBalanceParamsV5,
  RestClientV5,
  OrderParamsV5,
  CancelOrderParamsV5,
  PositionInfoParamsV5,
  CancelAllOrdersParamsV5,
  SetLeverageParamsV5,
  GetInstrumentsInfoParamsV5,
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
      }
    } catch (error: any) {
      logger.error("Error getting wallet balance", error);
      throw error;
    }
  }

  async submitOrder(params: OrderParamsV5) {
    try {
      const {retCode, retMsg, result} = await this.client.submitOrder(params);
      if (retCode !== 0) {
        logger.error("Error creating order", result);
      }
      logger.info(retMsg);
      return result;
    } catch (error: any) {
      logger.error("Error creating order", error);
      throw error;
    }
  }

  async cancelOrder(params: CancelOrderParamsV5) {
    try {
      const order = await this.client.cancelOrder(params);
      if (order.retCode !== 0) {
        logger.error("Error cancelling order", order);
      }
      logger.info(order);
      return order;
    } catch (error: any) {
      logger.error("Error cancelling order", error);
      throw error;
    }
  }

  async cancelAllOrders(params: CancelAllOrdersParamsV5) {
    try {
      const orders = await this.client.cancelAllOrders(params);
      if (orders.retCode !== 0) {
        logger.error("Error cancelling all orders", orders);
      }
      logger.info(orders);
      return orders;
    } catch (error: any) {
      logger.error("Error cancelling all orders", error);
      throw error;
    }
  }

  async getPositionInfo(params: PositionInfoParamsV5) {
    try {
      const positionInfo = await this.client.getPositionInfo(params);
      if (positionInfo.retCode === 0 && positionInfo.retMsg === "OK") {
        return positionInfo.result;
      } else {
        logger.error("Error getting position info", positionInfo);
      }
    } catch (error: any) {
      logger.error("Error getting position info", error);
      throw error;
    }
  }

  async setLeverage(params: SetLeverageParamsV5) {
    try {
      const setLeverage = await this.client.setLeverage(params);
      if (setLeverage.retCode === 0 && setLeverage.retMsg === "OK") {
        return setLeverage.result;
      } else {
        logger.error("Error setting leverage info", setLeverage);
      }
    } catch (error: any) {
      logger.error("Error setting leverage info", error);
      throw error;
    }
  }

  async getInstrumentsInfo(params: GetInstrumentsInfoParamsV5) {
    try {
      const instrumentsInfo = await this.client.getInstrumentsInfo(params);
      if (instrumentsInfo.retCode === 0 && instrumentsInfo.retMsg === "OK") {
        return instrumentsInfo.result;
      } else {
        logger.error("Error getting instruments info", instrumentsInfo);
      }
    } catch (error: any) {
      logger.error("Error getting instruments info", error);
      throw error;
    }
  }
}
