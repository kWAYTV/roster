import { CooldownBadge } from "../cooldown/cooldown-badge";
import { CooldownMenu } from "../cooldown/cooldown-menu";
import type { AccountView } from "./account";
import { formatLastUsed } from "./last-used";
import styles from "./account-row.module.css";

interface AccountRowProps {
  account: AccountView;
  index: number;
  streamer: boolean;
  busy: boolean;
  onSignIn: (steamid: string) => void;
  onRemove: (account: AccountView) => void;
}

export function AccountRow({
  account,
  index,
  streamer,
  busy,
  onSignIn,
  onRemove,
}: AccountRowProps) {
  const name = streamer ? `Account ${index + 1}` : account.display_name;
  const login = streamer ? "\u2022\u2022\u2022\u2022\u2022" : account.account_name;
  const lastUsed = formatLastUsed(account.last_used);

  return (
    <div className={account.most_recent ? `${styles.row} ${styles.recent}` : styles.row}>
      <div className={styles.avatar}>
        {account.avatar ? <img src={account.avatar} alt="" /> : <span>{account.initials}</span>}
      </div>
      <div className={styles.info}>
        <div className={styles.name}>
          {name}
          {account.most_recent ? <span className={styles.badge}>last used</span> : null}
          <CooldownBadge until={account.cooldown_until} duration={account.cooldown_duration} />
        </div>
        <div className={styles.login}>
          {login}
          {lastUsed ? <span className={styles.meta}> &middot; {lastUsed}</span> : null}
        </div>
      </div>
      <div className={styles.actions}>
        <button
          className="btn btn-accent"
          disabled={busy}
          onClick={() => onSignIn(account.steamid)}
        >
          {busy ? "\u2026" : "Sign in"}
        </button>
        <CooldownMenu steamid={account.steamid} until={account.cooldown_until} disabled={busy} />
        <button className="btn btn-ghost" disabled={busy} onClick={() => onRemove(account)}>
          Remove
        </button>
      </div>
    </div>
  );
}
