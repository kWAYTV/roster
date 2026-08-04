import { useCallback } from "react";

import { ChevronDownIcon } from "@/ui/icons/chevron-down";
import { Button } from "@/ui/primitives/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/ui/primitives/dropdown-menu";
import { Hint } from "@/ui/widgets/hint";
import { COOLDOWN_PRESETS } from "../cooldown/cooldown";
import styles from "./bulk-bar.module.css";

interface BulkBarProps {
  count: number;
  exportCount: number;
  onClear: () => void;
  onClearCooldown: () => void;
  onClearNotes: () => void;
  onCooldown: (seconds: number) => void;
  onCopyExport: () => void;
  onCustomCooldown: () => void;
  onExportFile: () => void;
  onPin: (pinned: boolean) => void;
  onRemove: () => void;
}

export function BulkBar({
  count,
  exportCount,
  onClear,
  onCooldown,
  onClearCooldown,
  onCustomCooldown,
  onCopyExport,
  onExportFile,
  onClearNotes,
  onPin,
  onRemove,
}: BulkBarProps) {
  const handlePresetClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const seconds = Number(event.currentTarget.dataset.seconds);
      if (Number.isFinite(seconds)) {
        onCooldown(seconds);
      }
    },
    [onCooldown]
  );

  const pinAll = useCallback(() => {
    onPin(true);
  }, [onPin]);

  const unpinAll = useCallback(() => {
    onPin(false);
  }, [onPin]);

  if (count < 2) {
    return null;
  }

  const copyLabel = copyExportLabel(exportCount, count);
  const copyHint =
    exportCount === 0
      ? "No saved tokens on selected accounts"
      : `${count - exportCount} selected account(s) have no saved token`;

  return (
    <div className={styles.bar}>
      <span className={styles.label}>{count} selected</span>
      <div className={styles.actions}>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                className={styles.cooldownBtn}
                size="xs"
                variant="outline"
              />
            }
          >
            Cooldown
            <ChevronDownIcon size={14} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-auto min-w-36">
            {COOLDOWN_PRESETS.map((preset) => (
              <DropdownMenuItem
                data-seconds={preset.seconds}
                key={preset.seconds}
                onClick={handlePresetClick}
              >
                {preset.label}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onCustomCooldown}>
              Custom…
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onClearCooldown}>
              Clear cooldown
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button onClick={pinAll} size="xs" variant="ghost">
          Pin
        </Button>
        <Button onClick={unpinAll} size="xs" variant="ghost">
          Unpin
        </Button>
        <Button onClick={onClearNotes} size="xs" variant="ghost">
          Clear notes
        </Button>
        {exportCount < count ? (
          <Hint label={copyHint}>
            <Button
              disabled={exportCount === 0}
              onClick={onCopyExport}
              size="xs"
              variant="ghost"
            >
              {copyLabel}
            </Button>
          </Hint>
        ) : (
          <Button onClick={onCopyExport} size="xs" variant="ghost">
            {copyLabel}
          </Button>
        )}
        <Button
          disabled={exportCount === 0}
          onClick={onExportFile}
          size="xs"
          variant="ghost"
        >
          Save…
        </Button>
        <Button
          className="text-destructive hover:bg-destructive/15 hover:text-destructive"
          onClick={onRemove}
          size="xs"
          variant="ghost"
        >
          Remove
        </Button>
        <Button onClick={onClear} size="xs" variant="ghost">
          Done
        </Button>
      </div>
    </div>
  );
}

function copyExportLabel(exportCount: number, count: number): string {
  if (exportCount === 0) {
    return "Copy";
  }
  if (exportCount === count) {
    return `Copy ${exportCount}`;
  }
  return `Copy ${exportCount}/${count}`;
}
