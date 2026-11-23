import { type MouseEvent, useCallback, useMemo } from "react";

import { ArrowRightIcon } from "@/ui/icons/arrow-right";
import { BanIcon } from "@/ui/icons/ban";
import { ClipboardPasteIcon } from "@/ui/icons/clipboard-paste";
import { ClockIcon } from "@/ui/icons/clock";
import { CopyIcon } from "@/ui/icons/copy";
import { DeleteIcon } from "@/ui/icons/delete";
import { DownloadIcon } from "@/ui/icons/download";
import { ListFilterIcon } from "@/ui/icons/list-filter";
import { PinIcon } from "@/ui/icons/pin";
import { SettingsIcon } from "@/ui/icons/settings";
import { UserIcon } from "@/ui/icons/user";
import {
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
} from "@/ui/primitives/context-menu";

import { COOLDOWN_PRESETS, isCooldownActive } from "../cooldown/cooldown";
import { type AccountView, visibleAccountName } from "./account";
import type { AccountRowActions } from "./account-row-actions";
import { IconItem, IconSubTrigger } from "./menu-icon-item";

const AVATAR_SIZE = 24;

interface AccountContextMenuProps {
  account: AccountView;
  actions: AccountRowActions;
  exportCount: number;
  index: number;
  streamer: boolean;
  targets: AccountView[];
}

/// Right-click menu for one row, or for the whole selection when the row is in it.
export function AccountContextMenu({
  account,
  actions,
  targets,
  exportCount,
  streamer,
  index,
}: AccountContextMenuProps) {
  const multi = targets.length > 1;

  return (
    <ContextMenuContent className="w-60">
      {multi ? (
        <MultiTargetMenu
          actions={actions}
          exportCount={exportCount}
          targets={targets}
        />
      ) : (
        <SingleTargetMenu
          account={account}
          actions={actions}
          exportCount={exportCount}
          index={index}
          streamer={streamer}
        />
      )}
    </ContextMenuContent>
  );
}

