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
import { nowSeconds } from "../cooldown/cooldown";
import { CooldownBadge } from "../cooldown/cooldown-badge";
import { CooldownMenu } from "../cooldown/cooldown-menu";
import { useNow } from "../cooldown/use-now";
import type { AccountStatus } from "../status/status";
import { StatusDot } from "../status/status-dot";
import type { AccountView } from "./account";
import { AccountContextMenu } from "./account-context-menu";
import styles from "./account-row.module.css";
import { formatJwtExpiry, jwtExpiryTooltip } from "./jwt-label";
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
  onCopySteamId: (account: AccountView) => void;
  onCopyUsername: (account: AccountView) => void;
  onCustomCooldown: (steamids: string[]) => void;
  onEditNote: (account: AccountView) => void;
  onEditOverrides: (account: AccountView) => void;
  onEditTags: (account: AccountView) => void;
  onExportFile: (steamids: string[]) => void;
  onOpenProfile: (steamid: string) => void;
  onReimport: (account: AccountView) => void;
  onRemove: (accounts: AccountView[]) => void;
  onSelect: (account: AccountView, additive: boolean) => void;
  onSignIn: (steamid: string, forceInvisible?: boolean) => void;
  onTogglePin: (account: AccountView) => void;
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
  onCopySteamId,
  onOpenProfile,
  onReimport,
  onCopyExport,
  onExportFile,
  onCooldown,
  onClearCooldown,
  onCustomCooldown,
  onTogglePin,
  onEditNote,
  onEditOverrides,
  onEditTags,
}: AccountRowProps) {
  const now = useNow(30_000);
  const name = streamer ? `Account ${index + 1}` : account.display_name;
  const login = streamer
    ? "\u2022\u2022\u2022\u2022\u2022"
    : account.account_name;
  const lastUsed = formatLastUsed(account.last_used, now || nowSeconds());
  const game = status?.state === "in-game" ? status.game : "";
  const jwtLabel = formatJwtExpiry(account.jwt_expires_in);
  const jwtTip = jwtExpiryTooltip(account.jwt_expires_in);
  const note = streamer ? "" : account.note.trim();
  const tags = streamer ? [] : account.tags;
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

  const handleOpenProfile = useCallback(
    (event: MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault();
      event.stopPropagation();
      onOpenProfile(account.steamid);
    },
    [account.steamid, onOpenProfile]
  );

  const handleAvatarKeyDown = useCallback(
    (event: KeyboardEvent<HTMLAnchorElement>) => {
      if (event.key !== "Enter" && event.key !== " ") {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      onOpenProfile(account.steamid);
    },
    [account.steamid, onOpenProfile]
  );

  return (
    <ContextMenu>
      <ContextMenuTrigger render={<div className={rowClass} />}>
        <div className={styles.avatarWrap}>
          <Hint label="Open Steam profile">
            <a
              className={styles.avatar}
              href={`https://steamcommunity.com/profiles/${account.steamid}`}
              onClick={handleOpenProfile}
              onKeyDown={handleAvatarKeyDown}
            >
              {avatarContent(streamer, index, account)}
            </a>
          </Hint>
          <StatusDot status={status} />
        </div>
        <button
          className={styles.selectHit}
          onClick={handleSelect}
          onContextMenu={handleContextMenu}
          onDoubleClick={handleDoubleClick}
          onKeyDown={handleKeyDown}
          type="button"
        >
          <div className={styles.info}>
            <div className={styles.name}>
              {account.pinned ? (
                <span className={styles.pin} title="Pinned">
                  ★
                </span>
              ) : null}
              {name}
              {account.most_recent ? (
                <span className={styles.badge}>last used</span>
              ) : null}
              {jwtLabel ? (
                <Hint label={jwtTip || jwtLabel}>
                  <span
                    className={
                      account.jwt_expires_in < 0
                        ? `${styles.badge} ${styles.jwtExpired}`
                        : styles.badge
                    }
                  >
                    {jwtLabel}
                  </span>
                </Hint>
              ) : null}
              <CooldownBadge
                duration={account.cooldown_duration}
                until={account.cooldown_until}
              />
              {tags.map((tag) => (
                <span className={styles.tag} key={tag}>
                  #{tag}
                </span>
              ))}
            </div>
            <div className={styles.login}>
              {login}
              {note ? <span className={styles.note}> · {note}</span> : null}
              {game ? <span className={styles.game}> · {game}</span> : null}
              {lastUsed ? (
                <span className={styles.meta}> · {lastUsed}</span>
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
                <SpinningLoader size={15} />
              ) : (
                <ArrowRightIcon size={15} />
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
              <DeleteIcon size={15} />
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
        onCopySteamId={onCopySteamId}
        onCopyUsername={onCopyUsername}
        onCustomCooldown={onCustomCooldown}
        onEditNote={onEditNote}
        onEditOverrides={onEditOverrides}
        onEditTags={onEditTags}
        onExportFile={onExportFile}
        onOpenProfile={onOpenProfile}
        onReimport={onReimport}
        onRemove={onRemove}
        onSignIn={onSignIn}
        onTogglePin={onTogglePin}
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
