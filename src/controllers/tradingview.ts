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
  OrderParamsV5,
  CategoryV5,
} from "bybit-api";
import { calculateTPSL, countDecimalPlaces, getSymbolInfo } from "../common";
import { getSize } from "./position";

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
    const closePrice: number = req.body.close;
    const side: OrderSideV5 = req.body.action as OrderSideV5;

    const orderSizePercentage: number = configs.buyPercentage;
    let leverage: number = parseFloat(configs.leverage);

    const { takeProfit, stopLoss } = calculateTPSL(closePrice, side);
    console.log(`Take Profit: ${takeProfit}, Stop Loss: ${stopLoss}`);

    // Send the message to Telegram
    sendMessage(formattedMessage);

    const { minOrderSize, name } = await getSymbolInfo(symbol);
    let minOrder: number = minOrderSize;

    let coinDecimalPlaces = countDecimalPlaces(minOrderSize);
    console.log({ coinDecimalPlaces });

    //check current position size for the symbol
    const size: number | undefined = await getSize(symbol);
    console.log({ size });

    let qty: string;
    if (size === undefined || isNaN(size) || size < minOrder) {
      qty = minOrder.toString();
    } else {
      qty = Math.max(size * 2, minOrder).toFixed(coinDecimalPlaces);
    }

    console.log({ minOrder });
    console.log({ qty });

    const orderData: OrderParamsV5 = {
      category: category,
      symbol: symbol,
      side: side,
      orderType: "Market",
      qty: qty,
      stopLoss: stopLoss,
      takeProfit: takeProfit,
    };

    console.log({ orderData });

    // Submit order for short position
    const orderResponse = await placeOrder(orderData);
    console.log({ orderResponse });

    if (orderResponse.success) {
      // Order placed successfully
      console.log("Order placed successfully", orderResponse.data);
      if (orderResponse.success) {
        // Order placed successfully
        console.log("Order placed successfully", orderResponse.data);

        // Check if orderResponse.data exists and has the expected properties
        if (
          orderResponse.data &&
          "id" in orderResponse.data &&
          "market" in orderResponse.data &&
          "side" in orderResponse.data &&
          "type" in orderResponse.data &&
          "quantity" in orderResponse.data
        ) {
          const { id, market, side, type, quantity } = orderResponse.data;
          const message = `Order placed successfully:
            ID: ${id}
            Market: ${market}
            Side: ${side}
            Type: ${type}
            Quantity: ${quantity}`;
          formattedMessage = await formatMessage(message);
          sendMessage(formattedMessage);
        } else {
          // Handle unexpected response format
          const errorMessage = `Unexpected response format from order placement.`;
          formattedMessage = await formatMessage(errorMessage);
          sendMessage(formattedMessage);
        }
      }
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

//TODO: use close or open price to make limit orders instead of market
