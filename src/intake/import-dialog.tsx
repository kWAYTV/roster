import { useCallback, useState } from "react";

import { Button } from "@/ui/primitives/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/ui/primitives/dialog";
import { Input } from "@/ui/primitives/input";
import { Separator } from "@/ui/primitives/separator";
import { Textarea } from "@/ui/primitives/textarea";
import { useClassifyImport } from "./use-classify-import";
import { useImport } from "./use-intake";

const LINE_SPLIT = /\r?\n/;
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

  const handleSingleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setSingle(event.target.value);
    },
    []
  );

  const handleSingleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key !== "Enter") {
        return;
      }
      event.preventDefault();
      if (singleClassified.count === 0) {
        return;
      }
      submit(single).catch(() => undefined);
    },
    [singleClassified.count, submit, single]
  );

  const handleBulkChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      setBulk(event.target.value);
    },
    []
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
        className={`gap-4 p-5 sm:max-w-md ${dragging ? "ring-2 ring-primary/50" : ""}`}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        showCloseButton
      >
        <DialogHeader className="pr-8">
          <DialogTitle>Import</DialogTitle>
          <DialogDescription>
            Paste one token, a list, or drop a .txt file. Expired tokens are
            skipped.
          </DialogDescription>
        </DialogHeader>

        <section className="flex flex-col gap-2">
          <div className="font-medium text-sm">Single account</div>
          <Input
            autoFocus
            disabled={busy}
            onChange={handleSingleChange}
            onKeyDown={handleSingleKeyDown}
            placeholder="steamid----token or bare JWT"
            spellCheck={false}
            value={single}
          />
          {singleClassified.hint ? (
            <p className="text-muted-foreground text-xs">
              {singleClassified.hint}
            </p>
          ) : null}
          <div className="flex justify-end gap-2">
            <Button
              disabled={busy}
              onClick={pasteSingle}
              size="sm"
              variant="outline"
            >
              Paste
            </Button>
            <Button
              disabled={busy || singleClassified.count === 0}
              onClick={submitSingle}
              size="sm"
            >
              {importLabel(busy, singleClassified.count)}
            </Button>
          </div>
        </section>

        <Separator />

        <section className="flex flex-col gap-2">
          <div className="font-medium text-sm">Multiple accounts</div>
          <Textarea
            className="min-h-28 font-mono text-xs"
            disabled={busy}
            onChange={handleBulkChange}
            placeholder={"steamid----token\none account per line"}
            spellCheck={false}
            value={bulk}
          />
          {bulkClassified.hint ? (
            <p className="text-muted-foreground text-xs">
              {bulkClassified.hint}
            </p>
          ) : null}
          <div className="flex justify-end gap-2">
            <Button
              disabled={busy}
              onClick={pasteBulk}
              size="sm"
              variant="outline"
            >
              Paste
            </Button>
            <Button
              disabled={busy || bulkClassified.count === 0}
              onClick={submitBulk}
              size="sm"
            >
              {importLabel(busy, bulkClassified.count)}
            </Button>
          </div>
        </section>
      </DialogContent>
    </Dialog>
  );
}

function seedFields(prefill: string | undefined): {
  bulk: string;
  single: string;
} {
  const next = typeof prefill === "string" ? prefill.trim() : "";
  if (!next) {
    return { bulk: "", single: "" };
  }
  if (looksLikeBulk(next)) {
    return { bulk: next, single: "" };
  }
  return { bulk: "", single: next };
}

function importLabel(busy: boolean, count: number): string {
  if (busy) {
    return "Importing…";
  }
  if (count > 0) {
    return `Import ${count}`;
  }
  return "Import";
}

function looksLikeBulk(text: string): boolean {
  return text.split(LINE_SPLIT).filter((line) => line.trim()).length > 1;
}
