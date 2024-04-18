import logger from "../utils/logger";
import { bybit } from "../bot";
import { CategoryV5, PositionInfoParamsV5, PositionV5 } from "bybit-api";

export async function getSize(symbol: string): Promise<PositionV5 | undefined> {
  try {
    if (!symbol) {
      throw new Error("Missing required parameters");
    }
    const category = "linear" as CategoryV5;

    const params: PositionInfoParamsV5 = {
      category,
      symbol,
    };

    const positionInfo = await bybit.getPositionInfo(params);

    const position = positionInfo?.list[0];

    if (position) {
      console.log({ position });
      return position;
    } else {
      return undefined;
    }
  } catch (error: any) {
    logger.error("Error getting position info", error);

    throw new Error("Error getting position info: " + error.message);
  }
}
