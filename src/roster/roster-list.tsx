import { AccountRow } from "./account-row";
import type { AccountView } from "./account";
import type { StatusMap } from "../status/status";
import styles from "./roster-list.module.css";

interface RosterListProps {
  accounts: AccountView[];
  loading: boolean;
  streamer: boolean;
  pending: string | null;
  statuses: StatusMap;
  onSignIn: (steamid: string) => void;
  onRemove: (account: AccountView) => void;
}

export function RosterList({
  accounts,
  loading,
  streamer,
  pending,
  statuses,
  onSignIn,
  onRemove,
}: RosterListProps) {
  if (accounts.length === 0) {
    // Render nothing during the first fetch so users never see a false
    // "No accounts yet" flash before the roster arrives.
    if (loading) {
      return null;
    }
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
