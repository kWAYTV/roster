import { useCallback, useRef, useState } from "react";

import { ImportComposer } from "@/intake/import-composer";
import { importLabel, isImportFile, seedText } from "@/intake/import-seed";
import { ImportSignInAsk } from "@/intake/import-sign-in-ask";
import { useClassifyImport } from "@/intake/use-classify-import";
import { useImport } from "@/intake/use-intake";
import type { ImportWithoutSignIn } from "@/preferences/preferences";
import { Button } from "@/ui/primitives/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/ui/primitives/dialog";
import { SpinningLoader } from "@/ui/widgets/spinning-loader";

interface ImportDialogProps {
  importWithoutSignIn: ImportWithoutSignIn;
  onClose: () => void;
  open: boolean;
  /** Text to preload when the dialog opens (e.g. clipboard from the tray). */
  prefill?: string;
}

/// Remounted by the shell when opened; state is initialized from `prefill`.
export function ImportDialog({
  open,
  prefill,
  importWithoutSignIn,
  onClose,
}: ImportDialogProps) {
  const { importText, paste, busy } = useImport();
  const [draft, setDraft] = useState(() => seedText(prefill));
  const [dragging, setDragging] = useState(false);
  const [pendingAsk, setPendingAsk] = useState<string | null>(null);
  const dragDepthRef = useRef(0);
  const classified = useClassifyImport(draft, open);
  const filled = draft.trim().length > 0;
  const canImport = classified.count > 0 && !busy;

  const runImport = useCallback(
    async (payload: string, withoutSignIn: boolean) => {
      if (await importText(payload, withoutSignIn)) {
        onClose();
      }
    },
    [importText, onClose]
  );

  const submit = useCallback(
    async (payload: string) => {
      const text = payload.trim();
      if (!text) {
        return;
      }
      if (importWithoutSignIn === "ask") {
        setPendingAsk(text);
        return;
      }
      await runImport(text, importWithoutSignIn === "on");
    },
    [importWithoutSignIn, runImport]
  );

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (!next) {
        onClose();
      }
    },
    [onClose]
  );

  const pasteDraft = useCallback(() => {
    paste()
      .then((text) => {
        const next = text.trim();
        if (next) {
          setDraft(next);
        }
      })
      .catch(() => undefined);
  }, [paste]);

  const submitDraft = useCallback(() => {
    submit(draft).catch(() => undefined);
  }, [submit, draft]);

  const clearDraft = useCallback(() => {
    setDraft("");
  }, []);

  const cancelAsk = useCallback(() => {
    setPendingAsk(null);
  }, []);

  const askSignIn = useCallback(() => {
    if (!pendingAsk) {
      return;
    }
    const text = pendingAsk;
    setPendingAsk(null);
    runImport(text, false).catch(() => undefined);
  }, [pendingAsk, runImport]);

  const askStoreOnly = useCallback(() => {
    if (!pendingAsk) {
      return;
    }
    const text = pendingAsk;
    setPendingAsk(null);
    runImport(text, true).catch(() => undefined);
  }, [pendingAsk, runImport]);

  const applyDroppedText = useCallback((text: string) => {
    const next = text.trim();
    if (!next) {
      return;
    }
    setDraft(next);
  }, []);

  const handleDragEnter = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    dragDepthRef.current += 1;
    setDragging(true);
  }, []);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    dragDepthRef.current -= 1;
    if (dragDepthRef.current > 0) {
      return;
    }
    dragDepthRef.current = 0;
    setDragging(false);
  }, []);

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      dragDepthRef.current = 0;
      setDragging(false);
      const file = [...event.dataTransfer.files].find(isImportFile);
      if (!file) {
        applyDroppedText(event.dataTransfer.getData("text/plain"));
        return;
      }
      file
        .text()
        .then(applyDroppedText)
        .catch(() => undefined);
    },
    [applyDroppedText]
  );

  const handleDialogKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key !== "Enter" || !(event.metaKey || event.ctrlKey)) {
        return;
      }
      event.preventDefault();
      if (!canImport) {
        return;
      }
      submitDraft();
    },
    [canImport, submitDraft]
  );

  const suppressPasteBlur = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
    },
    []
  );

  return (
    <>
      <Dialog onOpenChange={handleOpenChange} open={open}>
        <DialogContent
          className="sm:max-w-lg"
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onKeyDown={handleDialogKeyDown}
        >
          <DialogHeader>
            <DialogTitle>Import accounts</DialogTitle>
            <DialogDescription>
              One token or a list. Expired entries are skipped.
            </DialogDescription>
          </DialogHeader>

          <DialogBody>
            <ImportComposer
              autoFocus={filled}
              busy={busy}
              classified={classified}
              dragging={dragging}
              onChange={setDraft}
              onClear={clearDraft}
              onSubmit={submitDraft}
              value={draft}
            />
          </DialogBody>

          <DialogFooter className="sm:items-center">
            {canImport ? (
              <kbd className="mr-auto rounded-sm border border-border bg-muted px-1.5 font-medium text-[10px] text-muted-foreground leading-[18px]">
                Ctrl+Enter
              </kbd>
            ) : null}
            <div className="flex justify-end gap-2">
              <Button
                autoFocus={!filled}
                disabled={busy}
                onClick={pasteDraft}
                onMouseDown={suppressPasteBlur}
                size="sm"
                type="button"
                variant={filled ? "outline" : "default"}
              >
                {filled ? "Paste" : "Paste from clipboard"}
              </Button>
              {filled ? (
                <Button
                  disabled={!canImport}
                  onClick={submitDraft}
                  size="sm"
                  type="button"
                >
                  {busy ? <SpinningLoader size={14} /> : null}
                  {importLabel(busy, classified.count)}
                </Button>
              ) : null}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ImportSignInAsk
        onCancel={cancelAsk}
        onSignIn={askSignIn}
        onStoreOnly={askStoreOnly}
        open={pendingAsk !== null}
      />
    </>
  );
}
