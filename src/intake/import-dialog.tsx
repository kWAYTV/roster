import { useEffect, useState } from "react";

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

interface ImportDialogProps {
  open: boolean;
  /** Text to preload when the dialog opens (e.g. clipboard from the tray). */
  prefill?: string;
  onClose: () => void;
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

  const submit = async (payload: string) => {
    const text = payload.trim();
    if (!text) {
      return;
    }
    if (await importText(text)) {
      onClose();
    }
  };

  const pasteInto = async (target: "single" | "bulk") => {
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
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="gap-4 p-5 sm:max-w-md" showCloseButton>
        <DialogHeader className="pr-8">
          <DialogTitle>Import</DialogTitle>
          <DialogDescription>
            Paste one token, or a list. Expired tokens are skipped.
          </DialogDescription>
        </DialogHeader>

        <section className="flex flex-col gap-2">
          <div className="text-sm font-medium">Single account</div>
          <Input
            spellCheck={false}
            placeholder="steamid----token or bare JWT"
            value={single}
            autoFocus
            disabled={busy}
            onChange={(event) => setSingle(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                if (singleCount > 0) {
                  void submit(single);
                }
              }
            }}
          />
          {singleHint ? <p className="text-xs text-muted-foreground">{singleHint}</p> : null}
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={busy}
              onClick={() => void pasteInto("single")}
            >
              Paste
            </Button>
            <Button
              size="sm"
              disabled={busy || singleCount === 0}
              onClick={() => void submit(single)}
            >
              {busy ? "Importing…" : singleCount > 0 ? `Import ${singleCount}` : "Import"}
            </Button>
          </div>
        </section>

        <Separator />

        <section className="flex flex-col gap-2">
          <div className="text-sm font-medium">Multiple accounts</div>
          <Textarea
            spellCheck={false}
            className="min-h-28 font-mono text-xs"
            placeholder={"steamid----token\none account per line"}
            value={bulk}
            disabled={busy}
            onChange={(event) => setBulk(event.target.value)}
          />
          {bulkHint ? <p className="text-xs text-muted-foreground">{bulkHint}</p> : null}
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={busy}
              onClick={() => void pasteInto("bulk")}
            >
              Paste
            </Button>
            <Button
              size="sm"
              disabled={busy || bulkCount === 0}
              onClick={() => void submit(bulk)}
            >
              {busy ? "Importing…" : bulkCount > 0 ? `Import ${bulkCount}` : "Import"}
            </Button>
          </div>
        </section>
      </DialogContent>
    </Dialog>
  );
}

function looksLikeBulk(text: string): boolean {
  return text.split(/\r?\n/).filter((line) => line.trim()).length > 1;
}

function classifyField(
  value: string,
  apply: (count: number, hint: string) => void,
): () => void {
  const payload = value.trim();
  if (!payload) {
    apply(0, "");
    return () => {};
  }

  let active = true;
  const timer = window.setTimeout(async () => {
    try {
      const result = await commands.classifyImport(payload);
      if (!active) {
        return;
      }
      apply(result.importable.length, hintFor(result.importable.length, result.expired.length));
    } catch {
      if (active) {
        apply(0, "");
      }
    }
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
