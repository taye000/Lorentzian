import { Request, Response } from "express";
import { SetLeverageParamsV5 } from "bybit-api";
import logger from "../utils/logger";
import { bybit } from "../bot";

export async function setLeverageManually(req: Request, res: Response) {
  try {
    const { symbol, buyLeverage, sellLeverage } = req.query;

    const category = "linear";

    if (!symbol || buyLeverage || sellLeverage) {
      return res.status(400).json({
        message: "Missing required parameters",
        success: false,
      });
    }

    const params: SetLeverageParamsV5 = {
      category,
      symbol: symbol as string,
      buyLeverage: buyLeverage as string,
      sellLeverage: sellLeverage as string,
    };

    // Call the method to set leverage
    const data = await bybit.setLeverage(params);
    logger.info("Leverage set up" + data);

    res.status(200).json({
      message: "Leverage set successfully",
      success: true,
    });
  } catch (error: any) {
    logger.error("Error setting leverage", error);

    res.status(500).json({
      message: "Error setting leverage",
      success: false,
      error: error.message,
    });
  }
}

// set leverage by bot
export async function setLeverage(
  category: "linear" | "linear",
  symbol: string,
  buyLeverage: string,
  sellLeverage: string
) {
  try {
    const params: SetLeverageParamsV5 = {
      category,
      symbol,
      buyLeverage,
      sellLeverage,
    };

    // Call the method to set leverage
    const data = await bybit.setLeverage(params);
    logger.info("Leverage set" + data);

    return {
      message: "Leverage set successfully",
      success: true,
      data,
    };
  } catch (error: any) {
    logger.error("Error setting leverage", error);

    return {
      message: "Error setting leverage",
      success: false,
      error: error.message,
    };
  }
}
