import { useCallback, useMemo, useRef } from "react";

import { isCooldownActive, nowSeconds } from "../cooldown/cooldown";
import { useCooldown } from "../cooldown/use-cooldown";
import { useNow } from "../cooldown/use-now";
import { useExport } from "../export/use-export";
import { LogPanel } from "../feedback/log-panel";
import { notify } from "../feedback/status";
import { useForget } from "../forget/use-forget";
import { useSignIn } from "../login/use-login";
import { commands } from "../platform/invoke";
import { useMetadataBackup } from "../preferences/use-metadata-backup";
import { usePreferences } from "../preferences/use-preferences";
import type { AccountView } from "../roster/account";
import { RosterList } from "../roster/roster-list";
import { SelectionMenu } from "../roster/selection-menu";
import { useAccountEditors } from "../roster/use-account-editors";
import { useAccountMeta } from "../roster/use-account-meta";
import { useRoster } from "../roster/use-roster";
import { useStatus } from "../status/use-status";
import { useTheme } from "../theme/use-theme";
import { useEnterStagger } from "../ui/widgets/use-enter-stagger";
import { useUpdater } from "../updater/use-updater";
import { CommandPalette } from "./command-palette";
import { ShellDialogs } from "./dialogs";
import { ErrorStatusGate } from "./error-status-gate";
import { filterAccounts, sortAccounts } from "./filter-accounts";
import { Footer } from "./footer";
import { JwtWarningGate } from "./jwt-warning-gate";
import styles from "./shell.module.css";
import { Toolbar } from "./toolbar";
import { useRosterView } from "./use-roster-view";
import { useSelection } from "./use-selection";
import { useShellEvents } from "./use-shell-events";
import { useShellShortcuts } from "./use-shell-shortcuts";
import { useShellUi } from "./use-shell-ui";

