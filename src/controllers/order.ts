import { Request, Response } from "express";
import logger from "../utils/logger";
import { bybit } from "../bot";
import {
  CancelAllOrdersParamsV5,
  CancelOrderParamsV5,
  CategoryV5,
  OrderParamsV5,
  OrderSideV5,
  OrderTypeV5,
} from "bybit-api";

// place order function for the bot
export async function placeOrder(params: OrderParamsV5) {
  try {
    const orderResponse = await bybit.submitOrder(params);

    // Return the result
    return {
      message: "Order submitted successfully",
      success: true,
      data: orderResponse,
    };
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
    logger.info("Order cancelled successfully", cancellationResult);

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

export async function cancelAllOrders(req: Request, res: Response) {
  try {
    const category = "linear";

    if (!category) {
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

    const params: CancelAllOrdersParamsV5 = {
      category: category as CategoryV5,
    };

    const cancellationResult = await bybit.cancelAllOrders(params);
    logger.info("All orders cancelled successfully", cancellationResult);

    res.status(200).json({
      message: "All orders cancelled successfully",
      success: true,
      data: cancellationResult,
    });
  } catch (error: any) {
    logger.error("Error cancelling all orders", error);

    res.status(500).json({
      message: "Error cancelling all orders",
      success: false,
      error: error.message,
    });
  }
}
