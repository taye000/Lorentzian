import logger from "../utils/logger";
import { bybit } from "../bot";
import { CategoryV5, PositionInfoParamsV5 } from "bybit-api";

export async function getSize(symbol: string): Promise<number> {
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

    const positions = positionInfo?.list;

    let totalSize = 0;

    // Calculate the total size of positions
    if (positions && positions.length > 0) {
      for (const position of positions) {
        const size = parseFloat(position.size);
        if (!isNaN(size)) {
          totalSize += size;
        }
      }
    }

    return totalSize;
  } catch (error: any) {
    logger.error("Error getting position info", error);

    throw new Error("Error getting position info: " + error.message);
  }
}
