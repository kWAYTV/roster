import { commands } from "./invoke";

export const CLIPBOARD_CLEAR_MS = 30_000;

let expected = "";
let timer = 0;

/// Write clipboard text and wipe it later if it is still what we put there.
export async function writeClipboard(
  text: string,
  autoClear = true
): Promise<void> {
  await commands.writeClipboard(text);
  if (autoClear) {
    scheduleClipboardClear(text);
  }
}

export function scheduleClipboardClear(text: string): void {
  expected = text;
  window.clearTimeout(timer);
  timer = window.setTimeout(() => {
    const snapshot = expected;
    commands
      .readClipboard()
      .then((current) => {
        if (current === snapshot) {
          return commands.writeClipboard("");
        }
      })
      .catch(() => undefined);
  }, CLIPBOARD_CLEAR_MS);
}
