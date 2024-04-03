import { Request, Response } from "express";
import { sendMessage } from "../bot";
import logger from "../utils/logger";
import { formatMessage } from "../utils";
import { placeOrder } from "./order";
import { getWalletBalance } from "./walletBalance";
import { configs } from "../configs";
import { AccountTypeV5, OrderSideV5, OrderResultV5 } from "bybit-api";
import { getSymbolInfo } from "../common";

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

    // Send the message to Telegram
    sendMessage(formattedMessage);

    const { minOrderSize, name } = await getSymbolInfo(req.body.ticker);
    logger.info("minOrderSize: " + minOrderSize + " name: " + name);

    let account_type: AccountTypeV5 = configs.accountType as AccountTypeV5;

    // Retrieve wallet balance
    const { data, success, error } = await getWalletBalance(
      account_type,
      configs.coin
    );
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

    const orderSize: number = parseFloat(availableToWithdraw) * orderSizePercentage;
    logger.info("Order size: " + orderSize);

    // Get the close price from the TradingView webhook
    const closePrice: number = req.body.close;

    // Calculate quantity
    const qty: number = orderSize / closePrice;
    logger.info("Quantity: " + qty);

    const side: OrderSideV5 = req.body.action as OrderSideV5;
    logger.info("Side: " + side);

    // Submit order for short position
    const orderResponse = await placeOrder(
      "inverse",
      req.body.ticker,
      side,
      "Market",
      qty.toString()
    );
    console.log("order response " + orderResponse)

    // Check the retCode in the response
    if (orderResponse.data?.retCode === 0) {
      // Order placed successfully
      const orderId = orderResponse.data?.result.orderId;
      const message = `Order placed successfully. Order ID: ${orderId}`;
      formattedMessage = await formatMessage(message);
      sendMessage(formattedMessage);
      logger.info(formattedMessage);
    } else {
      // Failed to place order
      const errorMessage = `Failed to place order. Error: ${orderResponse.error}`;
      formattedMessage = await formatMessage(errorMessage);
      sendMessage(formattedMessage);
      logger.error(formattedMessage);
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
