import { useCallback } from "react";

import { Button } from "@/ui/primitives/button";

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
    <footer className={styles.foot}>
      <StatusLine />
      <div className={styles.footMeta}>
        <span
          className={steamRunning ? styles.steamOn : styles.steamOff}
          title={steamRunning ? "Steam is running" : "Steam is not running"}
        >
          {steamRunning ? "Steam" : "Steam off"}
        </span>
        <Button
          className="h-auto px-0 text-muted-foreground text-xs hover:text-foreground"
          onClick={openGitHub}
          size="sm"
          type="button"
          variant="link"
        >
          GitHub
        </Button>
        <span className={styles.version}>v{currentVersion ?? "…"}</span>
      </div>
    </footer>
  );
}
