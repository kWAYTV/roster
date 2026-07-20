import { useCallback, useState } from "react";

import type { RosterFilter, RosterSort } from "./filter-accounts";

export function useRosterView() {
  const [filter, setFilter] = useState<RosterFilter>("all");
  const [sort, setSort] = useState<RosterSort>("default");

  const cycleFilter = useCallback((next: RosterFilter) => {
    setFilter((current) => (current === next ? "all" : next));
  }, []);

  return { cycleFilter, filter, setFilter, setSort, sort };
}
