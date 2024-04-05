import { Request, Response } from "express";
import logger from "../utils/logger";
import { bybit } from "../bot";
import { CategoryV5, PositionInfoParamsV5 } from "bybit-api";

export async function getPositionInfo(req: Request, res: Response) {
  try {
    const { category } = req.query;
    logger.info("categoryy " + category);

    if (!category) {
      return res.status(400).json({
        message: "Missing required parameters",
        success: false,
      });
    }

    // Ensure category is of type CategoryV5
    const validCategories: CategoryV5[] = [
      "spot",
      "linear",
      "linear",
      "option",
    ];

    if (!validCategories.includes(category as CategoryV5)) {
      return res.status(400).json({
        message: "Invalid category",
        success: false,
      });
    }

    const params: PositionInfoParamsV5 = {
      category: category as CategoryV5,
    };

    const positionInfo = await bybit.getPositionInfo(params);
    logger.info("Position info retrieved successfully", positionInfo);

    res.status(200).json({
      message: "Position info retrieved successfully",
      success: true,
      data: positionInfo,
    });
  } catch (error: any) {
    logger.error("Error getting position info" + error);

    res.status(500).json({
      message: "Error getting position info",
      success: false,
      error: error.message,
    });
  }
}
