export const formatMessage = async (message: string | undefined) => {
  if (typeof message !== "string") {
    return "";
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
    if (typeof coin === 'string') {
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
  // Example: Assuming positionInfo is an object with properties like size, entryPrice, etc.
  return `Position Info:\nSize: ${positionInfo.size}\nEntry Price: ${positionInfo.entryPrice}\n...`;
};
