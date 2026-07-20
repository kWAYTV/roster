import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const UNITS = [
  { label: "minutes", seconds: 60 },
  { label: "hours", seconds: 3600 },
  { label: "days", seconds: 86400 },
];

interface CooldownDialogProps {
  open: boolean;
  onClose: () => void;
  onStart: (seconds: number) => void;
}

export function CooldownDialog({ open, onClose, onStart }: CooldownDialogProps) {
  const [amount, setAmount] = useState("1");
  const [unit, setUnit] = useState(3600);

  const seconds = Math.round(Number(amount) * unit);
  const valid = Number.isFinite(seconds) && seconds > 0;

  const submit = () => {
    if (!valid) {
      return;
    }
    onStart(seconds);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="gap-4 p-5 sm:max-w-sm" showCloseButton>
        <DialogHeader className="pr-8">
          <DialogTitle>Custom cooldown</DialogTitle>
        </DialogHeader>
        <div className="flex gap-2">
          <Input
            type="number"
            min={1}
            value={amount}
            autoFocus
            className="w-24"
            onChange={(event) => setAmount(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                submit();
              }
            }}
          />
          <select
            className="h-8 flex-1 rounded-lg border border-input bg-transparent px-2.5 text-sm dark:bg-input/30"
            value={unit}
            onChange={(event) => setUnit(Number(event.target.value))}
          >
            {UNITS.map((option) => (
              <option key={option.seconds} value={option.seconds}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <DialogFooter className="mx-0 mb-0 border-0 bg-transparent p-0 sm:justify-end">
          <Button size="sm" disabled={!valid} onClick={submit}>
            Start cooldown
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
