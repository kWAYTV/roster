import { useCallback, useRef, useState } from "react";
import { notify } from "@/feedback/status";
import { ImportComposer } from "@/intake/import-composer";
import {
  appendEntries,
  importLabel,
  isImportFile,
  seedText,
} from "@/intake/import-seed";
import { ImportSignInAsk } from "@/intake/import-sign-in-ask";
import { useClassifyImport } from "@/intake/use-classify-import";
import { useImport } from "@/intake/use-intake";
import type { ImportWithoutSignIn } from "@/preferences/preferences";
import { ClipboardPasteIcon } from "@/ui/icons/clipboard-paste";
import { PlusIcon } from "@/ui/icons/plus";
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
import { IconAction } from "@/ui/widgets/icon-action";
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
  const knownEmpty = !classified.pending && classified.count === 0;
  const canImport = filled && !busy && !knownEmpty;

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
      // Keep the dialog up while Steam is being rewritten, so the result lands here.
      if (!(next || busy)) {
        onClose();
      }
    },
    [busy, onClose]
  );

  const pasteDraft = useCallback(() => {
    paste()
      .then((text) => {
        const next = text.trim();
        if (!next) {
          notify("Clipboard is empty", "error");
          return;
        }
        setDraft((current) => appendEntries(current, next));
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
      notify("Nothing to import in that drop", "error");
      return;
    }
    setDraft((current) => appendEntries(current, next));
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
      if (busy) {
        return;
      }
      const dropped = [...event.dataTransfer.files];
      const files = dropped.filter(isImportFile);
      if (files.length === 0) {
        if (dropped.length > 0) {
          notify("Drop a .txt file with tokens", "error");
          return;
        }
        applyDroppedText(event.dataTransfer.getData("text/plain"));
        return;
      }
      Promise.all(files.map((file) => file.text()))
        .then((texts) => applyDroppedText(texts.join("\n")))
        .catch(() => notify("Could not read that file", "error"));
    },
    [applyDroppedText, busy]
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
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onKeyDown={handleDialogKeyDown}
          showCloseButton={!busy}
          size="lg"
        >
          <DialogHeader>
            <DialogTitle>Import accounts</DialogTitle>
            <DialogDescription>
              Paste or drop tokens, one per line. Expired entries are skipped
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

          <DialogFooter>
            {canImport ? (
              <span className="mr-auto flex items-center gap-1.5 text-muted-foreground text-xs">
                <kbd className="rounded-[4px] border border-border px-1 font-mono text-[10px] leading-4">
                  Ctrl Enter
                </kbd>
                to import
              </span>
            ) : null}
            <div className="flex justify-end gap-2">
              <IconAction
                autoFocus={!filled}
                disabled={busy}
                icon={<ClipboardPasteIcon />}
                label="Paste from clipboard"
                onClick={pasteDraft}
                onMouseDown={suppressPasteBlur}
                size="sm"
                variant={filled ? "outline" : "default"}
              >
                Paste
              </IconAction>
              {filled ? (
                <ImportSubmit
                  busy={busy}
                  canImport={canImport}
                  count={classified.count}
                  onClick={submitDraft}
                />
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

function ImportSubmit({
  busy,
  canImport,
  count,
  onClick,
}: {
  busy: boolean;
  canImport: boolean;
  count: number;
  onClick: () => void;
}) {
  if (busy) {
    return (
      <Button disabled size="sm" type="button">
        <SpinningLoader size={14} />
        Importing…
      </Button>
    );
  }

  return (
    <IconAction
      disabled={!canImport}
      icon={<PlusIcon />}
      label="Import"
      onClick={onClick}
      size="sm"
    >
      {importLabel(false, count)}
    </IconAction>
  );
}
