import { formatRemaining } from "../cooldown/cooldown";
import type { AccountView } from "../roster/account";

export function removeMessage(accounts: AccountView[], streamer: boolean): string {
  if (!accounts.length) {
    return "";
  }
  if (accounts.length > 1) {
    return `Remove ${accounts.length} accounts?`;
  }
  const name = streamer ? "this account" : accounts[0].display_name;
  return `Remove ${name}?`;
}

export function cooldownMessage(account: AccountView | null, streamer: boolean): string {
  if (!account) {
    return "";
  }
  const name = streamer ? "This account" : account.display_name;
  const remaining = formatRemaining(account.cooldown_until);
  return remaining
    ? `${name} is on cooldown for another ${remaining}. Sign in anyway?`
    : `${name} is on cooldown. Sign in anyway?`;
}
