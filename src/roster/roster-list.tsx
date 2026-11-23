import { useMemo } from "react";

import { PlusIcon } from "@/ui/icons/plus";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/ui/primitives/accordion";
import { EnterStagger } from "@/ui/widgets/enter-stagger";
import { IconAction } from "@/ui/widgets/icon-action";
import type { StatusMap } from "../status/status";
import type { AccountView } from "./account";
import { AccountRow } from "./account-row";
import type { AccountRowActions } from "./account-row-actions";
import { groupAccountsByTag } from "./group-accounts";
import styles from "./roster-list.module.css";

interface RosterListProps {
  accounts: AccountView[];
  actions: AccountRowActions;
  emptyHint?: string;
  emptyTitle?: string;
  groupByTag?: boolean;
  loading: boolean;
  now: number;
  onImport?: () => void;
  pending: string | null;
  selectedIds: Set<string>;
  statuses: StatusMap;
  streamer: boolean;
  warnJwtDays: number;
}

export function RosterList({
  accounts,
  actions,
  emptyTitle = "No accounts yet",
  emptyHint = "Import a refresh token to get started",
  loading,
  now,
  streamer,
  groupByTag = false,
  pending,
  statuses,
  selectedIds,
  onImport,
  warnJwtDays,
}: RosterListProps) {
  const selection = useMemo(
    () => accounts.filter((account) => selectedIds.has(account.steamid)),
    [accounts, selectedIds]
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

  const renderRow = (account: AccountView) => (
    <AccountRow
      account={account}
      actions={actions}
      busy={pending === account.steamid}
      index={indexById.get(account.steamid) ?? 0}
      key={account.steamid}
      now={now}
      selected={selectedIds.has(account.steamid)}
      selection={selection}
      status={statuses[account.steamid]}
      streamer={streamer}
      warnJwtDays={warnJwtDays}
    />
  );

  if (accounts.length === 0 && loading) {
    return null;
  }
  if (accounts.length === 0) {
    return (
      <div className={styles.empty}>
        <p className={styles.emptyTitle}>{emptyTitle}</p>
        <p className={styles.emptyHint}>{emptyHint}</p>
        {onImport ? (
          <IconAction
            className={styles.emptyAction}
            icon={<PlusIcon />}
            iconSize={14}
            label="Import accounts"
            onClick={onImport}
            size="sm"
          >
            Import accounts
          </IconAction>
        ) : null}
      </div>
    );
  }

  if (groups) {
    return (
      <EnterStagger
        className="contents"
        duration={0.16}
        once="roster"
        selector="[data-enter='row']"
        stagger={0.02}
        y={4}
      >
        <Accordion
          className="gap-2"
          defaultValue={groups.map((group) => group.key)}
          multiple
        >
          {groups.map((group) => (
            <AccordionItem
              className="border-0 not-last:border-0"
              key={group.key}
              value={group.key}
            >
              <AccordionTrigger className={styles.groupTrigger}>
                <span className={styles.groupLabel}>
                  <span className="truncate">{group.label}</span>
                  <span className={styles.groupCount}>
                    {group.accounts.length}
                  </span>
                </span>
              </AccordionTrigger>
              <AccordionContent className="pb-0">
                <div className={styles.list}>
                  {group.accounts.map(renderRow)}
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
      duration={0.16}
      once="roster"
      selector="[data-enter='row']"
      stagger={0.02}
      y={4}
    >
      {accounts.map(renderRow)}
    </EnterStagger>
  );
}
