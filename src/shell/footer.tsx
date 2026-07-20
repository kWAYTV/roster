import { Button } from "@/ui/primitives/button";

import { commands } from "../platform/invoke";
import styles from "./shell.module.css";

const GITHUB_REPO = "https://github.com/kWAYTV/roster";

interface FooterProps {
  currentVersion: string | null;
}

export function Footer({ currentVersion }: FooterProps) {
  return (
    <footer className={styles.foot}>
      <Button
        type="button"
        variant="link"
        size="sm"
        className="h-auto px-0"
        onClick={() => void commands.openExternalUrl(GITHUB_REPO)}
      >
        GitHub
      </Button>
      <span className={styles.version}>v{currentVersion ?? "…"}</span>
    </footer>
  );
}
