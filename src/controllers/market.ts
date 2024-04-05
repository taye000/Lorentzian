import { bybit } from "../bot";
import logger from "../utils/logger";
import { CategoryV5, GetInstrumentsInfoParamsV5 } from "bybit-api";

// Function to get instruments info
export async function getInstruments(symbol: string) {
  try {
    const params: GetInstrumentsInfoParamsV5 = {
      category: "linear" as CategoryV5,
      symbol: symbol as string,
    };

    const instrumentsInfo = await bybit.getInstrumentsInfo(params);

    return instrumentsInfo;
  } catch (error: any) {
    logger.error("Error getting instruments info", error);
    throw new Error("Error getting instruments info: " + error.message);
  }
}
