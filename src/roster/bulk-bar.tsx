import { type MouseEvent, useCallback, useMemo } from "react";

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
import type { AccountView } from "./account";
import styles from "./bulk-bar.module.css";

interface BulkBarProps {
  exportCount: number;
  onClear: () => void;
  onClearCooldown: (steamids: string[]) => void;
  onClearNotes: (steamids: string[]) => void;
  onCooldown: (steamids: string[], seconds: number) => void;
  onCopyExport: (steamids: string[]) => void;
  onCustomCooldown: (steamids: string[]) => void;
  onExportFile: (steamids: string[]) => void;
  onPin: (steamids: string[], pinned: boolean) => void;
  onRemove: (accounts: AccountView[]) => void;
  selected: AccountView[];
}

export function BulkBar({
  selected,
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
  const steamids = useMemo(
    () => selected.map((account) => account.steamid),
    [selected]
  );
  const count = selected.length;

  const handlePresetClick = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      const seconds = Number(event.currentTarget.dataset.seconds);
      if (Number.isFinite(seconds)) {
        onCooldown(steamids, seconds);
      }
    },
    [onCooldown, steamids]
  );

  const pinAll = useCallback(() => {
    onPin(steamids, true);
  }, [onPin, steamids]);

  const unpinAll = useCallback(() => {
    onPin(steamids, false);
  }, [onPin, steamids]);

  const handleClearCooldown = useCallback(() => {
    onClearCooldown(steamids);
  }, [onClearCooldown, steamids]);

  const handleCustomCooldown = useCallback(() => {
    onCustomCooldown(steamids);
  }, [onCustomCooldown, steamids]);

  const handleCopyExport = useCallback(() => {
    onCopyExport(steamids);
  }, [onCopyExport, steamids]);

  const handleExportFile = useCallback(() => {
    onExportFile(steamids);
  }, [onExportFile, steamids]);

  const handleClearNotes = useCallback(() => {
    onClearNotes(steamids);
  }, [onClearNotes, steamids]);

  const handleRemove = useCallback(() => {
    onRemove(selected);
  }, [onRemove, selected]);

  if (count < 2) {
    return null;
  }

  const copyLabel = copyExportLabel(exportCount, count);
  const copyHint =
    exportCount === 0
      ? "No saved tokens on selected accounts"
      : `${count - exportCount} selected account(s) have no saved token`;

  return (
    <section aria-label="Selection" className={styles.bar}>
      <span className={styles.label}>{count} selected</span>
      <div className={styles.actions}>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button className={styles.menuBtn} size="xs" variant="outline" />
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
            <DropdownMenuItem onClick={handleCustomCooldown}>
              Custom…
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleClearCooldown}>
              Clear cooldown
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button className={styles.menuBtn} size="xs" variant="ghost" />
            }
          >
            Pin
            <ChevronDownIcon size={14} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-auto min-w-36">
            <DropdownMenuItem onClick={pinAll}>Pin</DropdownMenuItem>
            <DropdownMenuItem onClick={unpinAll}>Unpin</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleClearNotes}>
              Clear notes
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        {exportCount < count ? (
          <Hint label={copyHint}>
            <Button
              disabled={exportCount === 0}
              onClick={handleCopyExport}
              size="xs"
              variant="ghost"
            >
              {copyLabel}
            </Button>
          </Hint>
        ) : (
          <Button onClick={handleCopyExport} size="xs" variant="ghost">
            {copyLabel}
          </Button>
        )}
        <Button
          disabled={exportCount === 0}
          onClick={handleExportFile}
          size="xs"
          variant="ghost"
        >
          Save…
        </Button>
        <Button
          className="text-destructive hover:bg-destructive/15 hover:text-destructive"
          onClick={handleRemove}
          size="xs"
          variant="ghost"
        >
          Remove
        </Button>
        <Hint label="Clear selection (Esc)">
          <Button onClick={onClear} size="xs" variant="ghost">
            Done
          </Button>
        </Hint>
      </div>
    </section>
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
