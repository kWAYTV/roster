import { AccountRow } from "./account-row";
import type { AccountView } from "./account";
import type { StatusMap } from "../status/status";
import styles from "./roster-list.module.css";

interface RosterListProps {
  accounts: AccountView[];
  streamer: boolean;
  pending: string | null;
  statuses: StatusMap;
  onSignIn: (steamid: string) => void;
  onRemove: (account: AccountView) => void;
}

export function RosterList({
  accounts,
  streamer,
  pending,
  statuses,
  onSignIn,
  onRemove,
}: RosterListProps) {
  if (accounts.length === 0) {
    return <div className={styles.empty}>No accounts yet. Import a token to get started.</div>;
  }

  return (
    <div className={styles.list}>
      {accounts.map((account, index) => (
        <AccountRow
          key={account.steamid}
          account={account}
          index={index}
          streamer={streamer}
          busy={pending === account.steamid}
          status={statuses[account.steamid]}
          onSignIn={onSignIn}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
}
