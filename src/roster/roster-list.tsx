import { useCallback, useMemo } from "react";
import { createPortal } from "react-dom";

import { AccountRow } from "./account-row";
import { BulkBar } from "./bulk-bar";
import type { AccountView } from "./account";
import type { StatusMap } from "../status/status";
import styles from "./roster-list.module.css";

interface RosterListProps {
  accounts: AccountView[];
  loading: boolean;
  streamer: boolean;
  pending: string | null;
  statuses: StatusMap;
  selectedIds: Set<string>;
  onSelect: (account: AccountView, additive: boolean) => void;
  onClearSelection: () => void;
  onSignIn: (steamid: string) => void;
  onRemove: (accounts: AccountView[]) => void;
  onCopyUsername: (account: AccountView) => void;
  onOpenProfile: (steamid: string) => void;
  onCopyExport: (steamids: string[]) => void;
  onExportFile: (steamids: string[]) => void;
  onCooldown: (steamids: string[], seconds: number) => void;
  onClearCooldown: (steamids: string[]) => void;
  onCustomCooldown: (steamids: string[]) => void;
  exportCountFor: (steamids: string[]) => number;
}

export function RosterList({
  accounts,
  loading,
  streamer,
  pending,
  statuses,
  selectedIds,
  onSelect,
  onClearSelection,
  onSignIn,
  onRemove,
  onCopyUsername,
  onOpenProfile,
  onCopyExport,
  onExportFile,
  onCooldown,
  onClearCooldown,
  onCustomCooldown,
  exportCountFor,
}: RosterListProps) {
  const byId = useMemo(
    () => new Map(accounts.map((account) => [account.steamid, account])),
    [accounts],
  );

  const selectedAccounts = useMemo(() => {
    const items: AccountView[] = [];
    for (const steamid of selectedIds) {
      const account = byId.get(steamid);
      if (account) {
        items.push(account);
      }
    }
    return items;
  }, [byId, selectedIds]);

  const menuTargetsFor = useCallback(
    (account: AccountView) => {
      if (selectedIds.has(account.steamid) && selectedAccounts.length > 0) {
        return selectedAccounts;
      }
      return [account];
    },
    [selectedAccounts, selectedIds],
  );

  if (accounts.length === 0) {
    if (loading) {
      return null;
    }
    return (
      <div className={styles.empty}>
        <p className={styles.emptyTitle}>No accounts yet</p>
        <p className={styles.emptyHint}>Use + to import an account and get started.</p>
      </div>
    );
  }

  const selectedSteamids = selectedAccounts.map((account) => account.steamid);

  return (
    <>
      <div className={styles.list}>
        {accounts.map((account, index) => {
          const targets = menuTargetsFor(account);
          return (
            <AccountRow
              key={account.steamid}
              account={account}
              index={index}
              streamer={streamer}
              busy={pending === account.steamid}
              selected={selectedIds.has(account.steamid)}
              status={statuses[account.steamid]}
              menuTargets={targets}
              exportCount={exportCountFor(targets.map((item) => item.steamid))}
              onSelect={onSelect}
              onSignIn={onSignIn}
              onRemove={onRemove}
              onCopyUsername={onCopyUsername}
              onOpenProfile={onOpenProfile}
              onCopyExport={onCopyExport}
              onExportFile={onExportFile}
              onCooldown={onCooldown}
              onClearCooldown={onClearCooldown}
              onCustomCooldown={onCustomCooldown}
            />
          );
        })}
      </div>
      {createPortal(
        <BulkBar
          count={selectedAccounts.length}
          exportCount={exportCountFor(selectedSteamids)}
          onClear={onClearSelection}
          onCooldown={(seconds) => onCooldown(selectedSteamids, seconds)}
          onClearCooldown={() => onClearCooldown(selectedSteamids)}
          onCopyExport={() => onCopyExport(selectedSteamids)}
          onRemove={() => onRemove(selectedAccounts)}
        />,
        document.body,
      )}
    </>
  );
}
