import { useMemo } from "react";

import { ArrowRightIcon } from "@/ui/icons/arrow-right";
import { DeleteIcon } from "@/ui/icons/delete";
import { Hint } from "@/ui/widgets/hint";
import { SpinningLoader } from "@/ui/widgets/spinning-loader";
import { Button } from "@/ui/primitives/button";
import { ContextMenu, ContextMenuTrigger } from "@/ui/primitives/context-menu";
import { CooldownBadge } from "../cooldown/cooldown-badge";
import { CooldownMenu } from "../cooldown/cooldown-menu";
import { StatusDot } from "../status/status-dot";
import type { AccountStatus } from "../status/status";
import type { AccountView } from "./account";
import { AccountContextMenu } from "./account-context-menu";
import { formatLastUsed } from "./last-used";
import { formatJwtExpiry } from "./jwt-label";
import styles from "./account-row.module.css";

interface AccountRowProps {
  account: AccountView;
  index: number;
  streamer: boolean;
  busy: boolean;
  selected: boolean;
  status?: AccountStatus;
  menuTargets: AccountView[];
  exportCount: number;
  onSelect: (account: AccountView, additive: boolean) => void;
  onSignIn: (steamid: string) => void;
  onRemove: (accounts: AccountView[]) => void;
  onCopyUsername: (account: AccountView) => void;
  onOpenProfile: (steamid: string) => void;
  onCopyExport: (steamids: string[]) => void;
  onExportFile: (steamids: string[]) => void;
  onCooldown: (steamids: string[], seconds: number) => void;
  onClearCooldown: (steamids: string[]) => void;
  onCustomCooldown: (steamids: string[]) => void;
}

export function AccountRow({
  account,
  index,
  streamer,
  busy,
  selected,
  status,
  menuTargets,
  exportCount,
  onSelect,
  onSignIn,
  onRemove,
  onCopyUsername,
  onOpenProfile,
  onCopyExport,
  onExportFile,
  onCooldown,
  onClearCooldown,
  onCustomCooldown,
}: AccountRowProps) {
  const name = streamer ? `Account ${index + 1}` : account.display_name;
  const login = streamer ? "\u2022\u2022\u2022\u2022\u2022" : account.account_name;
  const lastUsed = formatLastUsed(account.last_used);
  const game = status?.state === "in-game" ? status.game : "";
  const jwtLabel = formatJwtExpiry(account.jwt_expires_in);
  const rowClass = useMemo(() => {
    const parts = [styles.row];
    if (selected) {
      parts.push(styles.selected);
    }
    return parts.join(" ");
  }, [selected]);

  return (
    <ContextMenu>
      <ContextMenuTrigger
        render={
          <div
            className={rowClass}
            onClick={(event) => onSelect(account, event.ctrlKey || event.metaKey)}
            onDoubleClick={() => onSignIn(account.steamid)}
            onContextMenu={(event) => {
              onSelect(account, event.ctrlKey || event.metaKey);
            }}
          />
        }
      >
        <div className={styles.avatarWrap}>
          <div className={styles.avatar}>
            {streamer ? (
              <span>{index + 1}</span>
            ) : account.avatar ? (
              <img src={account.avatar} alt="" />
            ) : (
              <span>{account.initials}</span>
            )}
          </div>
          <StatusDot status={status} />
        </div>
        <div className={styles.info}>
          <div className={styles.name}>
            {name}
            {account.most_recent ? <span className={styles.badge}>last used</span> : null}
            {jwtLabel ? (
              <span
                className={
                  account.jwt_expires_in < 0 ? `${styles.badge} ${styles.jwtExpired}` : styles.badge
                }
              >
                {jwtLabel}
              </span>
            ) : null}
            <CooldownBadge until={account.cooldown_until} duration={account.cooldown_duration} />
          </div>
          <div className={styles.login}>
            {login}
            {game ? <span className={styles.game}> &middot; {game}</span> : null}
            {lastUsed ? <span className={styles.meta}> &middot; {lastUsed}</span> : null}
          </div>
        </div>
        <div className={styles.actions} onClick={(event) => event.stopPropagation()}>
          <Hint label="Sign in">
            <Button
              size="icon-sm"
              aria-label="Sign in"
              disabled={busy}
              onClick={() => onSignIn(account.steamid)}
            >
              {busy ? <SpinningLoader size={16} /> : <ArrowRightIcon size={16} />}
            </Button>
          </Hint>
          <CooldownMenu steamid={account.steamid} until={account.cooldown_until} disabled={busy} />
          <Hint label="Remove">
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Remove account"
              disabled={busy}
              className="text-muted-foreground hover:bg-destructive/15 hover:text-destructive"
              onClick={() => onRemove([account])}
            >
              <DeleteIcon size={16} />
            </Button>
          </Hint>
        </div>
      </ContextMenuTrigger>
      <AccountContextMenu
        account={account}
        targets={menuTargets}
        exportCount={exportCount}
        streamer={streamer}
        index={index}
        onSignIn={onSignIn}
        onCopyUsername={onCopyUsername}
        onOpenProfile={onOpenProfile}
        onCopyExport={onCopyExport}
        onExportFile={onExportFile}
        onRemove={onRemove}
        onCooldown={onCooldown}
        onClearCooldown={onClearCooldown}
        onCustomCooldown={onCustomCooldown}
      />
    </ContextMenu>
  );
}
