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
  // Extract relevant information from wallet balance object
  const totalWalletBalance = walletBalance.totalWalletBalance;
  const totalAvailableBalance = walletBalance.totalAvailableBalance;
  const coinBalances = walletBalance.coin.map((coin: any) => ({
    coin: coin.coin,
    balance: coin.walletBalance,
  }));

  // Construct the summarized message
  let summaryMessage = `🔹 Wallet Balance Summary 🔹\n\n`;
  summaryMessage += `Total Wallet Balance: $${totalWalletBalance}\n`;
  summaryMessage += `Available Balance: $${totalAvailableBalance}\n\n`;
  summaryMessage += `Coin Balances:\n`;
  coinBalances.forEach((coin: any) => {
    summaryMessage += `- ${coin.coin}: $${coin.balance}\n`;
  });

  return summaryMessage;
};
