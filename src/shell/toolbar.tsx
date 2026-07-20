import { type RefObject } from "react";

import { PlusIcon } from "@/ui/icons/plus";
import { SearchIcon } from "@/ui/icons/search";
import { SettingsIcon } from "@/ui/icons/settings";
import { XIcon } from "@/ui/icons/x";
import { Badge } from "@/ui/primitives/badge";
import { Button } from "@/ui/primitives/button";
import { Input } from "@/ui/primitives/input";
import { Hint } from "@/ui/widgets/hint";

import styles from "./shell.module.css";

interface ToolbarProps {
  searchOpen: boolean;
  query: string;
  countLabel: string;
  accountCount: number;
  searchRef: RefObject<HTMLInputElement | null>;
  onQueryChange: (query: string) => void;
  onOpenSearch: () => void;
  onCloseSearch: () => void;
  onOpenImport: () => void;
  onOpenSettings: () => void;
}

export function Toolbar({
  searchOpen,
  query,
  countLabel,
  accountCount,
  searchRef,
  onQueryChange,
  onOpenSearch,
  onCloseSearch,
  onOpenImport,
  onOpenSettings,
}: ToolbarProps) {
  return (
    <header className={styles.toolbar}>
      {searchOpen ? (
        <>
          <SearchIcon size={15} className={styles.searchGlyph} aria-hidden="true" />
          <Input
            ref={searchRef}
            className={styles.searchInput}
            placeholder="Filter accounts"
            aria-label="Filter accounts"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
          />
          {accountCount > 0 ? (
            <Badge variant="secondary" className={styles.count}>
              {countLabel}
            </Badge>
          ) : null}
          <Hint label="Close search">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Close search"
              onClick={onCloseSearch}
            >
              <XIcon size={16} />
            </Button>
          </Hint>
        </>
      ) : (
        <>
          <div className={styles.brand}>
            <span className={styles.title}>Roster</span>
            {accountCount > 0 ? (
              <Badge variant="secondary" className={styles.count}>
                {accountCount}
              </Badge>
            ) : null}
          </div>
          <div className={styles.actions}>
            <Hint label="Import">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Import"
                onClick={onOpenImport}
              >
                <PlusIcon size={16} />
              </Button>
            </Hint>
            <Hint label="Search accounts">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Search accounts"
                onClick={onOpenSearch}
              >
                <SearchIcon size={16} />
              </Button>
            </Hint>
            <Hint label="Settings">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Settings"
                onClick={onOpenSettings}
              >
                <SettingsIcon size={16} />
              </Button>
            </Hint>
          </div>
        </>
      )}
    </header>
  );
}
