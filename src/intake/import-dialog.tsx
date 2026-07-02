import { useEffect, useState } from "react";

import { Modal } from "../feedback/modal";
import { useImport } from "./use-intake";

interface ImportDialogProps {
  open: boolean;
  /** Text to preload when the dialog opens (e.g. clipboard from the tray). */
  prefill?: string;
  onClose: () => void;
}

export function ImportDialog({ open, prefill, onClose }: ImportDialogProps) {
  const { importText, paste, busy } = useImport();
  const [text, setText] = useState("");

  // Tokens are sensitive; never leave them sitting in a closed dialog.
  useEffect(() => {
    if (open) {
      setText(prefill?.trim() ?? "");
    } else {
      setText("");
    }
  }, [open, prefill]);

  const submit = async () => {
    const payload = text.trim();
    if (!payload) {
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
          <button className="btn btn-accent" disabled={busy} onClick={submit}>
            {busy ? "Importing\u2026" : "Import"}
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
    </Modal>
  );
}