export function App() {
  const { accounts, loading, error, patchAccount, patchProfile } = useRoster();
  const statuses = useStatus(!loading, patchProfile);
  const { preferences, setPreference, patchPreferences } = usePreferences();
  useTheme(preferences.theme);
  const { signIn, pending } = useSignIn();
  const { remove, removeMany } = useForget();
  const { startMany, clearMany } = useCooldown();
  const {
    setPinned,
    setPinnedMany,
    setNote,
    setTags,
    setOverrides,
    clearNotesMany,
  } = useAccountMeta();
  const { exportBackup, importBackup } = useMetadataBackup();
  const {
    exportCountFor,
    copyExport,
    exportFile,
    copyUsername,
    copySteamId,
    pendingExport,
    confirmExport,
    cancelExport,
  } = useExport(!preferences.streamer_mode);
  const { busy, currentVersion, checkForUpdate } = useUpdater();
  const {
    selectedIds,
    selectAccount,
    clearSelection,
    selectAll,
    invertSelection,
  } = useSelection();
  const { filter, sort, groupByTag, setFilter, setSort, toggleGroupByTag } =
    useRosterView();
  const now = useNow(1000);
  const {
    ui,
    openSearch,
    closeSearch,
    setQuery,
    openImport,
    closeImport,
    openSettings,
    closeSettings,
    askRemove,
    closeRemove,
    askCooldownSignIn,
    closeCooldown,
    askBulkCooldown,
    closeBulkCooldown,
    setCommandOpen,
    toggleCommand,
  } = useShellUi();
  const {
    target: detailTarget,
    openNote,
    openTags,
    openOverrides,
    close: closeDetail,
    setTab: setDetailTab,
  } = useAccountEditors();

  const detailAccount = useMemo(
    () =>
      accounts.find((account) => account.steamid === detailTarget?.steamid) ??
      null,
    [accounts, detailTarget]
  );

  const clock = now || nowSeconds();

  const filtered = useMemo(() => {
    const matched = filterAccounts(
      accounts,
      ui.query,
      filter,
      statuses,
      clock,
      preferences.warn_jwt_expiry_days
    );
    return sortAccounts(matched, sort, clock);
  }, [
    accounts,
    clock,
    filter,
    preferences.warn_jwt_expiry_days,
    sort,
    statuses,
    ui.query,
  ]);

  const visibleSelectedIds = useMemo(() => {
    const visible = new Set(filtered.map((account) => account.steamid));
    const next = new Set<string>();
    for (const id of selectedIds) {
      if (visible.has(id)) {
        next.add(id);
      }
    }
    return next;
  }, [filtered, selectedIds]);

  const requestSignIn = useCallback(
    (steamid: string, forceInvisible = false) => {
      const account = accounts.find(
        (candidate) => candidate.steamid === steamid
      );
      if (!account || forceInvisible) {
        signIn(steamid, forceInvisible);
        return;
      }
      if (isCooldownActive(account.cooldown_until)) {
        askCooldownSignIn(account);
        return;
      }
      signIn(steamid, forceInvisible);
    },
    [accounts, askCooldownSignIn, signIn]
  );

  const openProfile = useCallback(async (steamid: string) => {
    try {
      await commands.openSteamProfile(steamid);
    } catch (cause) {
      notify(String(cause), "error");
    }
  }, []);

  const handleReimport = useCallback(
    (account: AccountView) => {
      const label = account.account_name || account.steamid;
      openImport(`${label}----`);
    },
    [openImport]
  );

  const handleTogglePin = useCallback(
    (account: AccountView) => {
      const next = !account.pinned;
      patchAccount(account.steamid, { pinned: next });
      setPinned(account.steamid, next).then((ok) => {
        if (!ok) {
          patchAccount(account.steamid, { pinned: account.pinned });
        }
      });
    },
    [patchAccount, setPinned]
  );

  const handleSaveNote = useCallback(
    (note: string) => {
      if (!detailTarget) {
        return;
      }
      setNote(detailTarget.steamid, note);
    },
    [detailTarget, setNote]
  );

  const handleSaveTags = useCallback(
    (tags: string[]) => {
      if (!detailTarget) {
        return;
      }
      setTags(detailTarget.steamid, tags);
    },
    [detailTarget, setTags]
  );

  const handleSelectAll = useCallback(() => {
    selectAll(filtered);
  }, [filtered, selectAll]);

  const handleInvertSelection = useCallback(() => {
    invertSelection(filtered);
  }, [filtered, invertSelection]);

  const requestRemoveSelection = useCallback(() => {
    const selected = filtered.filter((account) =>
      visibleSelectedIds.has(account.steamid)
    );
    if (selected.length === 0) {
      return;
    }
    askRemove(selected);
  }, [askRemove, filtered, visibleSelectedIds]);

  useShellEvents({ openImport });
  useShellShortcuts({
    clearSelection,
    closeSearch,
    commandOpen: ui.commandOpen,
    onInvertSelection: handleInvertSelection,
    onSelectAll: handleSelectAll,
    openSearch,
    requestRemoveSelection,
    requestSignIn,
    searchOpen: ui.searchOpen,
    selectedIds: visibleSelectedIds,
    toggleCommand,
  });

  const selectedAccounts = useMemo(
    () => filtered.filter((account) => visibleSelectedIds.has(account.steamid)),
    [filtered, visibleSelectedIds]
  );

  const selectedSteamids = useMemo(
    () => selectedAccounts.map((account) => account.steamid),
    [selectedAccounts]
  );

  const countLabel =
    filtered.length === accounts.length
      ? `${accounts.length}`
      : `${filtered.length}/${accounts.length}`;

  const exportCountForFiltered = useCallback(
    (steamids: string[]) => exportCountFor(accounts, steamids),
    [accounts, exportCountFor]
  );

  const handleCheckForUpdates = useCallback(() => {
    checkForUpdate(true).catch(() => undefined);
  }, [checkForUpdate]);

  const handleConfirmCooldownSignIn = useCallback(() => {
    if (!ui.cooldownTarget) {
      return;
    }
    signIn(ui.cooldownTarget.steamid);
  }, [ui.cooldownTarget, signIn]);

  const handleConfirmRemove = useCallback(() => {
    const ids = ui.removeTargets.map((account) => account.steamid);
    if (ids.length === 1) {
      remove(ids[0]);
    } else {
      removeMany(ids);
    }
    clearSelection();
  }, [ui.removeTargets, remove, removeMany, clearSelection]);

  const handleStartBulkCooldown = useCallback(
    (seconds: number) => {
      startMany(ui.bulkCooldownIds, seconds);
      closeBulkCooldown();
    },
    [startMany, ui.bulkCooldownIds, closeBulkCooldown]
  );

  const handleConfirmExport = useCallback(() => {
    confirmExport().catch(() => undefined);
  }, [confirmExport]);

  const frameRef = useRef<HTMLDivElement>(null);
  useEnterStagger(frameRef, {
    duration: 0.24,
    once: "shell",
    selector: "[data-enter='chrome']",
    stagger: 0.05,
    y: 6,
  });

  return (
    <div className={styles.app} ref={frameRef}>
      <Toolbar
        accountCount={accounts.length}
        countLabel={countLabel}
        filter={filter}
        groupByTag={groupByTag}
        onCloseSearch={closeSearch}
        onFilter={setFilter}
        onInvertSelection={handleInvertSelection}
        onOpenImport={openImport}
        onOpenSearch={openSearch}
        onOpenSettings={openSettings}
        onQueryChange={setQuery}
        onSelectAll={handleSelectAll}
        onSort={setSort}
        onToggleGroupByTag={toggleGroupByTag}
        query={ui.query}
        searchOpen={ui.searchOpen}
        selectionMenu={
          <SelectionMenu
            exportCount={exportCountForFiltered(selectedSteamids)}
            onClear={clearSelection}
            onClearCooldown={clearMany}
            onClearNotes={clearNotesMany}
            onCooldown={startMany}
            onCopyExport={copyExport}
            onCustomCooldown={askBulkCooldown}
            onExportFile={exportFile}
            onPin={setPinnedMany}
            onRemove={askRemove}
            selected={selectedAccounts}
          />
        }
        sort={sort}
      />

      <main className={styles.main}>
        <RosterList
          accounts={filtered}
          emptyHint={
            accounts.length > 0
              ? "Try another filter or clear search."
              : "Import a refresh token to get started."
          }
          emptyTitle={accounts.length > 0 ? "No matches" : "No accounts yet"}
          exportCountFor={exportCountForFiltered}
          groupByTag={groupByTag}
          loading={loading}
          onClearCooldown={clearMany}
          onCooldown={startMany}
          onCopyExport={copyExport}
          onCopySteamId={copySteamId}
          onCopyUsername={copyUsername}
          onCustomCooldown={askBulkCooldown}
          onEditNote={openNote}
          onEditOverrides={openOverrides}
          onEditTags={openTags}
          onExportFile={exportFile}
          onImport={accounts.length === 0 ? openImport : undefined}
          onOpenProfile={openProfile}
          onReimport={handleReimport}
          onRemove={askRemove}
          onSelect={selectAccount}
          onSignIn={requestSignIn}
          onTogglePin={handleTogglePin}
          pending={pending}
          selectedIds={visibleSelectedIds}
          statuses={statuses}
          streamer={preferences.streamer_mode}
        />
      </main>

      <LogPanel visible={preferences.show_log_panel} />
      <Footer currentVersion={currentVersion} />

      {error ? <ErrorStatusGate key={error} message={error} /> : null}
      {!loading &&
      accounts.length > 0 &&
      preferences.warn_jwt_expiry_days > 0 ? (
        <JwtWarningGate
          accounts={accounts}
          warnDays={preferences.warn_jwt_expiry_days}
        />
      ) : null}

      <CommandPalette
        accounts={accounts}
        onFilter={setFilter}
        onOpenChange={setCommandOpen}
        onOpenImport={openImport}
        onOpenSettings={openSettings}
        onSignIn={requestSignIn}
        open={ui.commandOpen}
        streamer={preferences.streamer_mode}
      />

      <ShellDialogs
        bulkCooldownIds={ui.bulkCooldownIds}
        cooldownTarget={ui.cooldownTarget}
        currentVersion={currentVersion}
        detailAccount={detailAccount}
        detailTab={detailTarget?.tab ?? "account"}
        importOpen={ui.importOpen}
        importPrefill={ui.importPrefill}
        importSession={ui.importSession}
        onCancelExport={cancelExport}
        onChangePreference={setPreference}
        onCheckForUpdates={handleCheckForUpdates}
        onCloseBulkCooldown={closeBulkCooldown}
        onCloseCooldown={closeCooldown}
        onCloseDetail={closeDetail}
        onCloseImport={closeImport}
        onCloseRemove={closeRemove}
        onCloseSettings={closeSettings}
        onConfirmCooldownSignIn={handleConfirmCooldownSignIn}
        onConfirmExport={handleConfirmExport}
        onConfirmRemove={handleConfirmRemove}
        onDetailTabChange={setDetailTab}
        onExportMetadata={exportBackup}
        onImportMetadata={importBackup}
        onPatchPreferences={patchPreferences}
        onSaveNote={handleSaveNote}
        onSaveOverrides={setOverrides}
        onSaveTags={handleSaveTags}
        onStartBulkCooldown={handleStartBulkCooldown}
        pendingExport={pendingExport}
        preferences={preferences}
        removeTargets={ui.removeTargets}
        settingsOpen={ui.settingsOpen}
        updateBusy={busy}
      />
    </div>
  );
}