function SingleTargetMenu({
  account,
  actions,
  exportCount,
  index,
  streamer,
}: Omit<AccountContextMenuProps, "targets">) {
  const steamids = useMemo(() => [account.steamid], [account.steamid]);
  const needsToken = !account.has_token || account.jwt_expires_in < 0;
  const title = streamer ? `Account ${index + 1}` : account.display_name;

  const signIn = useCallback(() => {
    actions.onSignIn(account.steamid);
  }, [actions, account.steamid]);
  const signInInvisible = useCallback(() => {
    actions.onSignIn(account.steamid, true);
  }, [actions, account.steamid]);
  const togglePin = useCallback(() => {
    actions.onTogglePin(account);
  }, [actions, account]);
  const editDetails = useCallback(() => {
    actions.onEditDetails(account);
  }, [actions, account]);
  const editOverrides = useCallback(() => {
    actions.onEditOverrides(account);
  }, [actions, account]);
  const copyUsername = useCallback(() => {
    actions.onCopyUsername(account);
  }, [actions, account]);
  const copySteamId = useCallback(() => {
    actions.onCopySteamId(account);
  }, [actions, account]);
  const copyToken = useCallback(() => {
    actions.onCopyExport(steamids);
  }, [actions, steamids]);
  const saveToken = useCallback(() => {
    actions.onExportFile(steamids);
  }, [actions, steamids]);
  const openProfile = useCallback(() => {
    actions.onOpenProfile(account.steamid);
  }, [actions, account.steamid]);
  const reimport = useCallback(() => {
    actions.onReimport(account);
  }, [actions, account]);
  const remove = useCallback(() => {
    actions.onRemove([account]);
  }, [actions, account]);

  return (
    <>
      <div className="flex items-center gap-2 px-2 pt-1.5 pb-2">
        <div className="flex size-6 shrink-0 items-center justify-center overflow-hidden rounded-[5px] bg-muted font-medium text-[10px] text-muted-foreground">
          {menuAvatar(streamer, index, account)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate font-medium text-base leading-4">
            {title}
          </div>
          {streamer ? null : (
            <div className="truncate font-mono text-muted-foreground text-xs leading-4">
              {visibleAccountName(account)}
            </div>
          )}
        </div>
      </div>

      <ContextMenuSeparator />

      <ContextMenuGroup>
        <IconItem icon={<ArrowRightIcon />} onClick={signIn}>
          Sign in
          <ContextMenuShortcut>Enter</ContextMenuShortcut>
        </IconItem>
        <IconItem icon={<BanIcon />} onClick={signInInvisible}>
          Sign in invisible
        </IconItem>
      </ContextMenuGroup>

      <ContextMenuSeparator />

      <ContextMenuGroup>
        <IconItem icon={<PinIcon />} onClick={togglePin}>
          {account.pinned ? "Unpin" : "Pin to top"}
        </IconItem>
        <IconItem icon={<ListFilterIcon />} onClick={editDetails}>
          Note and tags…
        </IconItem>
        <IconItem icon={<SettingsIcon />} onClick={editOverrides}>
          Sign-in overrides…
        </IconItem>
        <CooldownSubmenu actions={actions} targets={[account]} />
      </ContextMenuGroup>

      <ContextMenuSeparator />

      <ContextMenuGroup>
        <ContextMenuSub>
          <IconSubTrigger icon={<CopyIcon />}>Copy</IconSubTrigger>
          <ContextMenuSubContent className="w-44">
            <ContextMenuItem disabled={streamer} onClick={copyUsername}>
              Username
            </ContextMenuItem>
            <ContextMenuItem disabled={streamer} onClick={copySteamId}>
              SteamID
            </ContextMenuItem>
            <ContextMenuItem disabled={exportCount === 0} onClick={copyToken}>
              Token line
            </ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
        <IconItem
          disabled={exportCount === 0}
          icon={<DownloadIcon />}
          onClick={saveToken}
        >
          Save token to file…
        </IconItem>
        <IconItem icon={<UserIcon />} onClick={openProfile}>
          Open Steam profile
        </IconItem>
        {needsToken ? (
          <IconItem icon={<ClipboardPasteIcon />} onClick={reimport}>
            Re-import token…
          </IconItem>
        ) : null}
      </ContextMenuGroup>

      <ContextMenuSeparator />

      <IconItem icon={<DeleteIcon />} onClick={remove} variant="destructive">
        Remove account
        <ContextMenuShortcut>Del</ContextMenuShortcut>
      </IconItem>
    </>
  );
}

function MultiTargetMenu({
  actions,
  exportCount,
  targets,
}: Pick<AccountContextMenuProps, "actions" | "exportCount" | "targets">) {
  const steamids = useMemo(
    () => targets.map((item) => item.steamid),
    [targets]
  );
  const anyUnpinned = targets.some((item) => !item.pinned);
  const count = targets.length;

  const togglePin = useCallback(() => {
    actions.onPin(steamids, anyUnpinned);
  }, [actions, anyUnpinned, steamids]);
  const copyTokens = useCallback(() => {
    actions.onCopyExport(steamids);
  }, [actions, steamids]);
  const saveTokens = useCallback(() => {
    actions.onExportFile(steamids);
  }, [actions, steamids]);
  const remove = useCallback(() => {
    actions.onRemove(targets);
  }, [actions, targets]);

  return (
    <>
      <div className="px-2 pt-1.5 pb-1 text-muted-foreground text-xs tabular-nums">
        {count} accounts selected
      </div>
      <ContextMenuGroup>
        <IconItem icon={<PinIcon />} onClick={togglePin}>
          {anyUnpinned ? "Pin all" : "Unpin all"}
        </IconItem>
        <CooldownSubmenu actions={actions} targets={targets} />
      </ContextMenuGroup>

      <ContextMenuSeparator />

      <ContextMenuGroup>
        <IconItem
          disabled={exportCount === 0}
          icon={<CopyIcon />}
          onClick={copyTokens}
        >
          Copy token lines
          <ContextMenuShortcut>
            {countLabel(exportCount, count)}
          </ContextMenuShortcut>
        </IconItem>
        <IconItem
          disabled={exportCount === 0}
          icon={<DownloadIcon />}
          onClick={saveTokens}
        >
          Save tokens to file…
        </IconItem>
      </ContextMenuGroup>

      <ContextMenuSeparator />

      <IconItem icon={<DeleteIcon />} onClick={remove} variant="destructive">
        Remove {count} accounts
        <ContextMenuShortcut>Del</ContextMenuShortcut>
      </IconItem>
    </>
  );
}

function CooldownSubmenu({
  actions,
  targets,
}: {
  actions: AccountRowActions;
  targets: AccountView[];
}) {
  const steamids = useMemo(
    () => targets.map((item) => item.steamid),
    [targets]
  );
  const hasCooldown = targets.some((item) =>
    isCooldownActive(item.cooldown_until)
  );

  const handlePreset = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      const seconds = Number(event.currentTarget.dataset.seconds);
      if (Number.isFinite(seconds)) {
        actions.onCooldown(steamids, seconds);
      }
    },
    [actions, steamids]
  );
  const custom = useCallback(() => {
    actions.onCustomCooldown(steamids);
  }, [actions, steamids]);
  const clear = useCallback(() => {
    actions.onClearCooldown(steamids);
  }, [actions, steamids]);

  return (
    <ContextMenuSub>
      <IconSubTrigger icon={<ClockIcon />}>Cooldown</IconSubTrigger>
      <ContextMenuSubContent className="w-44">
        {COOLDOWN_PRESETS.map((preset) => (
          <ContextMenuItem
            data-seconds={preset.seconds}
            key={preset.seconds}
            onClick={handlePreset}
          >
            {preset.label}
          </ContextMenuItem>
        ))}
        <ContextMenuSeparator />
        <ContextMenuItem onClick={custom}>Custom…</ContextMenuItem>
        {hasCooldown ? (
          <ContextMenuItem onClick={clear} variant="destructive">
            Clear cooldown
          </ContextMenuItem>
        ) : null}
      </ContextMenuSubContent>
    </ContextMenuSub>
  );
}

function countLabel(exportCount: number, selected: number): string {
  if (exportCount === selected) {
    return `${exportCount}`;
  }
  return `${exportCount}/${selected}`;
}

function menuAvatar(
  streamer: boolean,
  index: number,
  account: AccountView
): React.ReactNode {
  if (streamer) {
    return <span>{index + 1}</span>;
  }
  if (account.avatar) {
    return (
      <img
        alt=""
        className="size-full object-cover"
        height={AVATAR_SIZE}
        src={account.avatar}
        width={AVATAR_SIZE}
      />
    );
  }
  return <span>{account.initials}</span>;
}
