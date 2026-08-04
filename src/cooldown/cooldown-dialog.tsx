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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/primitives/select";

const UNITS = [
  { label: "minutes", seconds: 60 },
  { label: "hours", seconds: 3600 },
  { label: "days", seconds: 86_400 },
] as const;

interface CooldownDialogProps {
  onClose: () => void;
  onStart: (seconds: number) => void;
  open: boolean;
}

/// Remount with `key` when the selection set changes if defaults should reset.
export function CooldownDialog({
  open,
  onClose,
  onStart,
}: CooldownDialogProps) {
  const [amount, setAmount] = useState("1");
  const [unit, setUnit] = useState(String(3600));

  const unitSeconds = Number(unit);
  const seconds = Math.round(Number(amount) * unitSeconds);
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
        event.preventDefault();
        submit();
      }
    },
    [submit]
  );

  const handleUnitChange = useCallback((value: string | null) => {
    if (value !== null) {
      setUnit(value);
    }
  }, []);

  return (
    <Dialog onOpenChange={handleOpenChange} open={open}>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>Custom cooldown</DialogTitle>
          <DialogDescription>
            How long should the selected accounts stay on cooldown?
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <div className="flex gap-2">
            <Input
              autoFocus
              className="w-24 tabular-nums"
              min={1}
              onChange={handleAmountChange}
              onKeyDown={handleAmountKeyDown}
              type="number"
              value={amount}
            />
            <Select onValueChange={handleUnitChange} value={unit}>
              <SelectTrigger className="h-8 flex-1" size="sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent alignItemWithTrigger={false}>
                {UNITS.map((option) => (
                  <SelectItem
                    key={option.seconds}
                    value={String(option.seconds)}
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button onClick={onClose} size="sm" variant="outline">
            Cancel
          </Button>
          <Button disabled={!valid} onClick={submit} size="sm">
            Start cooldown
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
