/**
 * Copies the given URL to the clipboard using the provided clipboard writer function.
 *
 * @param url The URL string to copy.
 * @param clipboardFn The injectable clipboard function (defaults to navigator.clipboard.writeText if available).
 */
export async function copyToClipboard(
  url: string,
  clipboardFn: (text: string) => Promise<void> = async (text) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(text);
    } else {
      throw new Error("Clipboard API is not available");
    }
  }
): Promise<void> {
  try {
    await clipboardFn(url);
  } catch (error) {
    // Catch the error and reject the promise cleanly without throwing synchronously
    return Promise.reject(error);
  }
}
