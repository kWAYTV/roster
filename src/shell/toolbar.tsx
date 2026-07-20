import { type RefObject, useCallback } from "react";

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
  accountCount: number;
  countLabel: string;
  onCloseSearch: () => void;
  onOpenImport: () => void;
  onOpenSearch: () => void;
  onOpenSettings: () => void;
  onQueryChange: (query: string) => void;
  query: string;
  searchOpen: boolean;
  searchRef: RefObject<HTMLInputElement | null>;
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
  const handleQueryChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onQueryChange(event.target.value);
    },
    [onQueryChange]
  );

  return (
    <header className={styles.toolbar}>
      {searchOpen ? (
        <>
          <SearchIcon
            aria-hidden="true"
            className={styles.searchGlyph}
            size={15}
          />
          <Input
            aria-label="Filter accounts"
            className={styles.searchInput}
            onChange={handleQueryChange}
            placeholder="Filter accounts"
            ref={searchRef}
            value={query}
          />
          {accountCount > 0 ? (
            <Badge className={styles.count} variant="secondary">
              {countLabel}
            </Badge>
          ) : null}
          <Hint label="Close search">
            <Button
              aria-label="Close search"
              onClick={onCloseSearch}
              size="icon-sm"
              type="button"
              variant="ghost"
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
              <Badge className={styles.count} variant="secondary">
                {accountCount}
              </Badge>
            ) : null}
          </div>
          <div className={styles.actions}>
            <Hint label="Import">
              <Button
                aria-label="Import"
                onClick={onOpenImport}
                size="icon-sm"
                type="button"
                variant="ghost"
              >
                <PlusIcon size={16} />
              </Button>
            </Hint>
            <Hint label="Search accounts">
              <Button
                aria-label="Search accounts"
                onClick={onOpenSearch}
                size="icon-sm"
                type="button"
                variant="ghost"
              >
                <SearchIcon size={16} />
              </Button>
            </Hint>
            <Hint label="Settings">
              <Button
                aria-label="Settings"
                onClick={onOpenSettings}
                size="icon-sm"
                type="button"
                variant="ghost"
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
