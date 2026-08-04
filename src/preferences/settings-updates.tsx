import { useCallback, useState } from "react";

import { Button } from "@/ui/primitives/button";
import { TabsContent } from "@/ui/primitives/tabs";

import { useToast } from "../feedback/toast";
import { commands } from "../platform/invoke";

interface SettingsUpdatesProps {
  currentVersion: string | null;
  onCheckForUpdates: () => void;
  updateBusy: boolean;
}

export function SettingsUpdates({
  currentVersion,
  updateBusy,
  onCheckForUpdates,
}: SettingsUpdatesProps) {
  const { notify } = useToast();
  const [tokenBusy, setTokenBusy] = useState(false);

  const checkTokens = useCallback(() => {
    setTokenBusy(true);
    commands
      .checkTokens()
      .then((rows) => {
        const ok = rows.filter((row) => row.status === "ok").length;
        const expired = rows.filter((row) => row.status === "expired").length;
        const missing = rows.filter((row) => row.status === "missing").length;
        const invalid = rows.filter((row) => row.status === "invalid").length;
        const parts = [`${ok} ok`];
        if (expired) {
          parts.push(`${expired} expired`);
        }
        if (missing) {
          parts.push(`${missing} missing`);
        }
        if (invalid) {
          parts.push(`${invalid} invalid`);
        }
        notify(
          parts.join(" · "),
          expired || missing || invalid ? "error" : "ok"
        );
      })
      .catch((cause) => {
        notify(String(cause), "error");
      })
      .finally(() => {
        setTokenBusy(false);
      });
  }, [notify]);

  return (
    <TabsContent
      className="mt-0 min-h-52 space-y-3 outline-none"
      value="updates"
    >
      <div className="flex items-center justify-between gap-3 py-2">
        <div>
          <div className="font-medium text-sm">Version</div>
          <div className="mt-0.5 font-mono text-muted-foreground text-xs tabular-nums">
            {currentVersion ?? "Unknown"}
          </div>
        </div>
        <Button
          disabled={updateBusy}
          onClick={onCheckForUpdates}
          size="sm"
          variant="outline"
        >
          {updateBusy ? "Updating…" : "Check for updates"}
        </Button>
      </div>
      <div className="flex items-center justify-between gap-3 border-border border-t pt-3">
        <div>
          <div className="font-medium text-sm">Token health</div>
          <p className="mt-1 text-pretty text-muted-foreground text-xs leading-snug">
            Decrypt and check refresh tokens without signing in.
          </p>
        </div>
        <Button
          disabled={tokenBusy}
          onClick={checkTokens}
          size="sm"
          variant="outline"
        >
          {tokenBusy ? "Checking…" : "Check tokens"}
        </Button>
      </div>
      <p className="text-muted-foreground text-xs">
        {
          "Global hotkeys: Ctrl+Shift+R show/hide · Ctrl+Shift+L sign in last used. Deep link: roster://signin/<steamid>"
        }
      </p>
    </TabsContent>
  );
}
