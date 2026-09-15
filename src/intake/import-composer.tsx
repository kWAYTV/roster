import { useCallback, useRef, useState } from "react";

import { looksLikeBulk } from "@/intake/import-seed";
import type { ClassifyHint } from "@/intake/use-classify-import";
import { Badge } from "@/ui/primitives/badge";
import { Button } from "@/ui/primitives/button";
import { cn } from "@/ui/primitives/cn";
import { Textarea } from "@/ui/primitives/textarea";

import styles from "./import-composer.module.css";

interface ImportComposerProps {
  autoFocus?: boolean;
  busy: boolean;
  classified: ClassifyHint;
  dragging: boolean;
  onChange: (value: string) => void;
  onClear: () => void;
  onSubmit: () => void;
  value: string;
}

export function ImportComposer({
  value,
  classified,
  busy,
  dragging,
  autoFocus = false,
  onChange,
  onClear,
  onSubmit,
}: ImportComposerProps) {
  const [focused, setFocused] = useState(false);
  const fieldRef = useRef<HTMLTextAreaElement>(null);
  const filled = value.trim().length > 0;
  const showEmpty = !(filled || focused || dragging);
  const invalid = filled && classified.hint === "No valid tokens";
  const statusId = "import-status";

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange(event.target.value);
    },
    [onChange]
  );

  const handleFocus = useCallback(() => {
    setFocused(true);
  }, []);

  const handleBlur = useCallback(() => {
    setFocused(false);
  }, []);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      const submitKey =
        event.key === "Enter" &&
        (event.metaKey || event.ctrlKey || !looksLikeBulk(value));
      if (!submitKey) {
        return;
      }
      event.preventDefault();
      if (classified.count === 0) {
        return;
      }
      onSubmit();
    },
    [classified.count, onSubmit, value]
  );

  const handleClear = useCallback(() => {
    onClear();
    fieldRef.current?.blur();
    setFocused(false);
  }, [onClear]);

  return (
    <div className={styles.composer}>
      <div
        className={styles.well}
        data-busy={busy}
        data-dragging={dragging}
        data-empty={showEmpty}
        data-invalid={invalid}
      >
        <Textarea
          aria-describedby={filled ? statusId : undefined}
          aria-hidden={showEmpty}
          aria-invalid={invalid}
          aria-label="Tokens"
          autoComplete="off"
          autoCorrect="off"
          autoFocus={autoFocus}
          className={cn(
            styles.field,
            "border-transparent bg-transparent shadow-none focus-visible:border-transparent focus-visible:ring-0 dark:bg-transparent"
          )}
          disabled={busy}
          onBlur={handleBlur}
          onChange={handleChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder="account----token"
          ref={fieldRef}
          spellCheck={false}
          tabIndex={showEmpty ? -1 : undefined}
          value={value}
        />
        {showEmpty ? (
          <div className={styles.curtain}>
            <p className={styles.lead}>
              Drop a .txt, or paste from the clipboard
            </p>
            <p className={styles.example}>account----token</p>
          </div>
        ) : null}
        {dragging ? (
          <div className={styles.curtain}>
            <p className={styles.lead}>Drop to import</p>
          </div>
        ) : null}
      </div>

      {filled ? (
        <div className={styles.status} id={statusId} role="status">
          <ImportChips classified={classified} />
          <Button
            disabled={busy}
            onClick={handleClear}
            size="xs"
            type="button"
            variant="ghost"
          >
            Clear
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function ImportChips({ classified }: { classified: ClassifyHint }) {
  if (classified.hint === "No valid tokens") {
    return <p className={styles.invalid}>No valid tokens</p>;
  }

  const singleReady = classified.count <= 1 && classified.expired === 0;
  if (singleReady) {
    return null;
  }

  if (!(classified.count || classified.expired)) {
    return null;
  }

  return (
    <div className={styles.chips}>
      {classified.newCount > 0 ? (
        <Badge
          className={classified.newCount > 1 ? "tabular-nums" : undefined}
          variant="outline"
        >
          {unitChip(classified.newCount, "New", "new")}
        </Badge>
      ) : null}
      {classified.updateCount > 0 ? (
        <Badge
          className={classified.updateCount > 1 ? "tabular-nums" : undefined}
          variant="outline"
        >
          {unitChip(classified.updateCount, "Update", "update")}
        </Badge>
      ) : null}
      {classified.count > 0 &&
      !(classified.newCount || classified.updateCount) ? (
        <Badge
          className={classified.count > 1 ? "tabular-nums" : undefined}
          variant="outline"
        >
          {unitChip(classified.count, "Ready", "ready")}
        </Badge>
      ) : null}
      {classified.expired > 0 ? (
        <Badge
          className={classified.expired > 1 ? "tabular-nums" : undefined}
          variant="destructive"
        >
          {unitChip(classified.expired, "Expired", "expired")}
        </Badge>
      ) : null}
    </div>
  );
}

function unitChip(count: number, singular: string, plural: string): string {
  if (count === 1) {
    return singular;
  }
  return `${count} ${plural}`;
}
