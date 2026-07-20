import type { AccountView } from "../roster/account";

export function filterAccounts(
  accounts: AccountView[],
  query: string
): AccountView[] {
  const needle = query.trim().toLowerCase();
  if (!needle) {
    return accounts;
  }
  return accounts.filter((account) =>
    `${account.display_name} ${account.account_name}`
      .toLowerCase()
      .includes(needle)
  );
}
