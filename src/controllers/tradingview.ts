import { Request, Response } from "express";
import { sendMessage } from "../bot";
import logger from "../utils/logger";
import { formatMessage } from "../utils";
import { placeOrder } from "./order";
import {
  OrderSideV5,
  OrderParamsV5,
  CategoryV5,
  AccountTypeV5,
} from "bybit-api";
import { calculateTPSL, countDecimalPlaces, getSymbolInfo } from "../common";
import { getSize } from "./position";
import { configs } from "../configs";
import { getWalletBalance } from "./walletBalance";

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

    const accountType = "contract" as AccountTypeV5;
    let qty: string; // Declare qty variable without assigning a default value

    const equity: number | null = await getWalletBalance(accountType);
    if (equity) {
      console.log({ equity });
      const orderSize = equity * orderSizePercentage * leverage;
      console.log({ orderSize });

      // Check if orderSize is less than minOrder
      if (orderSize < minOrder) {
        // Set qty to minOrder * leverage
        qty = (minOrder * leverage).toFixed(coinDecimalPlaces);
      } else {
        // Otherwise, set qty to orderSize rounded to coinDecimalPlaces
        qty = orderSize.toFixed(coinDecimalPlaces);
      }
    } else {
      // If equity is null, set qty to minOrder
      qty = minOrder.toFixed(coinDecimalPlaces);
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

    if (orderResponse.success && orderResponse.data) {
      const { id, market, side, type, quantity } = orderResponse.data;
      const message = `Order placed successfully:
        ID: ${id}
        Market: ${market}
        Side: ${side}
        Type: ${type}
        Quantity: ${quantity}`;
      formattedMessage = await formatMessage(message);
      sendMessage(formattedMessage);

      // Order submitted successfully
      console.log(orderResponse.message);
    } else {
      console.log(orderResponse.message);
      const errorMessage = orderResponse.message;
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