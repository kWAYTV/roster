import { useCallback } from "react";

import { Button } from "@/ui/primitives/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/ui/primitives/dropdown-menu";

import type { RosterFilter, RosterSort } from "./filter-accounts";
import styles from "./shell.module.css";

const FILTERS: { id: RosterFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "pinned", label: "Pinned" },
  { id: "cooldown", label: "Cooldown" },
  { id: "expired", label: "Expired" },
  { id: "online", label: "Online" },
  { id: "offline", label: "Offline" },
];

const SORTS: { id: RosterSort; label: string }[] = [
  { id: "default", label: "Default" },
  { id: "last_used", label: "Last used" },
  { id: "name", label: "Name" },
  { id: "jwt", label: "JWT expiry" },
];

interface FilterBarProps {
  filter: RosterFilter;
  onFilter: (filter: RosterFilter) => void;
  onInvertSelection: () => void;
  onSelectAll: () => void;
  onSort: (sort: RosterSort) => void;
  sort: RosterSort;
  visible: boolean;
}

export function FilterBar({
  visible,
  filter,
  sort,
  onFilter,
  onSort,
  onSelectAll,
  onInvertSelection,
}: FilterBarProps) {
  const handleFilterClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      const id = event.currentTarget.dataset.filter as RosterFilter | undefined;
      if (id) {
        onFilter(id);
      }
    },
    [onFilter]
  );

  const handleSortClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const id = event.currentTarget.dataset.sort as RosterSort | undefined;
      if (id) {
        onSort(id);
      }
    },
    [onSort]
  );

  if (!visible) {
    return null;
  }

  const sortLabel = SORTS.find((item) => item.id === sort)?.label ?? "Default";

  return (
    <div className={styles.filterBar}>
      <div className={styles.filterChips}>
        {FILTERS.map((item) => (
          <Button
            className={styles.filterChip}
            data-filter={item.id}
            key={item.id}
            onClick={handleFilterClick}
            size="xs"
            variant={filter === item.id ? "default" : "ghost"}
          >
            {item.label}
          </Button>
        ))}
      </div>
      <div className={styles.filterActions}>
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button size="xs" variant="outline" />}>
            Sort: {sortLabel}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-36">
            {SORTS.map((item) => (
              <DropdownMenuItem
                data-sort={item.id}
                key={item.id}
                onClick={handleSortClick}
              >
                {item.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <Button onClick={onSelectAll} size="xs" variant="ghost">
          All
        </Button>
        <Button onClick={onInvertSelection} size="xs" variant="ghost">
          Invert
        </Button>
      </div>
    </div>
  );
}
