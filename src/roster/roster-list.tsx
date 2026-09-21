import { useCallback, useMemo } from "react";

import { PlusIcon } from "@/ui/icons/plus";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/ui/primitives/accordion";
import { Badge } from "@/ui/primitives/badge";
import { EnterStagger } from "@/ui/widgets/enter-stagger";
import { IconAction } from "@/ui/widgets/icon-action";
import type { StatusMap } from "../status/status";
import type { AccountView } from "./account";
import { AccountRow } from "./account-row";
import { groupAccountsByTag } from "./group-accounts";
import styles from "./roster-list.module.css";

interface RosterListProps {
  accounts: AccountView[];
  emptyHint?: string;
  emptyTitle?: string;
  exportCountFor: (steamids: string[]) => number;
  groupByTag?: boolean;
  loading: boolean;
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
  onImport?: () => void;
  onOpenProfile: (steamid: string) => void;
  onReimport: (account: AccountView) => void;
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
  emptyHint = "Import a refresh token to get started.",
  loading,
  streamer,
  groupByTag = false,
  pending,
  statuses,
  selectedIds,
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
  onImport,
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

  const indexById = useMemo(() => {
    const map = new Map<string, number>();
    for (const [index, account] of accounts.entries()) {
      map.set(account.steamid, index);
    }
    return map;
  }, [accounts]);

  const groups = useMemo(() => {
    if (!groupByTag || streamer) {
      return null;
    }
    return groupAccountsByTag(accounts);
  }, [accounts, groupByTag, streamer]);

  const renderRow = (account: AccountView) => {
    const targets = menuTargetsFor(account);
    return (
      <AccountRow
        account={account}
        busy={pending === account.steamid}
        exportCount={exportCountFor(targets.map((item) => item.steamid))}
        index={indexById.get(account.steamid) ?? 0}
        key={account.steamid}
        menuTargets={targets}
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
        onSelect={onSelect}
        onSignIn={onSignIn}
        onTogglePin={onTogglePin}
        selected={selectedIds.has(account.steamid)}
        status={statuses[account.steamid]}
        streamer={streamer}
      />
    );
  };

  if (accounts.length === 0 && loading) {
    return null;
  }
  if (accounts.length === 0) {
    return (
      <EnterStagger
        blur={4}
        className={styles.empty}
        duration={0.28}
        stagger={0.06}
        y={8}
      >
        <p className={styles.emptyTitle}>{emptyTitle}</p>
        <p className={styles.emptyHint}>{emptyHint}</p>
        {onImport ? (
          <IconAction
            className={styles.emptyAction}
            icon={<PlusIcon />}
            label="Import account"
            onClick={onImport}
            size="sm"
          >
            Import account
          </IconAction>
        ) : null}
      </EnterStagger>
    );
  }

  if (groups) {
    return (
      <EnterStagger
        className="contents"
        duration={0.22}
        once="roster"
        selector="[data-enter='row']"
        stagger={0.035}
        y={6}
      >
        <Accordion
          className="gap-1"
          defaultValue={groups.map((group) => group.key)}
          multiple
        >
          {groups.map((group) => (
            <AccordionItem
              className="border-0"
              key={group.key}
              value={group.key}
            >
              <AccordionTrigger className="px-1 py-1.5 hover:no-underline">
                <span className="flex min-w-0 items-center gap-2">
                  <span className="truncate">{group.label}</span>
                  <Badge variant="secondary">{group.accounts.length}</Badge>
                </span>
              </AccordionTrigger>
              <AccordionContent className="pb-0">
                <div className={styles.list}>
                  {group.accounts.map((account) => renderRow(account))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </EnterStagger>
    );
  }

  return (
    <EnterStagger
      className={styles.list}
      duration={0.22}
      once="roster"
      selector="[data-enter='row']"
      stagger={0.035}
      y={6}
    >
      {accounts.map((account) => renderRow(account))}
    </EnterStagger>
  );
}
