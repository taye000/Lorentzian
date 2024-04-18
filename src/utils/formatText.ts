export const formatMessage = async (message: string | undefined) => {
  console.log({ message });
  if (typeof message !== "string") {
    return "An error occurred while formatting the message.";
  }
  return message
    .replaceAll("_", "\\_")
    .replaceAll("|", "\\|")
    .replaceAll(".", "\\.")
    .replaceAll("{", "\\{")
    .replaceAll("}", "\\}")
    .replaceAll("=", "\\=")
    .replaceAll("+", "\\+")
    .replaceAll(">", "\\>")
    .replaceAll("<", "\\<")
    .replaceAll("-", "\\-")
    .replaceAll("!", "\\!")
    .replaceAll("$", "\\$")
    .replaceAll("*", "\\*")
    .replaceAll("(", "\\(")
    .replaceAll(")", "\\)");
};

// Function to format and summarize the wallet balance
export const formatWalletBalance = (walletBalance: any) => {
  try {
    // Extract relevant information from wallet balance object
    const {
      coin,
      availableToWithdraw,
      equity,
      walletBalance: totalWalletBalance,
      cumRealisedPnl,
      unrealisedPnl,
    } = walletBalance[0];

    // Construct the summarized message
    let summaryMessage = `🔹 Wallet Balance Summary 🔹\n\n`;
    summaryMessage += `Total Wallet Balance: $${totalWalletBalance}\n`;
    summaryMessage += `Available to Withdraw: $${availableToWithdraw}\n`;
    summaryMessage += `Equity: $${equity}\n`;
    summaryMessage += `Cumulative Realised PnL: $${cumRealisedPnl}\n`;
    summaryMessage += `Unrealised PnL: $${unrealisedPnl}\n\n`;

    // Check if coin is a string (not an array)
    if (typeof coin === "string") {
      summaryMessage += `- ${coin}: $${totalWalletBalance}\n`;
    } else {
      // Loop through each coin balance
      coin.forEach((coinBalance: any) => {
        summaryMessage += `- ${coinBalance.coin}: $${coinBalance.walletBalance}\n`;
      });
    }

    return summaryMessage;
  } catch (error) {
    console.error("Error formatting wallet balance:", error);
    return "Error formatting wallet balance";
  }
};

export const formatPositionInfo = (positionInfo: any) => {
  if (positionInfo.length === 0) {
    return "No open positions";
  }

  const formattedPositions = positionInfo.map((position: any) => {
    return `
Position Index: ${position.positionIdx}
Symbol: ${position.symbol}
Side: ${position.side}
Size: ${position.size}
Average Price: ${position.avgPrice}
Position Value: ${position.positionValue}
Leverage: ${position.leverage}
Mark Price: ${position.markPrice}
Liq Price: ${position.liqPrice}
Take Profit: ${position.takeProfit}
Stop Loss: ${position.stopLoss}
Unrealised PnL: ${position.unrealisedPnl}
Cumulative Realised PnL: ${position.cumRealisedPnl}
Position Status: ${position.positionStatus}
    `;
  });

  return formattedPositions.join("\n");
};
