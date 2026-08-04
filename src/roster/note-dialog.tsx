import { useCallback, useState } from "react";

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
import { Textarea } from "@/ui/primitives/textarea";

interface NoteDialogProps {
  initial: string;
  name: string;
  onClose: () => void;
  onSave: (note: string) => void;
  open: boolean;
}

/// Parent should remount with `key` when the target account changes.
export function NoteDialog({
  open,
  name,
  initial,
  onSave,
  onClose,
}: NoteDialogProps) {
  const [note, setNote] = useState(initial);

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (!next) {
        onClose();
      }
    },
    [onClose]
  );

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      setNote(event.target.value);
    },
    []
  );

  const handleSave = useCallback(() => {
    onSave(note);
    onClose();
  }, [note, onClose, onSave]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        handleSave();
      }
    },
    [handleSave]
  );

  return (
    <Dialog onOpenChange={handleOpenChange} open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Note</DialogTitle>
          <DialogDescription>{name}</DialogDescription>
        </DialogHeader>
        <DialogBody>
          <Textarea
            autoFocus
            className="min-h-24 resize-none"
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Label, smurf, banned…"
            value={note}
          />
        </DialogBody>
        <DialogFooter>
          <Button onClick={onClose} size="sm" variant="outline">
            Cancel
          </Button>
          <Button onClick={handleSave} size="sm">
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
