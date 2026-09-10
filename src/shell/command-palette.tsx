import { useCallback } from "react";

import type { AccountView } from "@/roster/account";
import type { RosterFilter } from "@/shell/filter-accounts";
import { ArrowRightIcon } from "@/ui/icons/arrow-right";
import { PlusIcon } from "@/ui/icons/plus";
import { SettingsIcon } from "@/ui/icons/settings";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/ui/primitives/command";

interface CommandPaletteProps {
  accounts: AccountView[];
  onFilter: (filter: RosterFilter) => void;
  onOpenChange: (open: boolean) => void;
  onOpenImport: () => void;
  onOpenSettings: () => void;
  onSignIn: (steamid: string) => void;
  open: boolean;
  streamer: boolean;
}

const FILTERS: { id: RosterFilter; label: string }[] = [
  { id: "all", label: "All accounts" },
  { id: "pinned", label: "Pinned" },
  { id: "tagged", label: "Tagged" },
  { id: "cooldown", label: "On cooldown" },
  { id: "expiring", label: "Expiring soon" },
  { id: "expired", label: "Expired JWT" },
  { id: "online", label: "Online" },
  { id: "offline", label: "Offline" },
];

export function CommandPalette({
  open,
  accounts,
  streamer,
  onOpenChange,
  onSignIn,
  onOpenImport,
  onOpenSettings,
  onFilter,
}: CommandPaletteProps) {
  const run = useCallback(
    (action: () => void) => {
      onOpenChange(false);
      action();
    },
    [onOpenChange]
  );

  const handleImport = useCallback(() => {
    run(() => {
      onOpenImport();
    });
  }, [onOpenImport, run]);

  const handleSettings = useCallback(() => {
    run(() => {
      onOpenSettings();
    });
  }, [onOpenSettings, run]);

  const handleFilter = useCallback(
    (id: RosterFilter) => {
      run(() => {
        onFilter(id);
      });
    },
    [onFilter, run]
  );

  const handleSignIn = useCallback(
    (value: string) => {
      run(() => {
        onSignIn(value);
      });
    },
    [onSignIn, run]
  );

  return (
    <CommandDialog
      description="Jump to an account, filter the list, or open import and settings."
      onOpenChange={onOpenChange}
      open={open}
      title="Command palette"
    >
      <CommandInput placeholder="Sign in, filter, import…" />
      <CommandList>
        <CommandEmpty>No matches.</CommandEmpty>
        <CommandGroup heading="Actions">
          <CommandItem onSelect={handleImport} value="import account">
            <PlusIcon size={16} />
            Import account
          </CommandItem>
          <CommandItem onSelect={handleSettings} value="open settings">
            <SettingsIcon size={16} />
            Settings
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Filter">
          {FILTERS.map((item) => (
            <FilterCommandItem
              id={item.id}
              key={item.id}
              label={item.label}
              onSelect={handleFilter}
            />
          ))}
        </CommandGroup>
        {accounts.length > 0 ? (
          <>
            <CommandSeparator />
            <CommandGroup heading="Accounts">
              {accounts.map((account, index) => (
                <AccountCommandItem
                  account={account}
                  index={index}
                  key={account.steamid}
                  onSelect={handleSignIn}
                  streamer={streamer}
                />
              ))}
            </CommandGroup>
          </>
        ) : null}
      </CommandList>
    </CommandDialog>
  );
}

function FilterCommandItem({
  id,
  label,
  onSelect,
}: {
  id: RosterFilter;
  label: string;
  onSelect: (id: RosterFilter) => void;
}) {
  const handleSelect = useCallback(() => {
    onSelect(id);
  }, [id, onSelect]);

  return (
    <CommandItem onSelect={handleSelect} value={`filter ${id} ${label}`}>
      {label}
    </CommandItem>
  );
}

function AccountCommandItem({
  account,
  index,
  streamer,
  onSelect,
}: {
  account: AccountView;
  index: number;
  onSelect: (steamid: string) => void;
  streamer: boolean;
}) {
  const name = streamer ? `Account ${index + 1}` : account.display_name;
  const handleSelect = useCallback(() => {
    onSelect(account.steamid);
  }, [account.steamid, onSelect]);

  return (
    <CommandItem
      onSelect={handleSelect}
      value={
        streamer
          ? `${index + 1} ${account.steamid}`
          : `${account.display_name} ${account.account_name} ${account.steamid} ${account.tags.join(" ")}`
      }
    >
      <ArrowRightIcon size={16} />
      Sign in {name}
    </CommandItem>
  );
}
