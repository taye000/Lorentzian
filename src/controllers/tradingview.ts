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
import { configs } from "../configs";
import { getWalletBalance } from "./walletBalance";
import { getSize } from "./position";

export const tradingviewWebHook = async (req: Request, res: Response) => {
  try {
    console.log(req.body);
    if (!req.body) {
      res.status(400).json({
        message: "Invalid request body",
        success: false,
      });
      return;
    }
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
    console.log("formattedMessage", formattedMessage);
    // Send the message to Telegram
    await sendMessage(formattedMessage);

    const category = "linear" as CategoryV5;
    let symbol = req.body.ticker as string;
    const closePrice: number = req.body.close;
    const side: OrderSideV5 = req.body.action as OrderSideV5;

    const position = await getSize(symbol);
    console.log({ position });

    const markPrice = position?.markPrice;

    let positionQty: string | undefined = undefined;
    if (position && position.side !== side && parseFloat(position.size) > 0) {
      positionQty = (parseFloat(position.size) * 2).toString();
    }

    const orderSizePercentage: number = configs.buyPercentage;
    let leverage: number = parseFloat(configs.leverage);

    const { takeProfit, stopLoss } = calculateTPSL(closePrice, side);

    const { minOrderSize, name } = await getSymbolInfo(symbol);
    let minOrder: number = minOrderSize;

    let coinDecimalPlaces = countDecimalPlaces(minOrderSize);

    const accountType = "contract" as AccountTypeV5;

    let qty: string;

    const equity: number | null = await getWalletBalance(accountType);

    if (equity !== null) {
      const equityAmount = equity * orderSizePercentage;
      const orderSize = equityAmount / closePrice;
      const orderSizeWithLeverage = orderSize * leverage;

      // Check if orderSize is less than minOrder
      if (orderSizeWithLeverage < minOrder) {
        // Set qty to minOrder * leverage
        qty = (minOrder * leverage).toFixed(coinDecimalPlaces);
      } else {
        // Otherwise, set qty to orderSize rounded to coinDecimalPlaces
        qty = orderSizeWithLeverage.toFixed(coinDecimalPlaces);
      }
    } else {
      // If equity is null, set qty to minOrder
      qty = minOrder.toFixed(coinDecimalPlaces);
    }

    if (positionQty) {
      qty = positionQty;
    }

    const orderData: OrderParamsV5 = {
      category: category,
      symbol: symbol,
      side: side,
      orderType: "Market",
      qty: qty,
      stopLoss: stopLoss,
      takeProfit: takeProfit,
    };

    const orderResponse = await placeOrder(orderData);
    console.log(orderResponse);

    if (orderResponse.success) {
      const { retMsg, id, market, side, quantity } = orderResponse.data;
      const msg = `${retMsg} OrderID: ${id} placed Successfully at $: ${markPrice} Price. Qty: ${quantity}`;

      formattedMessage = await formatMessage(msg);

      await sendMessage(formattedMessage);
    } else {
      formattedMessage = await formatMessage(orderResponse.message);
      await sendMessage(formattedMessage);
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
