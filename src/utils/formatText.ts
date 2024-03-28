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
  