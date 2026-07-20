import { ChevronDownIcon } from "@/ui/icons/chevron-down";
import { Hint } from "@/ui/widgets/hint";
import { Button } from "@/ui/primitives/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/ui/primitives/dropdown-menu";
import { COOLDOWN_PRESETS } from "../cooldown/cooldown";
import styles from "./bulk-bar.module.css";

interface BulkBarProps {
  count: number;
  exportCount: number;
  onClear: () => void;
  onCooldown: (seconds: number) => void;
  onClearCooldown: () => void;
  onCopyExport: () => void;
  onRemove: () => void;
}

export function BulkBar({
  count,
  exportCount,
  onClear,
  onCooldown,
  onClearCooldown,
  onCopyExport,
  onRemove,
}: BulkBarProps) {
  if (count < 2) {
    return null;
  }

  const copyLabel =
    exportCount === 0
      ? "Copy"
      : exportCount === count
        ? `Copy ${exportCount}`
        : `Copy ${exportCount}/${count}`;

  return (
    <div className={styles.bar}>
      <span className={styles.label}>{count} selected</span>
      <div className={styles.actions}>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button variant="outline" size="xs" className={styles.cooldownBtn} />}
          >
            Cooldown
            <ChevronDownIcon size={14} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-36 w-auto">
            {COOLDOWN_PRESETS.map((preset) => (
              <DropdownMenuItem
                key={preset.seconds}
                onClick={() => onCooldown(preset.seconds)}
              >
                {preset.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <Button variant="ghost" size="xs" onClick={onClearCooldown}>
          Clear CD
        </Button>
        {exportCount < count ? (
          <Hint
            label={
              exportCount === 0
                ? "No saved tokens on selected accounts"
                : `${count - exportCount} selected account(s) have no saved token`
            }
          >
            <Button
              variant="ghost"
              size="xs"
              disabled={exportCount === 0}
              onClick={onCopyExport}
            >
              {copyLabel}
            </Button>
          </Hint>
        ) : (
          <Button variant="ghost" size="xs" onClick={onCopyExport}>
            {copyLabel}
          </Button>
        )}
        <Button
          variant="ghost"
          size="xs"
          className="text-destructive hover:bg-destructive/15 hover:text-destructive"
          onClick={onRemove}
        >
          Remove
        </Button>
        <Button variant="ghost" size="xs" onClick={onClear}>
          Done
        </Button>
      </div>
    </div>
  );
}
