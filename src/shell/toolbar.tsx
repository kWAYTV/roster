import { useCallback } from "react";

import { PlusIcon } from "@/ui/icons/plus";
import { SearchIcon } from "@/ui/icons/search";
import { SettingsIcon } from "@/ui/icons/settings";
import { XIcon } from "@/ui/icons/x";
import { Badge } from "@/ui/primitives/badge";
import { Button } from "@/ui/primitives/button";
import { Input } from "@/ui/primitives/input";
import { Hint } from "@/ui/widgets/hint";

import type { RosterFilter, RosterSort } from "./filter-accounts";
import styles from "./shell.module.css";
import { ViewMenu } from "./view-menu";

interface ToolbarProps {
  accountCount: number;
  countLabel: string;
  filter: RosterFilter;
  onCloseSearch: () => void;
  onFilter: (filter: RosterFilter) => void;
  onInvertSelection: () => void;
  onOpenImport: () => void;
  onOpenSearch: () => void;
  onOpenSettings: () => void;
  onQueryChange: (query: string) => void;
  onSelectAll: () => void;
  onSort: (sort: RosterSort) => void;
  query: string;
  searchOpen: boolean;
  sort: RosterSort;
}

export function Toolbar({
  searchOpen,
  query,
  countLabel,
  accountCount,
  filter,
  sort,
  onQueryChange,
  onOpenSearch,
  onCloseSearch,
  onOpenImport,
  onOpenSettings,
  onFilter,
  onSort,
  onSelectAll,
  onInvertSelection,
}: ToolbarProps) {
  const handleQueryChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onQueryChange(event.target.value);
    },
    [onQueryChange]
  );

  const viewMenu = (
    <ViewMenu
      filter={filter}
      onFilter={onFilter}
      onInvertSelection={onInvertSelection}
      onSelectAll={onSelectAll}
      onSort={onSort}
      sort={sort}
      visible={accountCount > 0}
    />
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
            autoFocus
            className={styles.searchInput}
            onChange={handleQueryChange}
            placeholder="Filter accounts"
            value={query}
          />
          {accountCount > 0 ? (
            <Badge className={styles.count} variant="secondary">
              {countLabel}
            </Badge>
          ) : null}
          {viewMenu}
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
                {countLabel}
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
            {viewMenu}
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
