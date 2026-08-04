import { useCallback, useState } from "react";

import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/ui/primitives/dialog";
import { Separator } from "@/ui/primitives/separator";
import { ImportBulk } from "./import-bulk";
import { looksLikeBulk, seedFields } from "./import-seed";
import { ImportSingle } from "./import-single";
import { useClassifyImport } from "./use-classify-import";
import { useImport } from "./use-intake";

const TEXT_FILE = /\.(txt|csv|log|jwt)$/i;

interface ImportDialogProps {
  onClose: () => void;
  open: boolean;
  /** Text to preload when the dialog opens (e.g. clipboard from the tray). */
  prefill?: string;
}

/// Remounted by the shell when opened; state is initialized from `prefill`.
export function ImportDialog({ open, prefill, onClose }: ImportDialogProps) {
  const { importText, paste, busy } = useImport();
  const seeded = seedFields(prefill);
  const [single, setSingle] = useState(seeded.single);
  const [bulk, setBulk] = useState(seeded.bulk);
  const [dragging, setDragging] = useState(false);
  const singleClassified = useClassifyImport(single, open);
  const bulkClassified = useClassifyImport(bulk, open);

  const submit = useCallback(
    async (payload: string) => {
      const text = payload.trim();
      if (!text) {
        return;
      }
      if (await importText(text)) {
        onClose();
      }
    },
    [importText, onClose]
  );

  const pasteInto = useCallback(
    async (target: "single" | "bulk") => {
      const text = (await paste()).trim();
      if (!text) {
        return;
      }
      if (target !== "bulk" && !looksLikeBulk(text)) {
        setSingle(text);
        return;
      }
      setBulk(text);
      if (target === "single") {
        setSingle("");
      }
    },
    [paste]
  );

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (!next) {
        onClose();
      }
    },
    [onClose]
  );

  const pasteSingle = useCallback(() => {
    pasteInto("single").catch(() => undefined);
  }, [pasteInto]);

  const pasteBulk = useCallback(() => {
    pasteInto("bulk").catch(() => undefined);
  }, [pasteInto]);

  const submitSingle = useCallback(() => {
    submit(single).catch(() => undefined);
  }, [submit, single]);

  const submitBulk = useCallback(() => {
    submit(bulk).catch(() => undefined);
  }, [submit, bulk]);

  const applyDroppedText = useCallback((text: string) => {
    const next = text.trim();
    if (!next) {
      return;
    }
    if (looksLikeBulk(next)) {
      setBulk(next);
      setSingle("");
      return;
    }
    setSingle(next);
  }, []);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setDragging(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setDragging(false);
  }, []);

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      setDragging(false);
      const file = [...event.dataTransfer.files].find(
        (item) => TEXT_FILE.test(item.name) || item.type.startsWith("text/")
      );
      if (!file) {
        const text = event.dataTransfer.getData("text/plain").trim();
        if (!text) {
          return;
        }
        applyDroppedText(text);
        return;
      }
      file
        .text()
        .then(applyDroppedText)
        .catch(() => undefined);
    },
    [applyDroppedText]
  );

  return (
    <Dialog onOpenChange={handleOpenChange} open={open}>
      <DialogContent
        className={dragging ? "ring-2 ring-primary/40" : undefined}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <DialogHeader>
          <DialogTitle>Import</DialogTitle>
          <DialogDescription>
            Paste one token, a list, or drop a .txt file. Expired tokens are
            skipped.
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="gap-4">
          <ImportSingle
            busy={busy}
            classified={singleClassified}
            onChange={setSingle}
            onPaste={pasteSingle}
            onSubmit={submitSingle}
            value={single}
          />

          <Separator />

          <ImportBulk
            busy={busy}
            classified={bulkClassified}
            onChange={setBulk}
            onPaste={pasteBulk}
            onSubmit={submitBulk}
            value={bulk}
          />
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
