import { useCallback, useMemo } from "react";

import { ArrowRightIcon } from "@/ui/icons/arrow-right";
import { ClockIcon } from "@/ui/icons/clock";
import { CopyIcon } from "@/ui/icons/copy";
import { DeleteIcon } from "@/ui/icons/delete";
import { DownloadIcon } from "@/ui/icons/download";
import { UserIcon } from "@/ui/icons/user";
import {
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
} from "@/ui/primitives/context-menu";

import { COOLDOWN_PRESETS } from "../cooldown/cooldown";
import type { AccountView } from "./account";
import { IconItem, IconSubTrigger } from "./menu-icon-item";

const AVATAR_SIZE = 28;

interface AccountContextMenuProps {
  account: AccountView;
  exportCount: number;
  index: number;
  onClearCooldown: (steamids: string[]) => void;
  onCooldown: (steamids: string[], seconds: number) => void;
  onCopyExport: (steamids: string[]) => void;
  onCopyUsername: (account: AccountView) => void;
  onCustomCooldown: (steamids: string[]) => void;
  onExportFile: (steamids: string[]) => void;
  onOpenProfile: (steamid: string) => void;
  onRemove: (accounts: AccountView[]) => void;
  onSignIn: (steamid: string) => void;
  streamer: boolean;
  targets: AccountView[];
}

export function AccountContextMenu({
  account,
  targets,
  exportCount,
  streamer,
  index,
  onSignIn,
  onCopyUsername,
  onOpenProfile,
  onCopyExport,
  onExportFile,
  onRemove,
  onCooldown,
  onClearCooldown,
  onCustomCooldown,
}: AccountContextMenuProps) {
  const multi = targets.length > 1;
  const hasCooldown = targets.some((item) => item.cooldown_until > 0);
  const steamids = useMemo(
    () => targets.map((item) => item.steamid),
    [targets]
  );
  const title = streamer ? `Account ${index + 1}` : account.display_name;
  const copyTokenLabel = copyTokensLabel(exportCount, targets.length, multi);

  const handleSignIn = useCallback(() => {
    onSignIn(account.steamid);
  }, [onSignIn, account.steamid]);

  const handleCopyUsername = useCallback(() => {
    onCopyUsername(account);
  }, [onCopyUsername, account]);

  const handleOpenProfile = useCallback(() => {
    onOpenProfile(account.steamid);
  }, [onOpenProfile, account.steamid]);

  const handleCopyExport = useCallback(() => {
    onCopyExport(steamids);
  }, [onCopyExport, steamids]);

  const handleExportFile = useCallback(() => {
    onExportFile(steamids);
  }, [onExportFile, steamids]);

  const handleCustomCooldown = useCallback(() => {
    onCustomCooldown(steamids);
  }, [onCustomCooldown, steamids]);

  const handleClearCooldown = useCallback(() => {
    onClearCooldown(steamids);
  }, [onClearCooldown, steamids]);

  const handleRemove = useCallback(() => {
    onRemove(targets);
  }, [onRemove, targets]);

  const handlePresetClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const seconds = Number(event.currentTarget.dataset.seconds);
      if (Number.isFinite(seconds)) {
        onCooldown(steamids, seconds);
      }
    },
    [onCooldown, steamids]
  );

  return (
    <ContextMenuContent className="w-56">
      {multi ? (
        <div className="px-2 py-1.5 font-medium text-muted-foreground text-xs">
          {targets.length} selected
        </div>
      ) : (
        <div className="flex items-center gap-2 px-2 py-1.5">
          <div className="flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted font-medium text-[10px] text-muted-foreground">
            {avatarContent(streamer, index, account)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate font-medium text-sm leading-tight">
              {title}
            </div>
            {streamer ? null : (
              <div className="truncate text-muted-foreground text-xs leading-tight">
                {account.account_name}
              </div>
            )}
          </div>
        </div>
      )}

      <ContextMenuSeparator />

      {multi ? null : (
        <ContextMenuGroup>
          <IconItem icon={<ArrowRightIcon />} onClick={handleSignIn}>
            Sign in
          </IconItem>
          <IconItem
            disabled={streamer}
            icon={<CopyIcon />}
            onClick={handleCopyUsername}
          >
            Copy username
          </IconItem>
          <IconItem icon={<UserIcon />} onClick={handleOpenProfile}>
            Open profile
          </IconItem>
        </ContextMenuGroup>
      )}

      {multi ? null : <ContextMenuSeparator />}

      <ContextMenuGroup>
        <IconItem
          disabled={exportCount === 0}
          icon={<CopyIcon />}
          onClick={handleCopyExport}
        >
          {copyTokenLabel}
        </IconItem>
        <IconItem
          disabled={exportCount === 0}
          icon={<DownloadIcon />}
          onClick={handleExportFile}
        >
          Save to file…
        </IconItem>
      </ContextMenuGroup>

      <ContextMenuSeparator />

      <ContextMenuSub>
        <IconSubTrigger icon={<ClockIcon />}>Cooldown</IconSubTrigger>
        <ContextMenuSubContent className="w-44">
          {COOLDOWN_PRESETS.map((preset) => (
            <ContextMenuItem
              data-seconds={preset.seconds}
              key={preset.seconds}
              onClick={handlePresetClick}
            >
              {preset.label}
            </ContextMenuItem>
          ))}
          <ContextMenuSeparator />
          <ContextMenuItem onClick={handleCustomCooldown}>
            Custom…
          </ContextMenuItem>
          {hasCooldown ? (
            <ContextMenuItem
              onClick={handleClearCooldown}
              variant="destructive"
            >
              Clear cooldown
            </ContextMenuItem>
          ) : null}
        </ContextMenuSubContent>
      </ContextMenuSub>

      <ContextMenuSeparator />

      <IconItem
        icon={<DeleteIcon />}
        onClick={handleRemove}
        variant="destructive"
      >
        {multi ? `Remove ${targets.length} accounts` : "Remove account"}
      </IconItem>
    </ContextMenuContent>
  );
}

function avatarContent(
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

function copyTokensLabel(
  exportCount: number,
  selectedCount: number,
  multi: boolean
): string {
  if (!multi) {
    return exportCount === 1 ? "Copy token" : "Copy tokens";
  }
  if (exportCount === 0) {
    return "Copy tokens";
  }
  if (exportCount === selectedCount) {
    return `Copy tokens (${exportCount})`;
  }
  return `Copy tokens (${exportCount}/${selectedCount})`;
}
