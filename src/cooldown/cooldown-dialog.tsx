import { useCallback, useState } from "react";

import { Button } from "@/ui/primitives/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/ui/primitives/dialog";
import { Input } from "@/ui/primitives/input";

const UNITS = [
  { label: "minutes", seconds: 60 },
  { label: "hours", seconds: 3600 },
  { label: "days", seconds: 86_400 },
];

interface CooldownDialogProps {
  onClose: () => void;
  onStart: (seconds: number) => void;
  open: boolean;
}

export function CooldownDialog({
  open,
  onClose,
  onStart,
}: CooldownDialogProps) {
  const [amount, setAmount] = useState("1");
  const [unit, setUnit] = useState(3600);

  const seconds = Math.round(Number(amount) * unit);
  const valid = Number.isFinite(seconds) && seconds > 0;

  const submit = useCallback(() => {
    if (!valid) {
      return;
    }
    onStart(seconds);
    onClose();
  }, [valid, seconds, onStart, onClose]);

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (!next) {
        onClose();
      }
    },
    [onClose]
  );

  const handleAmountChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setAmount(event.target.value);
    },
    []
  );

  const handleAmountKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") {
        submit();
      }
    },
    [submit]
  );

  const handleUnitChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      setUnit(Number(event.target.value));
    },
    []
  );

  return (
    <Dialog onOpenChange={handleOpenChange} open={open}>
      <DialogContent className="gap-4 p-5 sm:max-w-sm" showCloseButton>
        <DialogHeader className="pr-8">
          <DialogTitle>Custom cooldown</DialogTitle>
        </DialogHeader>
        <div className="flex gap-2">
          <Input
            autoFocus
            className="w-24"
            min={1}
            onChange={handleAmountChange}
            onKeyDown={handleAmountKeyDown}
            type="number"
            value={amount}
          />
          <select
            className="h-8 flex-1 rounded-lg border border-input bg-transparent px-2.5 text-sm dark:bg-input/30"
            onChange={handleUnitChange}
            value={unit}
          >
            {UNITS.map((option) => (
              <option key={option.seconds} value={option.seconds}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <DialogFooter className="mx-0 mb-0 border-0 bg-transparent p-0 sm:justify-end">
          <Button disabled={!valid} onClick={submit} size="sm">
            Start cooldown
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
