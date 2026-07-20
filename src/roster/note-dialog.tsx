import { useCallback, useEffect, useState } from "react";

import { Button } from "@/ui/primitives/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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

export function NoteDialog({
  open,
  name,
  initial,
  onSave,
  onClose,
}: NoteDialogProps) {
  const [note, setNote] = useState(initial);

  useEffect(() => {
    if (open) {
      setNote(initial);
    }
  }, [open, initial]);

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

  return (
    <Dialog onOpenChange={handleOpenChange} open={open}>
      <DialogContent className="gap-4 p-5 sm:max-w-md" showCloseButton>
        <DialogHeader className="pr-8">
          <DialogTitle>Note</DialogTitle>
          <DialogDescription>{name}</DialogDescription>
        </DialogHeader>
        <Textarea
          className="min-h-24"
          onChange={handleChange}
          placeholder="Label, smurf, banned…"
          value={note}
        />
        <div className="flex justify-end gap-2">
          <Button onClick={onClose} size="sm" variant="outline">
            Cancel
          </Button>
          <Button onClick={handleSave} size="sm">
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
