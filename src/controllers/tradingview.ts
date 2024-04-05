import { Request, Response } from "express";
import { sendMessage } from "../bot";
import logger from "../utils/logger";
import { formatMessage } from "../utils";
import { placeOrder } from "./order";
import { getWalletBalance } from "./walletBalance";
import { configs } from "../configs";
import {
  AccountTypeV5,
  OrderSideV5,
  OrderResultV5,
  OrderParamsV5,
  CategoryV5,
} from "bybit-api";
import { getSymbolInfo } from "../common";
import { getInstruments } from "./market";

export const tradingviewWebHook = async (req: Request, res: Response) => {
  try {
    // Parse the body based on the Content-Type header
    let formattedMessage: string;
    if (req.is("json")) {
      // If the content type is JSON, parse the body as JSON
      const { action, ticker, close, interval } = req.body;

      // Format the message using formatMessage function
      formattedMessage = await formatMessage(
        `${action} ${ticker} ${close} ${interval}`
      );
    } else {
      // Otherwise, use the body as is
      formattedMessage = req.body.toString();
    }

    const category = "linear" as CategoryV5;
    let symbol = req.body.ticker as string;
    const side: OrderSideV5 = req.body.action as OrderSideV5;
    // logger.info("Side: " + side);

    // Send the message to Telegram
    sendMessage(formattedMessage);

    const { minOrderSize, name } = await getSymbolInfo(symbol);
    let minOrder = minOrderSize.toString();
    logger.info("minOrderSize: " + minOrderSize + " name: " + name);

    // const getInstrumentsinfo = await getInstruments(req.body.ticker);
    // console.log("getInstrumentsinfo", getInstrumentsinfo?.list);

    let account_type: AccountTypeV5 = configs.accountType as AccountTypeV5;

    // Retrieve wallet balance
    const { data, success, error } = await getWalletBalance(account_type);
    if (data === undefined) {
      throw new Error("Failed to retrieve account balance.");
    }

    // Destructure only the fields with values
    const {
      accountType,
      coin: [
        {
          coin,
          availableToWithdraw,
          equity,
          walletBalance,
          cumRealisedPnl,
          unrealisedPnl,
        },
      ],
    } = data;

    logger.info("Wallet balance:", {
      accountType,
      coin,
      availableToWithdraw,
      equity,
      walletBalance,
      cumRealisedPnl,
      unrealisedPnl,
    });

    // Calculate order size
    const orderSizePercentage: number = configs.buyPercentage;

    const orderSize: number =
      parseFloat(availableToWithdraw) * orderSizePercentage;
    // logger.info("Order size: " + orderSize);

    let leverage: number = parseFloat(configs.leverage);

    const orderSizeWithLeverage: number = orderSize * leverage;
    // logger.info("orderSizeWithLeverage: " + orderSizeWithLeverage);

    // Get the close price from the TradingView webhook
    const closePrice: number = req.body.close;

    // Calculate quantity
    // const qty: string = (orderSizeWithLeverage / closePrice).toFixed(3);
    // logger.info("Quantity: " + qty);

    const orderData: OrderParamsV5 = {
      category: category,
      symbol: symbol,
      side: side,
      orderType: "Market",
      qty: minOrder,
    };

    // Submit order for short position
    const orderResponse = await placeOrder(orderData);
    console.log("order response " + orderResponse.data);

    // Check the retCode in the response
    if (orderResponse.success) {
      // Order placed successfully
      console.log("Order placed successfully", orderResponse.message);
      // const orderId = orderResponse.data?.result.orderId;
      const message = `Order placed successfully: ${orderResponse.data}`;
      formattedMessage = await formatMessage(message);
      sendMessage(formattedMessage);
    } else {
      // Failed to place order
      console.log("Failed to place order", orderResponse.message);
      const errorMessage = `Failed to place order. Error: ${orderResponse.message}`;
      formattedMessage = await formatMessage(errorMessage);
      sendMessage(formattedMessage);
    }

    res.status(200).json({
      message: "TradingView Webhook received, & Trade executed successfully!",
      success: true,
      data: formattedMessage,
    });
  } catch (error: any) {
    logger.error("Error processing TradingView Webhook:", error);

    // Sending an error response back to TradingView
    res.status(500).json({
      message: "Error processing TradingView Webhook",
      success: false,
      error: error.message,
    });
  }
};

//TODO 1: https://bybit-exchange.github.io/docs/v5/account/fee-rate
//TODO 2: https://bybit-exchange.github.io/docs/v5/asset/coin-info
//TODO 3: https://bybit-exchange.github.io/docs/v5/order/amend-order
//TODO 4: https://bybit-exchange.github.io/docs/v5/position/leverage
