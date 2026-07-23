import { useCallback } from "react";

import { useToast } from "../feedback/toast";
import { commands } from "../platform/invoke";
import type { AccountView } from "../roster/account";

/** True when a non-expired JWT is present (unknown expiry still counts). */
export function isExportable(account: AccountView): boolean {
  return account.has_token && account.jwt_expires_in >= 0;
}

export function useExport() {
  const { notify } = useToast();

  const exportCountFor = useCallback(
    (accounts: AccountView[], steamids: string[]) => {
      const byId = new Map(
        accounts.map((account) => [account.steamid, account])
      );
      return steamids.filter((steamid) => {
        const account = byId.get(steamid);
        return account ? isExportable(account) : false;
      }).length;
    },
    []
  );

  const copyExport = useCallback(
    async (steamids: string[]) => {
      try {
        const lines = await commands.exportTokenEntries(steamids);
        if (!lines.length) {
          notify("No tokens to export", "error");
          return;
        }
        await commands.writeClipboard(lines.join("\n"));
        const skipped = steamids.length - lines.length;
        notify(
          skipped
            ? `Copied ${lines.length} · ${skipped} missing`
            : `Copied ${lines.length}`
        );
      } catch (cause) {
        notify(String(cause), "error");
      }
    },
    [notify]
  );

  const exportFile = useCallback(
    async (steamids: string[]) => {
      try {
        const lines = await commands.exportTokenEntries(steamids);
        if (!lines.length) {
          notify("No tokens to export", "error");
          return;
        }
        const blob = new Blob([`${lines.join("\n")}\n`], {
          type: "text/plain",
        });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = "tokens.txt";
        anchor.click();
        URL.revokeObjectURL(url);
        notify(`Exported ${lines.length}`);
      } catch (cause) {
        notify(String(cause), "error");
      }
    },
    [notify]
  );

  const copyUsername = useCallback(
    async (account: AccountView) => {
      if (!account.account_name) {
        return;
      }
      try {
        await commands.writeClipboard(account.account_name);
        notify("Copied");
      } catch (cause) {
        notify(String(cause), "error");
      }
    },
    [notify]
  );

  const copySteamId = useCallback(
    async (account: AccountView) => {
      if (!account.steamid) {
        return;
      }
      try {
        await commands.writeClipboard(account.steamid);
        notify("Copied SteamID");
      } catch (cause) {
        notify(String(cause), "error");
      }
    },
    [notify]
  );

  return {
    copyExport,
    copySteamId,
    copyUsername,
    exportCountFor,
    exportFile,
  };
}
