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
      return `Copy ${count} refresh token(s) to the clipboard?`;
    }
    return `Save ${count} refresh token(s) to a file?`;
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
