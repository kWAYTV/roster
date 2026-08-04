import { useCallback } from "react";

import { Button } from "@/ui/primitives/button";

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
    <footer className={styles.foot}>
      <div className={styles.footLeft}>
        <Button
          className="h-auto px-0 font-mono text-[10px] uppercase tracking-wider"
          onClick={openGitHub}
          size="sm"
          type="button"
          variant="link"
        >
          GitHub
        </Button>
        <span
          className={steamRunning ? styles.steamOn : styles.steamOff}
          title={steamRunning ? "Steam is running" : "Steam is not running"}
        >
          {steamRunning ? "Steam / live" : "Steam / idle"}
        </span>
      </div>
      <span className={styles.version}>v{currentVersion ?? "…"}</span>
    </footer>
  );
}
