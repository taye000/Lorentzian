import { Request, Response } from "express";
import { sendMessage } from "../bot";
import logger from "../utils/logger";
import { formatMessage } from "../utils";
import { submitOrder } from "./order";
import { getWalletBalance } from "./walletBalance";
import { configs } from "../configs";

export const tradingviewWebHook = async (req: Request, res: Response) => {
  try {
    logger.info("TradingView Webhook testing...");
    console.log("Request bod:", req.body);
    logger.info("Request body:", req.body);

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

    logger.info("Formatted message:", formattedMessage);

    // Send the message to Telegram
    sendMessage(formattedMessage);

    // Retrieve wallet balance
    const { data, success, error } = await getWalletBalance("CONTRACT", "USDT");
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
    // const orderSizePercentage = configs.buyPercentage;
    // logger.info({ orderSizePercentage });

    // const orderSize = balance * orderSizePercentage;
    // logger.debug("Order size:", orderSize);

    // Get the close price from the TradingView webhook
    // const closePrice = req.body.close;

    // Calculate quantity
    // const qty = orderSize / closePrice;
    // logger.debug("Quantity:", qty);

    // const side = req.body.action;
    // Submit order
    // await submitOrder(req, res, {
    //   category: "linear",
    //   symbol: req.body.ticker,
    //   side: side,
    //   orderType: "Market",
    //   qty: qty.toString(),
    // });

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
