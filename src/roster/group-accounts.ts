import type { AccountView } from "./account";

export const UNTAGGED_GROUP = "untagged";

export interface TagGroup {
  accounts: AccountView[];
  key: string;
  label: string;
}

/// First tag is the primary group. Untagged last. Null when grouping is a no-op.
export function groupAccountsByTag(accounts: AccountView[]): TagGroup[] | null {
  if (!accounts.some((account) => account.tags.length > 0)) {
    return null;
  }

  const tagged = new Map<string, AccountView[]>();
  const untagged: AccountView[] = [];

  for (const account of accounts) {
    const [tag] = account.tags;
    if (!tag) {
      untagged.push(account);
      continue;
    }
    const list = tagged.get(tag) ?? [];
    list.push(account);
    tagged.set(tag, list);
  }

  const groups = [...tagged.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([tag, items]) => ({
      accounts: items,
      key: tag,
      label: `#${tag}`,
    }));

  if (untagged.length > 0) {
    groups.push({
      accounts: untagged,
      key: UNTAGGED_GROUP,
      label: "Untagged",
    });
  }

  return groups;
}
