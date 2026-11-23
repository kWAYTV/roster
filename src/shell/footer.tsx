import { useCallback } from "react";

import { StatusLine } from "../feedback/status-line";
import { commands } from "../platform/invoke";
import { useSteamRunning } from "../status/use-steam-running";
import styles from "./shell.module.css";

const GITHUB_REPO = "https://github.com/kWAYTV/roster";

interface FooterProps {
  currentVersion: string | null;
}

export function Footer({ currentVersion }: FooterProps) {
  const steamRunning = useSteamRunning();

  const openGitHub = useCallback(() => {
    commands.openExternalUrl(GITHUB_REPO).catch(() => undefined);
  }, []);

  return (
    <footer className={styles.foot} data-enter="chrome">
      <StatusLine />
      <div className={styles.footMeta}>
        <span
          className={styles.steam}
          data-running={steamRunning}
          title={steamRunning ? "Steam is running" : "Steam is not running"}
        >
          <span aria-hidden="true" className={styles.steamDot} />
          {steamRunning ? "Steam running" : "Steam closed"}
        </span>
        <button className={styles.footLink} onClick={openGitHub} type="button">
          GitHub
        </button>
        <span className={styles.version}>v{currentVersion ?? "…"}</span>
      </div>
    </footer>
  );
}
