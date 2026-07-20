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

interface AccountContextMenuProps {
  account: AccountView;
  targets: AccountView[];
  exportCount: number;
  streamer: boolean;
  index: number;
  onSignIn: (steamid: string) => void;
  onCopyUsername: (account: AccountView) => void;
  onOpenProfile: (steamid: string) => void;
  onCopyExport: (steamids: string[]) => void;
  onExportFile: (steamids: string[]) => void;
  onRemove: (accounts: AccountView[]) => void;
  onCooldown: (steamids: string[], seconds: number) => void;
  onClearCooldown: (steamids: string[]) => void;
  onCustomCooldown: (steamids: string[]) => void;
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
  const steamids = targets.map((item) => item.steamid);
  const title = streamer ? `Account ${index + 1}` : account.display_name;
  const copyTokenLabel = copyTokensLabel(exportCount, targets.length, multi);

  return (
    <ContextMenuContent className="w-56">
      {multi ? (
        <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
          {targets.length} selected
        </div>
      ) : (
        <div className="flex items-center gap-2 px-2 py-1.5">
          <div className="flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted text-[10px] font-medium text-muted-foreground">
            {streamer ? (
              <span>{index + 1}</span>
            ) : account.avatar ? (
              <img src={account.avatar} alt="" className="size-full object-cover" />
            ) : (
              <span>{account.initials}</span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium leading-tight">{title}</div>
            {!streamer ? (
              <div className="truncate text-xs leading-tight text-muted-foreground">
                {account.account_name}
              </div>
            ) : null}
          </div>
        </div>
      )}

      <ContextMenuSeparator />

      {!multi ? (
        <ContextMenuGroup>
          <IconItem icon={<ArrowRightIcon />} onClick={() => onSignIn(account.steamid)}>
            Sign in
          </IconItem>
          <IconItem
            icon={<CopyIcon />}
            disabled={streamer}
            onClick={() => onCopyUsername(account)}
          >
            Copy username
          </IconItem>
          <IconItem icon={<UserIcon />} onClick={() => onOpenProfile(account.steamid)}>
            Open profile
          </IconItem>
        </ContextMenuGroup>
      ) : null}

      {!multi ? <ContextMenuSeparator /> : null}

      <ContextMenuGroup>
        <IconItem
          icon={<CopyIcon />}
          disabled={exportCount === 0}
          onClick={() => onCopyExport(steamids)}
        >
          {copyTokenLabel}
        </IconItem>
        <IconItem
          icon={<DownloadIcon />}
          disabled={exportCount === 0}
          onClick={() => onExportFile(steamids)}
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
              key={preset.seconds}
              onClick={() => onCooldown(steamids, preset.seconds)}
            >
              {preset.label}
            </ContextMenuItem>
          ))}
          <ContextMenuSeparator />
          <ContextMenuItem onClick={() => onCustomCooldown(steamids)}>
            Custom…
          </ContextMenuItem>
          {hasCooldown ? (
            <ContextMenuItem
              variant="destructive"
              onClick={() => onClearCooldown(steamids)}
            >
              Clear cooldown
            </ContextMenuItem>
          ) : null}
        </ContextMenuSubContent>
      </ContextMenuSub>

      <ContextMenuSeparator />

      <IconItem
        icon={<DeleteIcon />}
        variant="destructive"
        onClick={() => onRemove(targets)}
      >
        {multi ? `Remove ${targets.length} accounts` : "Remove account"}
      </IconItem>
    </ContextMenuContent>
  );
}

function copyTokensLabel(
  exportCount: number,
  selectedCount: number,
  multi: boolean,
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
