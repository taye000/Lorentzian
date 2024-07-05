import { Request, Response } from "express";
import logger from "../utils/logger";
import { bybit } from "../bot";
import { CancelOrderParamsV5, CategoryV5, OrderParamsV5 } from "bybit-api";

// place order function for the bot
export async function placeOrder(params: OrderParamsV5) {
  try {
    const orderPlaced: any = await bybit.submitOrder(params);
    if (orderPlaced.retCode === 0) {
      return {
        message: orderPlaced.retMsg,
        success: true,
        data: orderPlaced,
      };
    }
    if (orderPlaced.retCode === 10001) {
      return {
        message: "Request parameter error.",
        success: false,
        data: orderPlaced,
      };
    }
    if (orderPlaced.retCode === 110007) {
      return {
        message:
          "Error placing order: Insufficient balance. Please check your available funds.",
        success: false,
        data: orderPlaced,
      };
    }
    if (orderPlaced.retCode === 130070) {
      return {
        message:
          "Error placing order: Invalid order price. Please check the current market price and retry.",
        success: false,
        data: orderPlaced,
      };
    } else {
      return {
        message:
          orderPlaced.retMsg ||
          "Error placing order, please check your order parameters and try again.",
        success: false,
        data: orderPlaced,
      };
    }
  } catch (error: any) {
    logger.error("Error submitting order", error);

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
