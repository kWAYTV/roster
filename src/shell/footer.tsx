import { useCallback } from "react";

import { Button } from "@/ui/primitives/button";

import { commands } from "../platform/invoke";
import styles from "./shell.module.css";

const GITHUB_REPO = "https://github.com/kWAYTV/roster";

interface FooterProps {
  currentVersion: string | null;
}

export function Footer({ currentVersion }: FooterProps) {
  const openGitHub = useCallback(() => {
    commands.openExternalUrl(GITHUB_REPO).catch(() => undefined);
  }, []);

  return (
    <footer className={styles.foot}>
      <Button
        className="h-auto px-0"
        onClick={openGitHub}
        size="sm"
        type="button"
        variant="link"
      >
        GitHub
      </Button>
      <span className={styles.version}>v{currentVersion ?? "…"}</span>
    </footer>
  );
}
