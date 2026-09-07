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
import {
  type DurationParts,
  formatDuration,
  joinDuration,
  SECONDS_PER_DAY,
  SECONDS_PER_HOUR,
  SECONDS_PER_MINUTE,
  splitDuration,
} from "./cooldown";
import { DurationField } from "./duration-field";
import { useNow } from "./use-now";

const QUICK_ADD = [
  { label: "+30m", seconds: 30 * SECONDS_PER_MINUTE },
  { label: "+1h", seconds: SECONDS_PER_HOUR },
  { label: "+6h", seconds: 6 * SECONDS_PER_HOUR },
  { label: "+1d", seconds: SECONDS_PER_DAY },
  { label: "+7d", seconds: 7 * SECONDS_PER_DAY },
] as const;

const DEFAULT_SECONDS = SECONDS_PER_HOUR;
const PREVIEW_TICK_MS = 30_000;
const ENDS_AT_FORMAT: Intl.DateTimeFormatOptions = {
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  month: "short",
  weekday: "short",
};

type PartsDraft = Record<keyof DurationParts, string>;

const EMPTY_DRAFT: PartsDraft = { days: "", hours: "", minutes: "" };

function toDraft(seconds: number): PartsDraft {
  const parts = splitDuration(seconds);
  return {
    days: parts.days ? String(parts.days) : "",
    hours: parts.hours ? String(parts.hours) : "",
    minutes: parts.minutes ? String(parts.minutes) : "",
  };
}

function parseSlot(raw: string): number {
  const value = Number(raw);
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : 0;
}

function fromDraft(draft: PartsDraft): number {
  return joinDuration({
    days: parseSlot(draft.days),
    hours: parseSlot(draft.hours),
    minutes: parseSlot(draft.minutes),
  });
}

function isDurationUnit(
  value: string | undefined
): value is keyof DurationParts {
  return value === "days" || value === "hours" || value === "minutes";
}

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
  const [draft, setDraft] = useState<PartsDraft>(() =>
    toDraft(DEFAULT_SECONDS)
  );
  const now = useNow(PREVIEW_TICK_MS);

  const seconds = fromDraft(draft);
  const valid = seconds > 0;
  const endsAt = new Date((now + seconds) * 1000).toLocaleString(
    undefined,
    ENDS_AT_FORMAT
  );

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

  const handleSlotChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const {
        value,
        dataset: { unit },
      } = event.currentTarget;
      if (!isDurationUnit(unit)) {
        return;
      }
      setDraft((current) => ({ ...current, [unit]: value }));
    },
    []
  );

  const handleSlotKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") {
        event.preventDefault();
        submit();
      }
    },
    [submit]
  );

  const handleQuickAdd = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      const delta = Number(event.currentTarget.dataset.seconds);
      if (!Number.isFinite(delta)) {
        return;
      }
      setDraft((current) => toDraft(fromDraft(current) + delta));
    },
    []
  );

  const handleReset = useCallback(() => {
    setDraft(EMPTY_DRAFT);
  }, []);

  return (
    <Dialog onOpenChange={handleOpenChange} open={open}>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>Custom cooldown</DialogTitle>
          <DialogDescription>
            Days, hours and minutes add up. Quick-add buttons stack on top.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <div className="grid grid-cols-3 gap-2">
            <DurationField
              autoFocus
              label="Days"
              onChange={handleSlotChange}
              onKeyDown={handleSlotKeyDown}
              unit="days"
              value={draft.days}
            />
            <DurationField
              label="Hours"
              onChange={handleSlotChange}
              onKeyDown={handleSlotKeyDown}
              unit="hours"
              value={draft.hours}
            />
            <DurationField
              label="Minutes"
              onChange={handleSlotChange}
              onKeyDown={handleSlotKeyDown}
              unit="minutes"
              value={draft.minutes}
            />
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {QUICK_ADD.map((chip) => (
              <Button
                data-seconds={chip.seconds}
                key={chip.label}
                onClick={handleQuickAdd}
                size="xs"
                type="button"
                variant="outline"
              >
                {chip.label}
              </Button>
            ))}
            <Button
              className="ml-auto"
              disabled={!valid}
              onClick={handleReset}
              size="xs"
              type="button"
              variant="ghost"
            >
              Clear
            </Button>
          </div>
          <p className="text-muted-foreground text-xs tabular-nums">
            {valid
              ? `${formatDuration(seconds)} · ends ${endsAt}`
              : "Enter a duration"}
          </p>
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
