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
import { Input } from "@/ui/primitives/input";

const TAG_SPLIT = /[,#]+/;

interface TagsDialogProps {
  initial: string[];
  name: string;
  onClose: () => void;
  onSave: (tags: string[]) => void;
  open: boolean;
}

/// Parent should remount with `key` when the target account changes.
export function TagsDialog({
  open,
  name,
  initial,
  onSave,
  onClose,
}: TagsDialogProps) {
  const [value, setValue] = useState(() => initial.join(", "));

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (!next) {
        onClose();
      }
    },
    [onClose]
  );

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setValue(event.target.value);
    },
    []
  );

  const handleSave = useCallback(() => {
    onSave(
      value
        .split(TAG_SPLIT)
        .map((tag) => tag.trim())
        .filter(Boolean)
    );
    onClose();
  }, [value, onClose, onSave]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") {
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
          <DialogTitle>Tags</DialogTitle>
          <DialogDescription>
            {name} — comma-separated. Search with #tag.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <Input
            autoFocus
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="smurf, main, banned"
            value={value}
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
