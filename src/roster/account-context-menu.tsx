import { useEffect, useLayoutEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";

import { COOLDOWN_PRESETS } from "../cooldown/cooldown";
import type { AccountView } from "./account";
import styles from "./account-context-menu.module.css";

interface AccountContextMenuProps {
  account: AccountView;
  targets: AccountView[];
  exportCount: number;
  streamer: boolean;
  anchor: { x: number; y: number };
  onClose: () => void;
  onSignIn: (steamid: string) => void;
  onCopyUsername: (account: AccountView) => void;
  onOpenProfile: (steamid: string) => void;
  onCopyExport: (steamids: string[]) => void;
  onExportFile: (steamids: string[]) => void;
  onRemove: (accounts: AccountView[]) => void;
  onCooldown: (steamids: string[], seconds: number) => void;
  onClearCooldown: (steamids: string[]) => void;
  onCustomCooldown: (steamids: string[]) => void;
}

export function AccountContextMenu(props: AccountContextMenuProps) {
  const {
    account,
    targets,
    exportCount,
    streamer,
    anchor,
    onClose,
    onSignIn,
    onCopyUsername,
    onOpenProfile,
    onCopyExport,
    onExportFile,
    onRemove,
    onCooldown,
    onClearCooldown,
    onCustomCooldown,
  } = props;

  const menuRef = useRef<HTMLDivElement>(null);
  const multi = targets.length > 1;
  const hasCooldown = targets.some((item) => item.cooldown_until > 0);
  const steamids = targets.map((item) => item.steamid);

  useEffect(() => {
    const onPointer = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("mousedown", onPointer);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onPointer);
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  useLayoutEffect(() => {
    const menu = menuRef.current;
    if (!menu) {
      return;
    }

    const pad = 8;
    const rect = menu.getBoundingClientRect();
    let x = anchor.x;
    let y = anchor.y;

    if (x > window.innerWidth * 0.45) {
      x -= rect.width;
    }
    if (x + rect.width > window.innerWidth - pad) {
      x = window.innerWidth - rect.width - pad;
    }
    if (x < pad) {
      x = pad;
    }
    if (y + rect.height > window.innerHeight - pad) {
      y = window.innerHeight - rect.height - pad;
    }
    if (y < pad) {
      y = pad;
    }

    menu.style.left = `${x}px`;
    menu.style.top = `${y}px`;
  }, [anchor, multi, exportCount, hasCooldown]);

  const pick = (action: () => void) => {
    onClose();
    action();
  };

  return createPortal(
    <>
      <div className={styles.backdrop} onClick={onClose} />
      <div
        ref={menuRef}
        className={styles.menu}
        role="menu"
        style={{ left: anchor.x, top: anchor.y }}
      >
        {multi ? <div className={styles.banner}>{targets.length} selected</div> : null}

        {!multi ? (
          <button className={styles.item} onClick={() => pick(() => onSignIn(account.steamid))}>
            Sign in
          </button>
        ) : null}

        {!multi ? (
          <>
            <SectionLabel>Account</SectionLabel>
            <button
              className={styles.item}
              disabled={streamer}
              onClick={() => pick(() => onCopyUsername(account))}
            >
              Copy username
            </button>
            <button
              className={styles.item}
              onClick={() => pick(() => onOpenProfile(account.steamid))}
            >
              Open profile
            </button>
          </>
        ) : null}

        <SectionLabel>Export{exportCount > 0 ? ` · ${exportCount}` : ""}</SectionLabel>
        <button
          className={styles.item}
          disabled={exportCount === 0}
          onClick={() => pick(() => onCopyExport(steamids))}
        >
          Copy {exportCount === 1 ? "token" : "tokens"}
        </button>
        <button
          className={styles.item}
          disabled={exportCount === 0}
          onClick={() => pick(() => onExportFile(steamids))}
        >
          Save to file
        </button>

        <SectionLabel>Cooldown</SectionLabel>
        <div className={styles.presetGrid}>
          {COOLDOWN_PRESETS.map((preset) => (
            <button
              key={preset.seconds}
              className={styles.preset}
              onClick={() => pick(() => onCooldown(steamids, preset.seconds))}
            >
              {preset.label}
            </button>
          ))}
        </div>
        <button className={styles.item} onClick={() => pick(() => onCustomCooldown(steamids))}>
          Custom duration
        </button>
        {hasCooldown ? (
          <button
            className={`${styles.item} ${styles.clear}`}
            onClick={() => pick(() => onClearCooldown(steamids))}
          >
            Clear cooldown
          </button>
        ) : null}

        <div className={styles.sep} />
        <button
          className={`${styles.item} ${styles.danger}`}
          onClick={() => pick(() => onRemove(targets))}
        >
          {multi ? `Remove ${targets.length} accounts` : "Remove account"}
        </button>
      </div>
    </>,
    document.body,
  );
}

function SectionLabel({ children }: { children: ReactNode }) {
  return <div className={styles.label}>{children}</div>;
}
