import { useCallback, useState } from "react";

import type { RosterFilter, RosterSort } from "./filter-accounts";

export function useRosterView() {
  const [filter, setFilter] = useState<RosterFilter>("all");
  const [sort, setSort] = useState<RosterSort>("default");
  const [groupByTag, setGroupByTag] = useState(true);

  const cycleFilter = useCallback((next: RosterFilter) => {
    setFilter((current) => (current === next ? "all" : next));
  }, []);

  const toggleGroupByTag = useCallback(() => {
    setGroupByTag((current) => !current);
  }, []);

  return {
    cycleFilter,
    filter,
    groupByTag,
    setFilter,
    setSort,
    sort,
    toggleGroupByTag,
  };
}
