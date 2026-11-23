import {
  type ChangeEvent,
  type ReactNode,
  type RefObject,
  useCallback,
} from "react";

import { PlusIcon } from "@/ui/icons/plus";
import { SearchIcon } from "@/ui/icons/search";
import { SettingsIcon } from "@/ui/icons/settings";
import { XIcon } from "@/ui/icons/x";
import { IconAction } from "@/ui/widgets/icon-action";

import type { RosterFilter, RosterSort } from "./filter-accounts";
import styles from "./shell.module.css";
import { ViewMenu } from "./view-menu";

interface ToolbarProps {
  accountCount: number;
  clipboardImport?: ReactNode;
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
  onSearchBlur: () => void;
  onSelectAll: () => void;
  onSort: (sort: RosterSort) => void;
  onToggleGroupByTag: () => void;
  query: string;
  searchOpen: boolean;
  searchRef: RefObject<HTMLInputElement | null>;
  selectionMenu?: ReactNode;
  sort: RosterSort;
}

export function Toolbar({
  searchOpen,
  searchRef,
  query,
  countLabel,
  accountCount,
  clipboardImport,
  filter,
  sort,
  groupByTag,
  onQueryChange,
  onOpenSearch,
  onCloseSearch,
  onSearchBlur,
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
    (event: ChangeEvent<HTMLInputElement>) => {
      onQueryChange(event.target.value);
    },
    [onQueryChange]
  );

  const handleOpenImport = useCallback(() => {
    onOpenImport();
  }, [onOpenImport]);

  const hasAccounts = accountCount > 0;
  const showKeycap = !(searchOpen || query);

  return (
    <header className={styles.toolbar} data-enter="chrome">
      <div className={styles.brand}>
        <span className={styles.title}>Roster</span>
        {hasAccounts ? (
          <span className={styles.count}>{countLabel}</span>
        ) : null}
      </div>
      {selectionMenu}

      {hasAccounts ? (
        <div className={styles.search} data-active={searchOpen || !!query}>
          <SearchIcon
            aria-hidden="true"
            className={styles.searchGlyph}
            size={14}
          />
          <input
            aria-label="Filter accounts"
            className={styles.searchInput}
            onBlur={onSearchBlur}
            onChange={handleQueryChange}
            onFocus={onOpenSearch}
            placeholder="Filter"
            ref={searchRef}
            spellCheck={false}
            value={query}
          />
          {showKeycap ? <kbd className={styles.keycap}>Ctrl F</kbd> : null}
          {query ? (
            <IconAction
              className="size-5 text-muted-foreground"
              icon={<XIcon />}
              iconSize={12}
              label="Clear filter"
              onClick={onCloseSearch}
              size="icon-xs"
              variant="ghost"
            />
          ) : null}
        </div>
      ) : (
        <div className={styles.spacer} />
      )}

      <div className={styles.actions}>
        {clipboardImport}
        <IconAction
          icon={<PlusIcon />}
          label="Import accounts"
          onClick={handleOpenImport}
          size="icon-sm"
          variant="ghost"
        />
        <ViewMenu
          filter={filter}
          groupByTag={groupByTag}
          onFilter={onFilter}
          onInvertSelection={onInvertSelection}
          onSelectAll={onSelectAll}
          onSort={onSort}
          onToggleGroupByTag={onToggleGroupByTag}
          sort={sort}
          visible={hasAccounts}
        />
        <IconAction
          icon={<SettingsIcon />}
          label="Settings"
          onClick={onOpenSettings}
          size="icon-sm"
          variant="ghost"
        />
      </div>
    </header>
  );
}
