import { isCooldownActive } from "../cooldown/cooldown";
import type { AccountView } from "../roster/account";
import type { StatusMap } from "../status/status";

export type RosterFilter =
  | "all"
  | "pinned"
  | "cooldown"
  | "expired"
  | "online"
  | "offline";

export type RosterSort = "default" | "last_used" | "name" | "jwt";

export function filterAccounts(
  accounts: AccountView[],
  query: string,
  filter: RosterFilter,
  statuses: StatusMap,
  nowSeconds: number
): AccountView[] {
  const needle = query.trim().toLowerCase();
  return accounts.filter((account) => {
    if (!matchesFilter(account, filter, statuses, nowSeconds)) {
      return false;
    }
    if (!needle) {
      return true;
    }
    return `${account.display_name} ${account.account_name} ${account.note}`
      .toLowerCase()
      .includes(needle);
  });
}

export function sortAccounts(
  accounts: AccountView[],
  sort: RosterSort
): AccountView[] {
  if (sort === "default") {
    return accounts;
  }
  const next = [...accounts];
  next.sort((a, b) => {
    const pin = Number(b.pinned) - Number(a.pinned);
    if (pin !== 0) {
      return pin;
    }
    switch (sort) {
      case "last_used":
        return b.last_used - a.last_used || nameCmp(a, b);
      case "name":
        return nameCmp(a, b);
      case "jwt":
        return jwtRank(a) - jwtRank(b) || nameCmp(a, b);
      default:
        return 0;
    }
  });
  return next;
}

function matchesFilter(
  account: AccountView,
  filter: RosterFilter,
  statuses: StatusMap,
  nowSeconds: number
): boolean {
  switch (filter) {
    case "all":
      return true;
    case "pinned":
      return account.pinned;
    case "cooldown":
      return isCooldownActive(account.cooldown_until, nowSeconds);
    case "expired":
      return account.jwt_expires_in < 0;
    case "online": {
      const state = statuses[account.steamid]?.state;
      return state === "online" || state === "in-game";
    }
    case "offline": {
      const state = statuses[account.steamid]?.state;
      return !state || state === "offline";
    }
    default:
      return true;
  }
}

function nameCmp(a: AccountView, b: AccountView): number {
  return a.display_name.localeCompare(b.display_name);
}

/** Lower rank sorts first: unknown, soonest expiry, then expired last. */
function jwtRank(account: AccountView): number {
  if (account.jwt_expires_in === 0) {
    return Number.MAX_SAFE_INTEGER - 1;
  }
  if (account.jwt_expires_in < 0) {
    return Number.MAX_SAFE_INTEGER;
  }
  return account.jwt_expires_in;
}
