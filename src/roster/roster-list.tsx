import { AccountRow } from "./account-row";
import type { AccountView } from "./account";
import styles from "./roster-list.module.css";

interface RosterListProps {
  accounts: AccountView[];
  streamer: boolean;
  pending: string | null;
  onSignIn: (steamid: string) => void;
  onRemove: (account: AccountView) => void;
}

export function RosterList({ accounts, streamer, pending, onSignIn, onRemove }: RosterListProps) {
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
          onSignIn={onSignIn}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
}
