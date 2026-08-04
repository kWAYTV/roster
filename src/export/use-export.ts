import { useCallback, useState } from "react";

import { notify } from "../feedback/status";
import { saveTextFile } from "../platform/files";
import { commands } from "../platform/invoke";
import type { AccountView } from "../roster/account";
import type { PendingExport } from "./pending-export";

/** True when a non-expired JWT is present (unknown expiry still counts). */
export function isExportable(account: AccountView): boolean {
  return account.has_token && account.jwt_expires_in >= 0;
}

export function useExport(requireConfirm: boolean) {
  const [pendingExport, setPendingExport] = useState<PendingExport>(null);

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

  const runCopy = useCallback(async (steamids: string[]) => {
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
  }, []);

  const runFile = useCallback(async (steamids: string[]) => {
    try {
      const lines = await commands.exportTokenEntries(steamids);
      if (!lines.length) {
        notify("No tokens to export", "error");
        return;
      }
      const saved = await saveTextFile({
        contents: `${lines.join("\n")}\n`,
        defaultPath: "tokens.txt",
        filters: [{ extensions: ["txt"], name: "Text" }],
        title: "Export tokens",
      });
      if (!saved) {
        return;
      }
      notify(`Exported ${lines.length}`);
    } catch (cause) {
      notify(String(cause), "error");
    }
  }, []);

  const copyExport = useCallback(
    async (steamids: string[]) => {
      if (requireConfirm) {
        setPendingExport({ kind: "copy", steamids });
        return;
      }
      await runCopy(steamids);
    },
    [requireConfirm, runCopy]
  );

  const exportFile = useCallback(
    async (steamids: string[]) => {
      if (requireConfirm) {
        setPendingExport({ kind: "file", steamids });
        return;
      }
      await runFile(steamids);
    },
    [requireConfirm, runFile]
  );

  const confirmExport = useCallback(async () => {
    if (!pendingExport) {
      return;
    }
    const next = pendingExport;
    setPendingExport(null);
    if (next.kind === "copy") {
      await runCopy(next.steamids);
      return;
    }
    await runFile(next.steamids);
  }, [pendingExport, runCopy, runFile]);

  const cancelExport = useCallback(() => {
    setPendingExport(null);
  }, []);

  const copyUsername = useCallback(async (account: AccountView) => {
    if (!account.account_name) {
      return;
    }
    try {
      await commands.writeClipboard(account.account_name);
      notify("Copied");
    } catch (cause) {
      notify(String(cause), "error");
    }
  }, []);

  const copySteamId = useCallback(async (account: AccountView) => {
    if (!account.steamid) {
      return;
    }
    try {
      await commands.writeClipboard(account.steamid);
      notify("Copied SteamID");
    } catch (cause) {
      notify(String(cause), "error");
    }
  }, []);

  return {
    cancelExport,
    confirmExport,
    copyExport,
    copySteamId,
    copyUsername,
    exportCountFor,
    exportFile,
    pendingExport,
  };
}
