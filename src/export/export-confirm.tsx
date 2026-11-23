import { useMemo } from "react";

import { ConfirmDialog } from "../feedback/confirm-dialog";
import type { PendingExport } from "./pending-export";

interface ExportConfirmProps {
  onCancel: () => void;
  onConfirm: () => void;
  pending: PendingExport;
}

export function ExportConfirm({
  pending,
  onConfirm,
  onCancel,
}: ExportConfirmProps) {
  const message = useMemo(() => {
    if (!pending) {
      return "";
    }
    const count = pending.steamids.length;
    if (pending.kind === "copy") {
      return count === 1
        ? "Copy this refresh token to the clipboard? It clears after 30 seconds"
        : `Copy ${count} refresh tokens to the clipboard? They clear after 30 seconds`;
    }
    return count === 1
      ? "Save this refresh token to a text file?"
      : `Save ${count} refresh tokens to a text file?`;
  }, [pending]);

  return (
    <ConfirmDialog
      confirmLabel={pending?.kind === "file" ? "Save" : "Copy"}
      danger
      message={message}
      onClose={onCancel}
      onConfirm={onConfirm}
      open={pending !== null}
      title="Export tokens"
    />
  );
}
