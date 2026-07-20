import { useCallback, useEffect, useState } from "react";

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
import { commands } from "../platform/invoke";
import { useImport } from "./use-intake";

const LINE_SPLIT = /\r?\n/;

interface ImportDialogProps {
  onClose: () => void;
  open: boolean;
  /** Text to preload when the dialog opens (e.g. clipboard from the tray). */
  prefill?: string;
}

export function ImportDialog({ open, prefill, onClose }: ImportDialogProps) {
  const { importText, paste, busy } = useImport();
  const [single, setSingle] = useState("");
  const [bulk, setBulk] = useState("");
  const [singleHint, setSingleHint] = useState("");
  const [bulkHint, setBulkHint] = useState("");
  const [singleCount, setSingleCount] = useState(0);
  const [bulkCount, setBulkCount] = useState(0);

  useEffect(() => {
    if (!open) {
      setSingle("");
      setBulk("");
      setSingleHint("");
      setBulkHint("");
      setSingleCount(0);
      setBulkCount(0);
      return;
    }
    const next = prefill?.trim() ?? "";
    if (!next) {
      return;
    }
    if (looksLikeBulk(next)) {
      setBulk(next);
      setSingle("");
    } else {
      setSingle(next);
      setBulk("");
    }
  }, [open, prefill]);

  useEffect(() => {
    if (!open) {
      return;
    }
    return classifyField(single, (count, hint) => {
      setSingleCount(count);
      setSingleHint(hint);
    });
  }, [open, single]);

  useEffect(() => {
    if (!open) {
      return;
    }
    return classifyField(bulk, (count, hint) => {
      setBulkCount(count);
      setBulkHint(hint);
    });
  }, [open, bulk]);

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
      if (target === "bulk" || looksLikeBulk(text)) {
        setBulk(text);
        if (target === "single") {
          setSingle("");
        }
        return;
      }
      setSingle(text);
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
      if (event.key === "Enter") {
        event.preventDefault();
        if (singleCount > 0) {
          submit(single).catch(() => undefined);
        }
      }
    },
    [singleCount, submit, single]
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

  return (
    <Dialog onOpenChange={handleOpenChange} open={open}>
      <DialogContent className="gap-4 p-5 sm:max-w-md" showCloseButton>
        <DialogHeader className="pr-8">
          <DialogTitle>Import</DialogTitle>
          <DialogDescription>
            Paste one token, or a list. Expired tokens are skipped.
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
          {singleHint ? (
            <p className="text-muted-foreground text-xs">{singleHint}</p>
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
              disabled={busy || singleCount === 0}
              onClick={submitSingle}
              size="sm"
            >
              {importLabel(busy, singleCount)}
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
          {bulkHint ? (
            <p className="text-muted-foreground text-xs">{bulkHint}</p>
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
              disabled={busy || bulkCount === 0}
              onClick={submitBulk}
              size="sm"
            >
              {importLabel(busy, bulkCount)}
            </Button>
          </div>
        </section>
      </DialogContent>
    </Dialog>
  );
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

function noopCleanup(): void {
  // Empty cleanup when there is nothing to cancel.
}

function classifyField(
  value: string,
  apply: (count: number, hint: string) => void
): () => void {
  const payload = value.trim();
  if (!payload) {
    apply(0, "");
    return noopCleanup;
  }

  let active = true;
  const timer = window.setTimeout(() => {
    commands
      .classifyImport(payload)
      .then((result) => {
        if (!active) {
          return;
        }
        apply(
          result.importable.length,
          hintFor(result.importable.length, result.expired.length)
        );
      })
      .catch(() => {
        if (active) {
          apply(0, "");
        }
      });
  }, 250);

  return () => {
    active = false;
    window.clearTimeout(timer);
  };
}

function hintFor(importable: number, expired: number): string {
  if (importable && expired) {
    return `${importable} importable · ${expired} expired (skipped)`;
  }
  if (expired) {
    return `${expired} expired — nothing to import`;
  }
  if (!importable) {
    return "No valid tokens found";
  }
  return "";
}
