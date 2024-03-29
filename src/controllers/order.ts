import { Request, Response } from "express";
import logger from "../utils/logger";
import { bybit } from "../bot";
import { CategoryV5, OrderParamsV5, OrderSideV5, OrderTypeV5 } from "bybit-api";

export async function submitOrder(req: Request, res: Response) {
  try {
    const { category, symbol, side, orderType, qty } = req.body;

    if (!category || !symbol || !side || !orderType || !qty) {
      return res.status(400).json({
        message: "Missing required parameters",
        success: false,
      });
    }

    // Ensure accountType is of type AccountTypeV5
    let validCategories: CategoryV5[] = ["spot", "linear", "inverse", "option"];

    if (!validCategories.includes(category as CategoryV5)) {
      return res.status(400).json({
        message: "Invalid accountType",
        success: false,
      });
    }

    const params: OrderParamsV5 = {
      category: category as CategoryV5,
      symbol: symbol as string,
      side: side as OrderSideV5,
      orderType: orderType as OrderTypeV5,
      qty: qty as string,
    };

    const order = await bybit.submitOrder(params);
    logger.info("Order submitted successfully", order);

    res.status(200).json({
      message: "Order submitted successfully",
      success: true,
      data: order,
    });
  } catch (error: any) {
    logger.error("Error submitting order", error);

    res.status(500).json({
      message: "Error submitting order",
      success: false,
      error: error.message,
    });
  }
}
