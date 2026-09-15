import { type MouseEvent, type ReactNode, useCallback, useMemo } from "react";

import { ChevronDownIcon } from "@/ui/icons/chevron-down";
import { Button } from "@/ui/primitives/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/ui/primitives/dropdown-menu";

import { COOLDOWN_PRESETS } from "../cooldown/cooldown";
import type { AccountView } from "./account";

interface SelectionMenuProps {
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

export function SelectionMenu({
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
}: SelectionMenuProps): ReactNode {
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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            aria-label={`${count} selected`}
            className="shrink-0 tabular-nums"
            size="xs"
            variant="secondary"
          />
        }
      >
        {count} selected
        <ChevronDownIcon size={14} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-auto min-w-40">
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Cooldown</DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-auto min-w-36">
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
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuItem onClick={pinAll}>Pin</DropdownMenuItem>
        <DropdownMenuItem onClick={unpinAll}>Unpin</DropdownMenuItem>
        <DropdownMenuItem onClick={handleClearNotes}>
          Clear notes
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={exportCount === 0}
          onClick={handleCopyExport}
        >
          {copyExportLabel(exportCount, count)}
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={exportCount === 0}
          onClick={handleExportFile}
        >
          Save…
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleRemove} variant="destructive">
          Remove
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onClear}>
          Clear selection
          <DropdownMenuShortcut>Esc</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
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
