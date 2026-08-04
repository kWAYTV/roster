import { useCallback } from "react";

import { Button } from "@/ui/primitives/button";
import { Label } from "@/ui/primitives/label";

export type TriState = "inherit" | "on" | "off";

interface OverrideTriFieldProps {
  label: string;
  onChange: (value: TriState) => void;
  value: TriState;
}

export function OverrideTriField({
  label,
  value,
  onChange,
}: OverrideTriFieldProps) {
  const selectInherit = useCallback(() => {
    onChange("inherit");
  }, [onChange]);
  const selectOn = useCallback(() => {
    onChange("on");
  }, [onChange]);
  const selectOff = useCallback(() => {
    onChange("off");
  }, [onChange]);

  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      <div className="flex gap-1.5">
        <Button
          className="flex-1"
          onClick={selectInherit}
          size="xs"
          type="button"
          variant={value === "inherit" ? "default" : "outline"}
        >
          Inherit
        </Button>
        <Button
          className="flex-1"
          onClick={selectOn}
          size="xs"
          type="button"
          variant={value === "on" ? "default" : "outline"}
        >
          On
        </Button>
        <Button
          className="flex-1"
          onClick={selectOff}
          size="xs"
          type="button"
          variant={value === "off" ? "default" : "outline"}
        >
          Off
        </Button>
      </div>
    </div>
  );
}

export function toTri(value: boolean | null): TriState {
  if (value === null) {
    return "inherit";
  }
  return value ? "on" : "off";
}

export function fromTri(value: TriState): boolean | null {
  if (value === "inherit") {
    return null;
  }
  return value === "on";
}
