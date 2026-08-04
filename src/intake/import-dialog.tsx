import { useCallback, useState } from "react";

import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/ui/primitives/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/primitives/tabs";
import { ImportBulk } from "./import-bulk";
import { looksLikeBulk, seedFields } from "./import-seed";
import { ImportSingle } from "./import-single";
import { useClassifyImport } from "./use-classify-import";
import { useImport } from "./use-intake";

const TEXT_FILE = /\.(txt|csv|log|jwt)$/i;

type ImportTab = "single" | "bulk";

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
  const [tab, setTab] = useState<ImportTab>(seeded.bulk ? "bulk" : "single");
  const [dragging, setDragging] = useState(false);
  const singleClassified = useClassifyImport(single, open && tab === "single");
  const bulkClassified = useClassifyImport(bulk, open && tab === "bulk");

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
    async (target: ImportTab) => {
      const text = (await paste()).trim();
      if (!text) {
        return;
      }
      if (target !== "bulk" && !looksLikeBulk(text)) {
        setSingle(text);
        setTab("single");
        return;
      }
      setBulk(text);
      setTab("bulk");
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

  const handleTabChange = useCallback((value: string | number | null) => {
    if (value === "single" || value === "bulk") {
      setTab(value);
    }
  }, []);

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
      setTab("bulk");
      return;
    }
    setSingle(next);
    setTab("single");
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

        <DialogBody>
          <Tabs className="gap-4" onValueChange={handleTabChange} value={tab}>
            <TabsList className="w-full">
              <TabsTrigger className="flex-1" value="single">
                Single
              </TabsTrigger>
              <TabsTrigger className="flex-1" value="bulk">
                Bulk
              </TabsTrigger>
            </TabsList>

            <TabsContent className="mt-0 outline-none" value="single">
              <ImportSingle
                autoFocus={tab === "single"}
                busy={busy}
                classified={singleClassified}
                onChange={setSingle}
                onPaste={pasteSingle}
                onSubmit={submitSingle}
                value={single}
              />
            </TabsContent>

            <TabsContent className="mt-0 outline-none" value="bulk">
              <ImportBulk
                autoFocus={tab === "bulk"}
                busy={busy}
                classified={bulkClassified}
                onChange={setBulk}
                onPaste={pasteBulk}
                onSubmit={submitBulk}
                value={bulk}
              />
            </TabsContent>
          </Tabs>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
