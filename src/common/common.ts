import axios from "axios";
import { configs } from "../configs";
import { OrderSideV5 } from "bybit-api";

export async function getSymbolInfo(symbolName: string) {
  try {
    const response = await axios.get("https://api.bybit.com/v2/public/symbols");
    const symbols = response.data.result;

    // Find the symbol with the matching name
    const symbol = symbols.find((s: any) => s.name === symbolName);
    if (symbol) {
      return {
        name: symbol.name,
        minOrderSize: symbol.lot_size_filter.min_trading_qty,
      };
    } else {
      throw new Error(`Symbol ${symbolName} not found.`);
    }
  } catch (error) {
    throw new Error("Error fetching symbol information:" + error);
  }
}

export function calculateTPSL(entryPrice: number, side: OrderSideV5) {
  const takeProfitPerc: number = parseFloat(configs.tpPercentage!);
  const stoplossPerc: number = parseFloat(configs.slPercentage!);

  // Adjust percentages based on side
  const adjustedTakeProfitPerc =
    side === "Buy" ? takeProfitPerc : -takeProfitPerc;
  const adjustedStopLossPerc = side === "Buy" ? -stoplossPerc : stoplossPerc;

  const takeProfit = (entryPrice * (1 + adjustedTakeProfitPerc)).toFixed(2);
  const stopLoss = (entryPrice * (1 + adjustedStopLossPerc)).toFixed(2);

  return { takeProfit, stopLoss };
}

export function countDecimalPlaces(value: number): number {
  const stringValue = value.toString();

  const decimalIndex = stringValue.indexOf(".");

  if (decimalIndex === -1) {
    return 0;
  }

  // Return the number of characters after the decimal point
  return stringValue.length - decimalIndex - 1;
}
