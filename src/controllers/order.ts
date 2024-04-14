import { Request, Response } from "express";
import logger from "../utils/logger";
import { bybit } from "../bot";
import { CancelOrderParamsV5, CategoryV5, OrderParamsV5 } from "bybit-api";

// place order function for the bot
export async function placeOrder(params: OrderParamsV5) {
  try {
    const orderPlaced: any = await bybit.submitOrder(params);
    // Check if the order was successfully placed
    if (orderPlaced.retcode === 0) {
      // Return success response
      return {
        message: orderPlaced.retMsg,
        success: true,
        data: orderPlaced,
      };
    } else {
      // Return failure response
      return {
        message: orderPlaced.retMsg,
        success: false,
        data: orderPlaced,
      };
    }
  } catch (error: any) {
    logger.error("Error submitting order", error);

    // Return failure response for any errors during order submission
    return {
      message: "Error submitting order",
      success: false,
      error: error.message,
    };
  }
}

export async function cancelOrder(req: Request, res: Response) {
  try {
    const { symbol } = req.query;

    const category = "linear";

    if (!symbol) {
      return res.status(400).json({
        message: "Missing required parameters",
        success: false,
      });
    }

    // Ensure accountType is of type AccountTypeV5
    let validCategories: CategoryV5[] = ["spot", "linear", "linear", "option"];

    if (!validCategories.includes(category as CategoryV5)) {
      return res.status(400).json({
        message: "Invalid accountType",
        success: false,
      });
    }

    const params: CancelOrderParamsV5 = {
      category: category as CategoryV5,
      symbol: symbol as string,
    };

    const cancellationResult = await bybit.cancelOrder(params);

    res.status(200).json({
      message: "Order cancelled successfully",
      success: true,
      data: cancellationResult,
    });
  } catch (error: any) {
    logger.error("Error cancelling order", error);

    res.status(500).json({
      message: "Error cancelling order",
      success: false,
      error: error.message,
    });
  }
}
