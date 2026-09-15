import { type ReactNode, useCallback } from "react";

import { PlusIcon } from "@/ui/icons/plus";
import { SearchIcon } from "@/ui/icons/search";
import { SettingsIcon } from "@/ui/icons/settings";
import { XIcon } from "@/ui/icons/x";
import { Badge } from "@/ui/primitives/badge";
import { Input } from "@/ui/primitives/input";
import { IconAction } from "@/ui/widgets/icon-action";

import type { RosterFilter, RosterSort } from "./filter-accounts";
import styles from "./shell.module.css";
import { ViewMenu } from "./view-menu";

interface ToolbarProps {
  accountCount: number;
  countLabel: string;
  filter: RosterFilter;
  groupByTag: boolean;
  onCloseSearch: () => void;
  onFilter: (filter: RosterFilter) => void;
  onInvertSelection: () => void;
  onOpenImport: () => void;
  onOpenSearch: () => void;
  onOpenSettings: () => void;
  onQueryChange: (query: string) => void;
  onSelectAll: () => void;
  onSort: (sort: RosterSort) => void;
  onToggleGroupByTag: () => void;
  query: string;
  searchOpen: boolean;
  selectionMenu?: ReactNode;
  sort: RosterSort;
}

export function Toolbar({
  searchOpen,
  query,
  countLabel,
  accountCount,
  filter,
  sort,
  groupByTag,
  onQueryChange,
  onOpenSearch,
  onCloseSearch,
  onOpenImport,
  onOpenSettings,
  onFilter,
  onSort,
  onToggleGroupByTag,
  onSelectAll,
  onInvertSelection,
  selectionMenu,
}: ToolbarProps) {
  const handleQueryChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onQueryChange(event.target.value);
    },
    [onQueryChange]
  );

  const handleOpenImport = useCallback(() => {
    onOpenImport();
  }, [onOpenImport]);

  const viewMenu = (
    <ViewMenu
      filter={filter}
      groupByTag={groupByTag}
      onFilter={onFilter}
      onInvertSelection={onInvertSelection}
      onSelectAll={onSelectAll}
      onSort={onSort}
      onToggleGroupByTag={onToggleGroupByTag}
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
          {selectionMenu}
          {viewMenu}
          <IconAction
            icon={<XIcon />}
            label="Close search"
            onClick={onCloseSearch}
            size="icon-sm"
            variant="ghost"
          />
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
            {selectionMenu}
          </div>
          <div className={styles.actions}>
            <IconAction
              icon={<PlusIcon />}
              label="Import"
              onClick={handleOpenImport}
              size="icon-sm"
              variant="ghost"
            />
            <IconAction
              icon={<SearchIcon />}
              label="Search accounts"
              onClick={onOpenSearch}
              size="icon-sm"
              variant="ghost"
            />
            {viewMenu}
            <IconAction
              icon={<SettingsIcon />}
              label="Settings"
              onClick={onOpenSettings}
              size="icon-sm"
              variant="ghost"
            />
          </div>
        </>
      )}
    </header>
  );
}
