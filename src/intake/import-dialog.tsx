import { useEffect, useState } from "react";

import { Modal } from "../feedback/modal";
import { commands } from "../ipc/invoke";
import { useImport } from "./use-intake";
import styles from "./import-dialog.module.css";

interface ImportDialogProps {
  open: boolean;
  /** Text to preload when the dialog opens (e.g. clipboard from the tray). */
  prefill?: string;
  onClose: () => void;
}

export function ImportDialog({ open, prefill, onClose }: ImportDialogProps) {
  const { importText, paste, busy } = useImport();
  const [text, setText] = useState("");
  const [hint, setHint] = useState("");
  const [importableCount, setImportableCount] = useState(0);

  useEffect(() => {
    if (open) {
      setText(prefill?.trim() ?? "");
    } else {
      setText("");
      setHint("");
      setImportableCount(0);
    }
  }, [open, prefill]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const payload = text.trim();
    if (!payload) {
      setHint("");
      setImportableCount(0);
      return;
    }
    let active = true;
    const timer = window.setTimeout(async () => {
      try {
        const result = await commands.classifyImport(payload);
        if (!active) {
          return;
        }
        setImportableCount(result.importable.length);
        if (result.importable.length && result.expired.length) {
          setHint(
            `${result.importable.length} importable · ${result.expired.length} expired (skipped)`,
          );
        } else if (result.expired.length) {
          setHint(`${result.expired.length} expired — nothing to import`);
        } else if (result.importable.length) {
          setHint("");
        } else {
          setHint("No valid tokens found");
        }
      } catch {
        if (active) {
          setHint("");
        }
      }
    }, 250);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [open, text]);

  const submit = async () => {
    const payload = text.trim();
    if (!payload || importableCount === 0) {
      return;
    }
    if (await importText(payload)) {
      setText("");
      onClose();
    }
  };

  const fillFromClipboard = async () => {
    setText((await paste()).trim());
  };

  return (
    <Modal
      open={open}
      title="Import accounts"
      onClose={onClose}
      footer={
        <>
          <button className="btn" onClick={fillFromClipboard}>
            Paste
          </button>
          <button
            className="btn btn-accent"
            disabled={busy || importableCount === 0}
            onClick={submit}
          >
            {busy
              ? "Importing…"
              : importableCount > 0
                ? `Import ${importableCount}`
                : "Import"}
          </button>
        </>
      }
    >
      <textarea
        className="field"
        spellCheck={false}
        placeholder="steamid----token&#10;one account per line"
        value={text}
        onChange={(event) => setText(event.target.value)}
      />
      {hint ? <p className={styles.hint}>{hint}</p> : null}
    </Modal>
  );
}
