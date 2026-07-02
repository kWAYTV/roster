import { useState } from "react";

import { COOLDOWN_PRESETS, isCooldownActive } from "./cooldown";
import { CooldownDialog } from "./cooldown-dialog";
import { useCooldown } from "./use-cooldown";
import styles from "./cooldown-menu.module.css";

interface CooldownMenuProps {
  steamid: string;
  until: number;
  disabled: boolean;
}

/// A clock button that opens preset durations, plus clear when one is active.
export function CooldownMenu({ steamid, until, disabled }: CooldownMenuProps) {
  const [open, setOpen] = useState(false);
  const [customOpen, setCustomOpen] = useState(false);
  const { start, clear } = useCooldown();

  const pick = (action: () => void) => {
    setOpen(false);
    action();
  };

  return (
    <div className={styles.wrap}>
      <button
        className="btn-icon"
        aria-label="Set cooldown"
        title="Set cooldown"
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
      >
        <ClockIcon />
      </button>
      {open ? (
        <>
          <div className={styles.backdrop} onClick={() => setOpen(false)} />
          <div className={styles.menu} role="menu">
            <div className={styles.heading}>Cooldown</div>
            {COOLDOWN_PRESETS.map((preset) => (
              <button
                key={preset.seconds}
                className={styles.item}
                onClick={() => pick(() => start(steamid, preset.seconds))}
              >
                {preset.label}
              </button>
            ))}
            <button className={styles.item} onClick={() => pick(() => setCustomOpen(true))}>
              Custom&hellip;
            </button>
            {isCooldownActive(until) ? (
              <button
                className={`${styles.item} ${styles.clear}`}
                onClick={() => pick(() => clear(steamid))}
              >
                Clear cooldown
              </button>
            ) : null}
          </div>
        </>
      ) : null}
      <CooldownDialog
        open={customOpen}
        onClose={() => setCustomOpen(false)}
        onStart={(seconds) => start(steamid, seconds)}
      />
    </div>
  );
}

function ClockIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
