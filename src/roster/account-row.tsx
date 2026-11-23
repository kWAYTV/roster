import {
  type KeyboardEvent,
  type MouseEvent,
  memo,
  type ReactNode,
  useCallback,
  useMemo,
} from "react";

import { ArrowRightIcon } from "@/ui/icons/arrow-right";
import { Button } from "@/ui/primitives/button";
import { cn } from "@/ui/primitives/cn";
import { ContextMenu, ContextMenuTrigger } from "@/ui/primitives/context-menu";
import { Hint } from "@/ui/widgets/hint";
import { IconAction } from "@/ui/widgets/icon-action";
import { SpinningLoader } from "@/ui/widgets/spinning-loader";
import { CooldownBadge } from "../cooldown/cooldown-badge";
import { CooldownMenu } from "../cooldown/cooldown-menu";
import { isExportable } from "../export/use-export";
import type { AccountStatus } from "../status/status";
import { StatusDot } from "../status/status-dot";
import { type AccountView, visibleAccountName } from "./account";
import { AccountContextMenu } from "./account-context-menu";
import styles from "./account-row.module.css";
import type { AccountRowActions } from "./account-row-actions";
import { formatJwtExpiry, jwtExpiryTooltip } from "./jwt-label";
import { formatLastUsed } from "./last-used";

const AVATAR_SIZE = 28;
const STREAMER_MASK = "•••••";

interface AccountRowProps {
  account: AccountView;
  actions: AccountRowActions;
  busy: boolean;
  index: number;
  /** Clock in Unix seconds, ticked by the shell (coarse). */
  now: number;
  selected: boolean;
  /** Current multi-selection; used as context-menu targets when this row is in it. */
  selection: AccountView[];
  status?: AccountStatus;
  streamer: boolean;
  /** Expiry warning window in days (0 = off). */
  warnJwtDays: number;
}

function AccountRowView({
  account,
  actions,
  index,
  now,
  streamer,
  busy,
  selected,
  selection,
  status,
  warnJwtDays,
}: AccountRowProps) {
  const { onSelect, onSignIn, onOpenProfile } = actions;
  const name = streamer ? `Account ${index + 1}` : account.display_name;
  const login = streamer ? STREAMER_MASK : visibleAccountName(account);
  const game = status?.state === "in-game" ? status.game : "";
  const note = streamer ? "" : account.note.trim();
  const tags = streamer ? [] : account.tags;

  const targets = useMemo(
    () => (selected && selection.length > 1 ? selection : [account]),
    [account, selected, selection]
  );
  const exportCount = useMemo(
    () => targets.filter(isExportable).length,
    [targets]
  );

  const handleSelect = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      onSelect(account, event.ctrlKey || event.metaKey);
    },
    [account, onSelect]
  );

  // Right-click selects the row, but keeps a multi-selection it belongs to.
  const handleMenuOpenChange = useCallback(
    (open: boolean) => {
      if (open && !selected) {
        onSelect(account, false);
      }
    },
    [account, onSelect, selected]
  );

  const handleDoubleClick = useCallback(() => {
    onSignIn(account.steamid);
  }, [account.steamid, onSignIn]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLButtonElement>) => {
      if (event.key === "Enter" && !event.altKey) {
        event.preventDefault();
        onSignIn(account.steamid);
        return;
      }
      if (event.key === " ") {
        event.preventDefault();
        onSelect(account, event.ctrlKey || event.metaKey);
      }
    },
    [account, onSelect, onSignIn]
  );

  const handleSignIn = useCallback(() => {
    onSignIn(account.steamid);
  }, [account.steamid, onSignIn]);

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
    <ContextMenu onOpenChange={handleMenuOpenChange}>
      <ContextMenuTrigger
        render={
          <div
            className={cn(
              styles.row,
              selected && styles.selected,
              busy && styles.busy
            )}
            data-enter="row"
          />
        }
      >
        <div className={styles.avatarWrap}>
          <a
            aria-label="Open Steam profile"
            className={styles.avatar}
            href={`https://steamcommunity.com/profiles/${account.steamid}`}
            onClick={handleOpenProfile}
            onKeyDown={handleAvatarKeyDown}
            tabIndex={-1}
            title="Open Steam profile"
          >
            {avatarContent(streamer, index, account)}
          </a>
          <StatusDot status={status} />
        </div>

        <button
          aria-pressed={selected}
          className={styles.selectHit}
          onClick={handleSelect}
          onDoubleClick={handleDoubleClick}
          onKeyDown={handleKeyDown}
          type="button"
        >
          <span className={styles.info}>
            <span className={styles.line}>
              <span className={styles.name}>{name}</span>
              {account.pinned ? <PinGlyph /> : null}
              {account.most_recent ? (
                <span className={styles.recent}>Last used</span>
              ) : null}
            </span>
            <span className={styles.sub}>
              <span className={styles.login}>{login}</span>
              {tags.map((tag) => (
                <span className={styles.tag} key={tag}>
                  <span className={styles.sep}>·</span>#{tag}
                </span>
              ))}
              {note ? (
                <span className={styles.note}>
                  <span className={styles.sep}>·</span>
                  {note}
                </span>
              ) : null}
              {game ? (
                <span className={styles.game}>
                  <span className={styles.sep}>·</span>
                  {game}
                </span>
              ) : null}
            </span>
          </span>
        </button>

        <div className={styles.trail}>
          <RowMeta account={account} now={now} warnJwtDays={warnJwtDays} />
          <div className={styles.actions}>
            <CooldownMenu
              disabled={busy}
              steamid={account.steamid}
              until={account.cooldown_until}
            />
            {busy ? (
              <Button
                aria-label="Signing in"
                disabled
                size="icon-sm"
                type="button"
                variant="ghost"
              >
                <SpinningLoader size={15} />
              </Button>
            ) : (
              <IconAction
                icon={<ArrowRightIcon />}
                iconSize={15}
                label="Sign in"
                onClick={handleSignIn}
                size="icon-sm"
                variant="ghost"
              />
            )}
          </div>
        </div>
      </ContextMenuTrigger>
      <AccountContextMenu
        account={account}
        actions={actions}
        exportCount={exportCount}
        index={index}
        streamer={streamer}
        targets={targets}
      />
    </ContextMenu>
  );
}

