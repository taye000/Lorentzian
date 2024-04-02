import axios from "axios";

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
