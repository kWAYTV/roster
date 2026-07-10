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

  return (
    <div className={styles.bar}>
      <span className={styles.label}>{count} selected</span>
      <div className={styles.actions}>
        <select
          className={`field ${styles.select}`}
          defaultValue=""
          onChange={(event) => {
            const seconds = Number(event.target.value);
            if (seconds > 0) {
              onCooldown(seconds);
              event.target.value = "";
            }
          }}
        >
          <option value="" disabled>
            Set cooldown…
          </option>
          {COOLDOWN_PRESETS.map((preset) => (
            <option key={preset.seconds} value={preset.seconds}>
              {preset.label}
            </option>
          ))}
        </select>
        <button className="btn btn-ghost btn-sm" onClick={onClearCooldown}>
          Clear CD
        </button>
        <button
          className="btn btn-ghost btn-sm"
          disabled={exportCount === 0}
          onClick={onCopyExport}
        >
          Copy {exportCount}
        </button>
        <button className="btn btn-ghost btn-sm btn-ghost-danger" onClick={onRemove}>
          Remove
        </button>
        <button className="btn btn-ghost btn-sm" onClick={onClear}>
          Done
        </button>
      </div>
    </div>
  );
}