export const AccountRow = memo(AccountRowView);

/** Right-aligned quiet facts: cooldown, token state, last sign-in. */
function RowMeta({
  account,
  now,
  warnJwtDays,
}: {
  account: AccountView;
  now: number;
  warnJwtDays: number;
}) {
  const jwtLabel = formatJwtExpiry(account.jwt_expires_in);
  const jwtTone = jwtToneClass(account.jwt_expires_in, warnJwtDays);
  const missingToken = !account.has_token;
  const lastUsed = formatLastUsed(account.last_used, now);

  return (
    <div className={styles.meta}>
      <CooldownBadge
        duration={account.cooldown_duration}
        until={account.cooldown_until}
      />
      {jwtLabel ? (
        <Hint label={jwtExpiryTooltip(account.jwt_expires_in) || jwtLabel}>
          <span className={jwtTone}>{jwtLabel}</span>
        </Hint>
      ) : null}
      {missingToken && !jwtLabel ? (
        <Hint label="No saved token. Re-import to sign in">
          <span className={styles.danger}>No token</span>
        </Hint>
      ) : null}
      {lastUsed ? <span>{lastUsed}</span> : null}
    </div>
  );
}

function jwtToneClass(
  expiresIn: number,
  warnJwtDays: number
): string | undefined {
  if (expiresIn < 0) {
    return styles.danger;
  }
  const warnWindow = (warnJwtDays > 0 ? warnJwtDays : 7) * 86_400;
  return expiresIn <= warnWindow ? styles.warn : undefined;
}

function PinGlyph() {
  return (
    <svg
      aria-label="Pinned"
      className={styles.pin}
      fill="none"
      role="img"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>Pinned</title>
      <path d="M12 17v5" />
      <path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z" />
    </svg>
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
        decoding="async"
        height={AVATAR_SIZE}
        src={account.avatar}
        width={AVATAR_SIZE}
      />
    );
  }
  return <span>{account.initials}</span>;
}
