import { Input } from "@/ui/primitives/input";
import { Label } from "@/ui/primitives/label";
import type { DurationParts } from "./cooldown";

interface DurationFieldProps {
  autoFocus?: boolean;
  label: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  unit: keyof DurationParts;
  value: string;
}

function selectOnFocus(event: React.FocusEvent<HTMLInputElement>) {
  event.currentTarget.select();
}

/// One numeric slot of a d/h/m duration. Reports its unit via `data-unit`.
export function DurationField({
  autoFocus,
  label,
  onChange,
  onKeyDown,
  unit,
  value,
}: DurationFieldProps) {
  const id = `cooldown-${unit}`;
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-muted-foreground text-xs" htmlFor={id}>
        {label}
      </Label>
      <Input
        autoFocus={autoFocus}
        className="tabular-nums"
        data-unit={unit}
        id={id}
        inputMode="numeric"
        min={0}
        onChange={onChange}
        onFocus={selectOnFocus}
        onKeyDown={onKeyDown}
        placeholder="0"
        type="number"
        value={value}
      />
    </div>
  );
}
