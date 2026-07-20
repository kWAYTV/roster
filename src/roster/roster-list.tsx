import { useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import type { StatusMap } from "../status/status";
import type { AccountView } from "./account";
import { AccountRow } from "./account-row";
import { BulkBar } from "./bulk-bar";
import styles from "./roster-list.module.css";

interface RosterListProps {
  accounts: AccountView[];
  emptyHint?: string;
  emptyTitle?: string;
  exportCountFor: (steamids: string[]) => number;
  loading: boolean;
  onClearCooldown: (steamids: string[]) => void;
  onClearSelection: () => void;
  onCooldown: (steamids: string[], seconds: number) => void;
  onCopyExport: (steamids: string[]) => void;
  onCopyUsername: (account: AccountView) => void;
  onCustomCooldown: (steamids: string[]) => void;
  onEditNote: (account: AccountView) => void;
  onEditOverrides: (account: AccountView) => void;
  onExportFile: (steamids: string[]) => void;
  onOpenProfile: (steamid: string) => void;
  onRemove: (accounts: AccountView[]) => void;
  onSelect: (account: AccountView, additive: boolean) => void;
  onSignIn: (steamid: string, forceInvisible?: boolean) => void;
  onTogglePin: (account: AccountView) => void;
  pending: string | null;
  selectedIds: Set<string>;
  statuses: StatusMap;
  streamer: boolean;
}

export function RosterList({
  accounts,
  emptyTitle = "No accounts yet",
  emptyHint = "Use + to import an account and get started.",
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
  onTogglePin,
  onEditNote,
  onEditOverrides,
  exportCountFor,
}: RosterListProps) {
  const byId = useMemo(
    () => new Map(accounts.map((account) => [account.steamid, account])),
    [accounts]
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
    [selectedAccounts, selectedIds]
  );

  const selectedSteamids = useMemo(
    () => selectedAccounts.map((account) => account.steamid),
    [selectedAccounts]
  );

  const handleClearCooldown = useCallback(() => {
    onClearCooldown(selectedSteamids);
  }, [onClearCooldown, selectedSteamids]);

  const handleCooldown = useCallback(
    (seconds: number) => {
      onCooldown(selectedSteamids, seconds);
    },
    [onCooldown, selectedSteamids]
  );

  const handleCopyExport = useCallback(() => {
    onCopyExport(selectedSteamids);
  }, [onCopyExport, selectedSteamids]);

  const handleRemove = useCallback(() => {
    onRemove(selectedAccounts);
  }, [onRemove, selectedAccounts]);

  if (accounts.length === 0 && loading) {
    return null;
  }
  if (accounts.length === 0) {
    return (
      <div className={styles.empty}>
        <p className={styles.emptyTitle}>{emptyTitle}</p>
        <p className={styles.emptyHint}>{emptyHint}</p>
      </div>
    );
  }

  return (
    <>
      <div className={styles.list}>
        {accounts.map((account, index) => {
          const targets = menuTargetsFor(account);
          return (
            <AccountRow
              account={account}
              busy={pending === account.steamid}
              exportCount={exportCountFor(targets.map((item) => item.steamid))}
              index={index}
              key={account.steamid}
              menuTargets={targets}
              onClearCooldown={onClearCooldown}
              onCooldown={onCooldown}
              onCopyExport={onCopyExport}
              onCopyUsername={onCopyUsername}
              onCustomCooldown={onCustomCooldown}
              onEditNote={onEditNote}
              onEditOverrides={onEditOverrides}
              onExportFile={onExportFile}
              onOpenProfile={onOpenProfile}
              onRemove={onRemove}
              onSelect={onSelect}
              onSignIn={onSignIn}
              onTogglePin={onTogglePin}
              selected={selectedIds.has(account.steamid)}
              status={statuses[account.steamid]}
              streamer={streamer}
            />
          );
        })}
      </div>
      {createPortal(
        <BulkBar
          count={selectedAccounts.length}
          exportCount={exportCountFor(selectedSteamids)}
          onClear={onClearSelection}
          onClearCooldown={handleClearCooldown}
          onCooldown={handleCooldown}
          onCopyExport={handleCopyExport}
          onRemove={handleRemove}
        />,
        document.body
      )}
    </>
  );
}
