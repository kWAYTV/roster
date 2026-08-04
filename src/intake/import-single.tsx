import { useCallback } from "react";

import { importLabel } from "@/intake/import-seed";
import type { ClassifyHint } from "@/intake/use-classify-import";
import { Button } from "@/ui/primitives/button";
import { Input } from "@/ui/primitives/input";

interface ImportSingleProps {
  autoFocus?: boolean;
  busy: boolean;
  classified: ClassifyHint;
  onChange: (value: string) => void;
  onPaste: () => void;
  onSubmit: () => void;
  value: string;
}

export function ImportSingle({
  value,
  classified,
  busy,
  autoFocus = false,
  onChange,
  onPaste,
  onSubmit,
}: ImportSingleProps) {
  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onChange(event.target.value);
    },
    [onChange]
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key !== "Enter") {
        return;
      }
      event.preventDefault();
      if (classified.count === 0) {
        return;
      }
      onSubmit();
    },
    [classified.count, onSubmit]
  );

  return (
    <section className="flex flex-col gap-2">
      <Input
        autoFocus={autoFocus}
        disabled={busy}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="steamid----token or bare JWT"
        spellCheck={false}
        value={value}
      />
      {classified.hint ? (
        <p className="text-muted-foreground text-xs tabular-nums">
          {classified.hint}
        </p>
      ) : null}
      <div className="flex justify-end gap-2">
        <Button
          disabled={busy}
          onClick={onPaste}
          size="sm"
          type="button"
          variant="outline"
        >
          Paste
        </Button>
        <Button
          disabled={busy || classified.count === 0}
          onClick={onSubmit}
          size="sm"
          type="button"
        >
          {importLabel(busy, classified.count)}
        </Button>
      </div>
    </section>
  );
}
