import { useCallback } from "react";

import { CheckIcon } from "@/ui/icons/check";
import { ListFilterIcon } from "@/ui/icons/list-filter";
import { Button } from "@/ui/primitives/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/ui/primitives/dropdown-menu";

import type { RosterFilter, RosterSort } from "./filter-accounts";

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

interface ViewMenuProps {
  filter: RosterFilter;
  onFilter: (filter: RosterFilter) => void;
  onInvertSelection: () => void;
  onSelectAll: () => void;
  onSort: (sort: RosterSort) => void;
  sort: RosterSort;
  visible: boolean;
}

export function ViewMenu({
  visible,
  filter,
  sort,
  onFilter,
  onSort,
  onSelectAll,
  onInvertSelection,
}: ViewMenuProps) {
  const active = filter !== "all" || sort !== "default";

  const handleFilterClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            aria-label={active ? viewHint(filter, sort) : "View"}
            size="icon-sm"
            title={active ? viewHint(filter, sort) : "View"}
            type="button"
            variant={active ? "secondary" : "ghost"}
          />
        }
      >
        <ListFilterIcon size={16} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-auto min-w-44">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Filter</DropdownMenuLabel>
          {FILTERS.map((item) => (
            <DropdownMenuItem
              data-filter={item.id}
              key={item.id}
              onClick={handleFilterClick}
            >
              <span className="w-4 shrink-0">
                {filter === item.id ? <CheckIcon size={14} /> : null}
              </span>
              {item.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel>Sort</DropdownMenuLabel>
          {SORTS.map((item) => (
            <DropdownMenuItem
              data-sort={item.id}
              key={item.id}
              onClick={handleSortClick}
            >
              <span className="w-4 shrink-0">
                {sort === item.id ? <CheckIcon size={14} /> : null}
              </span>
              {item.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onSelectAll}>
          Select all
          <DropdownMenuShortcut>Ctrl+A</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onInvertSelection}>
          Invert selection
          <DropdownMenuShortcut>Ctrl+I</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function viewHint(filter: RosterFilter, sort: RosterSort): string {
  const filterLabel =
    FILTERS.find((item) => item.id === filter)?.label ?? "All";
  const sortLabel = SORTS.find((item) => item.id === sort)?.label ?? "Default";
  if (filter !== "all" && sort !== "default") {
    return `${filterLabel} · ${sortLabel}`;
  }
  if (filter !== "all") {
    return `Filter: ${filterLabel}`;
  }
  return `Sort: ${sortLabel}`;
}
