import { useCallback, useState } from "react";

import { ImportSignInAsk } from "@/intake/import-sign-in-ask";
import { useImport } from "@/intake/use-intake";
import type { ImportWithoutSignIn } from "@/preferences/preferences";
import { ClipboardPasteIcon } from "@/ui/icons/clipboard-paste";
import { IconAction } from "@/ui/widgets/icon-action";

import {
  dismissClipboardToken,
  useClipboardToken,
} from "./use-clipboard-token";

interface ClipboardImportButtonProps {
  importWithoutSignIn: ImportWithoutSignIn;
}

/// Top-bar action shown only while the clipboard holds an importable token.
export function ClipboardImportButton({
  importWithoutSignIn,
}: ClipboardImportButtonProps) {
  const token = useClipboardToken();
  const { busy, importText } = useImport();
  const [pendingAsk, setPendingAsk] = useState<string | null>(null);

  const run = useCallback(
    (payload: string, withoutSignIn: boolean) => {
      importText(payload, withoutSignIn)
        .then((ok) => {
          if (ok) {
            dismissClipboardToken(payload);
          }
        })
        .catch(() => undefined);
    },
    [importText]
  );

  const handleClick = useCallback(() => {
    if (!token) {
      return;
    }
    if (importWithoutSignIn === "ask") {
      setPendingAsk(token);
      return;
    }
    run(token, importWithoutSignIn === "on");
  }, [importWithoutSignIn, run, token]);

  const cancelAsk = useCallback(() => {
    setPendingAsk(null);
  }, []);

  const signIn = useCallback(() => {
    const payload = pendingAsk;
    setPendingAsk(null);
    if (payload) {
      run(payload, false);
    }
  }, [pendingAsk, run]);

  const storeOnly = useCallback(() => {
    const payload = pendingAsk;
    setPendingAsk(null);
    if (payload) {
      run(payload, true);
    }
  }, [pendingAsk, run]);

  return (
    <>
      {token ? (
        <IconAction
          disabled={busy}
          icon={<ClipboardPasteIcon />}
          label="Import token from clipboard"
          onClick={handleClick}
          size="sm"
          variant="secondary"
        >
          Import
        </IconAction>
      ) : null}
      <ImportSignInAsk
        onCancel={cancelAsk}
        onSignIn={signIn}
        onStoreOnly={storeOnly}
        open={pendingAsk !== null}
      />
    </>
  );
}
