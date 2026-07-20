import {
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
  useCallback,
  useMemo,
} from "react";

import { ArrowRightIcon } from "@/ui/icons/arrow-right";
import { DeleteIcon } from "@/ui/icons/delete";
import { Button } from "@/ui/primitives/button";
import { ContextMenu, ContextMenuTrigger } from "@/ui/primitives/context-menu";
import { Hint } from "@/ui/widgets/hint";
import { SpinningLoader } from "@/ui/widgets/spinning-loader";
import { CooldownBadge } from "../cooldown/cooldown-badge";
import { CooldownMenu } from "../cooldown/cooldown-menu";
import type { AccountStatus } from "../status/status";
import { StatusDot } from "../status/status-dot";
import type { AccountView } from "./account";
import { AccountContextMenu } from "./account-context-menu";
import styles from "./account-row.module.css";
import { formatJwtExpiry } from "./jwt-label";
import { formatLastUsed } from "./last-used";

const AVATAR_SIZE = 36;

interface AccountRowProps {
  account: AccountView;
  busy: boolean;
  exportCount: number;
  index: number;
  menuTargets: AccountView[];
  onClearCooldown: (steamids: string[]) => void;
  onCooldown: (steamids: string[], seconds: number) => void;
  onCopyExport: (steamids: string[]) => void;
  onCopyUsername: (account: AccountView) => void;
  onCustomCooldown: (steamids: string[]) => void;
  onExportFile: (steamids: string[]) => void;
  onOpenProfile: (steamid: string) => void;
  onRemove: (accounts: AccountView[]) => void;
  onSelect: (account: AccountView, additive: boolean) => void;
  onSignIn: (steamid: string) => void;
  selected: boolean;
  status?: AccountStatus;
  streamer: boolean;
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
  const login = streamer
    ? "\u2022\u2022\u2022\u2022\u2022"
    : account.account_name;
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

  const handleSelect = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      onSelect(account, event.ctrlKey || event.metaKey);
    },
    [account, onSelect]
  );

  const handleContextMenu = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      onSelect(account, event.ctrlKey || event.metaKey);
    },
    [account, onSelect]
  );

  const handleDoubleClick = useCallback(() => {
    onSignIn(account.steamid);
  }, [account.steamid, onSignIn]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLButtonElement>) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onSelect(account, event.ctrlKey || event.metaKey);
      }
    },
    [account, onSelect]
  );

  const handleSignIn = useCallback(() => {
    onSignIn(account.steamid);
  }, [account.steamid, onSignIn]);

  const handleRemove = useCallback(() => {
    onRemove([account]);
  }, [account, onRemove]);

  return (
    <ContextMenu>
      <ContextMenuTrigger render={<div className={rowClass} />}>
        <button
          className={styles.selectHit}
          onClick={handleSelect}
          onContextMenu={handleContextMenu}
          onDoubleClick={handleDoubleClick}
          onKeyDown={handleKeyDown}
          type="button"
        >
          <div className={styles.avatarWrap}>
            <div className={styles.avatar}>
              {avatarContent(streamer, index, account)}
            </div>
            <StatusDot status={status} />
          </div>
          <div className={styles.info}>
            <div className={styles.name}>
              {name}
              {account.most_recent ? (
                <span className={styles.badge}>last used</span>
              ) : null}
              {jwtLabel ? (
                <span
                  className={
                    account.jwt_expires_in < 0
                      ? `${styles.badge} ${styles.jwtExpired}`
                      : styles.badge
                  }
                >
                  {jwtLabel}
                </span>
              ) : null}
              <CooldownBadge
                duration={account.cooldown_duration}
                until={account.cooldown_until}
              />
            </div>
            <div className={styles.login}>
              {login}
              {game ? (
                <span className={styles.game}> &middot; {game}</span>
              ) : null}
              {lastUsed ? (
                <span className={styles.meta}> &middot; {lastUsed}</span>
              ) : null}
            </div>
          </div>
        </button>
        <div className={styles.actions}>
          <Hint label="Sign in">
            <Button
              aria-label="Sign in"
              disabled={busy}
              onClick={handleSignIn}
              size="icon-sm"
            >
              {busy ? (
                <SpinningLoader size={16} />
              ) : (
                <ArrowRightIcon size={16} />
              )}
            </Button>
          </Hint>
          <CooldownMenu
            disabled={busy}
            steamid={account.steamid}
            until={account.cooldown_until}
          />
          <Hint label="Remove">
            <Button
              aria-label="Remove account"
              className="text-muted-foreground hover:bg-destructive/15 hover:text-destructive"
              disabled={busy}
              onClick={handleRemove}
              size="icon-sm"
              variant="ghost"
            >
              <DeleteIcon size={16} />
            </Button>
          </Hint>
        </div>
      </ContextMenuTrigger>
      <AccountContextMenu
        account={account}
        exportCount={exportCount}
        index={index}
        onClearCooldown={onClearCooldown}
        onCooldown={onCooldown}
        onCopyExport={onCopyExport}
        onCopyUsername={onCopyUsername}
        onCustomCooldown={onCustomCooldown}
        onExportFile={onExportFile}
        onOpenProfile={onOpenProfile}
        onRemove={onRemove}
        onSignIn={onSignIn}
        streamer={streamer}
        targets={menuTargets}
      />
    </ContextMenu>
  );
}

function avatarContent(
  streamer: boolean,
  index: number,
  account: AccountView
): ReactNode {
  if (streamer) {
    return <span>{index + 1}</span>;
  }
  if (account.avatar) {
    return (
      <img
        alt=""
        height={AVATAR_SIZE}
        src={account.avatar}
        width={AVATAR_SIZE}
      />
    );
  }
  return <span>{account.initials}</span>;
}
