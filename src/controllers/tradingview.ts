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
    console.log("req.body", req.body);
    if (!req.body) {
      return res.status(400).json({
        message: "Invalid request body",
        success: false,
      });
    }

    const { action, ticker, close, interval } = req.body;

    if (!action || !ticker || !close || !interval) {
      return res.status(400).json({
        message: "Missing required fields",
        success: false,
      });
    }

    const formattedMessage = await formatMessage(
      `${action} ${ticker} ${close} ${interval}`
    );
    console.log("formattedMessage", formattedMessage);
    await sendMessage(formattedMessage);

    const symbol = ticker.trim(); // Ensure there are no extra spaces
    const category: CategoryV5 = "linear";
    const closePrice = parseFloat(close);
    const side = (action.charAt(0).toUpperCase() +
      action.slice(1).toLowerCase()) as OrderSideV5;

    console.log("symbol", symbol);
    console.log("category", category);
    console.log("closePrice", closePrice);
    console.log("side", side);

    const { minOrderSize } = await getSymbolInfo(symbol);
    console.log("minOrderSize", minOrderSize);

    const position = await getSize(symbol);
    let positionQty: string | undefined = undefined;
    let markPrice: string | undefined = undefined;

    if (position && parseFloat(position.size) > 0) {
      console.log("position", position);
      markPrice = position.markPrice;
      const positionSide = position.side;
      const positionSize = parseFloat(position.size);

      console.log("markPrice", markPrice);
      console.log("positionSide", positionSide);
      console.log("positionSize", positionSize);

      if (positionSize > 0 && positionSide !== side) {
        positionQty = (positionSize * 2).toString();
        console.log("positionQty", positionQty);
      }
    } else {
      console.log("You have no prior Position for this symbol");
    }

    const orderSizePercentage = configs.buyPercentage;
    const leverage = parseFloat(configs.leverage);
    const { takeProfit, stopLoss } = calculateTPSL(closePrice, side);

    console.log("orderSizePercentage", orderSizePercentage);
    console.log("leverage", leverage);
    console.log("takeProfit", takeProfit);
    console.log("stopLoss", stopLoss);

    const coinDecimalPlaces = countDecimalPlaces(minOrderSize);
    const accountType = "contract" as AccountTypeV5;
    console.log("coinDecimalPlaces", coinDecimalPlaces);

    const equity = await getWalletBalance(accountType);
    console.log("equity", equity);

    if (equity && isNaN(equity)) {
      await sendMessage("You have No equity to place order");
      return;
    }

    let qty: string;

    if (equity !== null && !Number.isNaN(equity)) {
      const equityAmount = equity * orderSizePercentage;
      const orderSize = equityAmount / closePrice;
      const orderSizeWithLeverage = orderSize * leverage;
      console.log("orderSize", orderSize);
      console.log("orderSizeWithLeverage", orderSizeWithLeverage);

      // Check if orderSize is less than minOrder
      if (orderSizeWithLeverage < minOrderSize) {
        // Set qty to minOrder * leverage
        qty = (minOrderSize * leverage).toFixed(coinDecimalPlaces);
      } else {
        // Otherwise, set qty to orderSize rounded to coinDecimalPlaces
        qty = orderSizeWithLeverage.toFixed(coinDecimalPlaces);
      }
    } else {
      // If equity is null, set qty to minOrder
      qty = minOrderSize.toFixed(coinDecimalPlaces);
    }

    if (positionQty) {
      qty = positionQty;
    }
    console.log("qty", qty);

    const orderData: OrderParamsV5 = {
      category,
      symbol,
      side,
      orderType: "Market",
      qty,
      stopLoss,
      takeProfit,
    };
    console.log("orderData", orderData);

    const orderResponse = await placeOrder(orderData);
    console.log("orderResponse", orderResponse);

    if (orderResponse.success) {
      const { retMsg, id, quantity } = orderResponse.data;
      const successMessage = `${retMsg} OrderID: ${id} placed Successfully at $: ${markPrice} Price. Qty: ${quantity}`;

      const formattedSuccessMessage = await formatMessage(successMessage);
      await sendMessage(formattedSuccessMessage);
    } else {
      const formattedErrorMessage = await formatMessage(orderResponse.message);
      await sendMessage(formattedErrorMessage);
    }

    res.status(200).json({
      message: "TradingView Webhook received, & Trade executed successfully!",
      success: true,
      data: formattedMessage,
    });
  } catch (error: any) {
    logger.error("Error processing TradingView Webhook:", error);

    res.status(500).json({
      message: "Error processing TradingView Webhook",
      success: false,
      error: error.message,
    });
  }
};
