import { useCallback } from "react";

import { Button } from "@/ui/primitives/button";
import { Textarea } from "@/ui/primitives/textarea";
import { importLabel } from "./import-seed";
import type { ClassifyHint } from "./use-classify-import";

interface ImportBulkProps {
  autoFocus?: boolean;
  busy: boolean;
  classified: ClassifyHint;
  onChange: (value: string) => void;
  onPaste: () => void;
  onSubmit: () => void;
  value: string;
}

export function ImportBulk({
  value,
  classified,
  busy,
  autoFocus = false,
  onChange,
  onPaste,
  onSubmit,
}: ImportBulkProps) {
  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange(event.target.value);
    },
    [onChange]
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        if (classified.count === 0) {
          return;
        }
        onSubmit();
      }
    },
    [classified.count, onSubmit]
  );

  return (
    <section className="flex flex-col gap-2">
      <Textarea
        autoFocus={autoFocus}
        className="min-h-28 resize-none font-mono text-xs"
        disabled={busy}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={"steamid----token\none account per line"}
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
