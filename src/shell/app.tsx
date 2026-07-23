import { useCallback, useMemo, useState } from "react";

import { isCooldownActive, nowSeconds } from "../cooldown/cooldown";
import { useCooldown } from "../cooldown/use-cooldown";
import { useNow } from "../cooldown/use-now";
import { useExport } from "../export/use-export";
import { LogPanel } from "../feedback/log-panel";
import { useToast } from "../feedback/toast";
import { useForget } from "../forget/use-forget";
import { useSignIn } from "../login/use-login";
import { commands } from "../platform/invoke";
import { useMetadataBackup } from "../preferences/use-metadata-backup";
import { usePreferences } from "../preferences/use-preferences";
import type { AccountView } from "../roster/account";
import { NoteDialog } from "../roster/note-dialog";
import { OverridesDialog } from "../roster/overrides-dialog";
import { RosterList } from "../roster/roster-list";
import { useAccountMeta } from "../roster/use-account-meta";
import { useRoster } from "../roster/use-roster";
import { useStatus } from "../status/use-status";
import { useUpdater } from "../updater/use-updater";
import { ShellDialogs } from "./dialogs";
import { ErrorToastGate } from "./error-toast-gate";
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
  const { accounts, loading, error, patchProfile } = useRoster();
  const statuses = useStatus(!loading, patchProfile);
  const { preferences, setPreference, patchPreferences } = usePreferences();
  const { signIn, pending } = useSignIn();
  const { remove, removeMany } = useForget();
  const { startMany, clearMany } = useCooldown();
  const { setPinned, setNote, setOverrides } = useAccountMeta();
  const { exportBackup, importBackup } = useMetadataBackup();
  const { notify } = useToast();
  const { exportCountFor, copyExport, exportFile, copyUsername, copySteamId } =
    useExport();
  const { available, busy, currentVersion, checkForUpdate, install, dismiss } =
    useUpdater(notify);
  const {
    selectedIds,
    selectAccount,
    clearSelection,
    selectAll,
    invertSelection,
  } = useSelection();
  const { filter, sort, setFilter, setSort } = useRosterView();
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
  } = useShellUi();
  const [noteTarget, setNoteTarget] = useState<AccountView | null>(null);
  const [overridesTarget, setOverridesTarget] = useState<AccountView | null>(
    null
  );

  const filtered = useMemo(() => {
    const matched = filterAccounts(
      accounts,
      ui.query,
      filter,
      statuses,
      now || nowSeconds(),
      preferences.warn_jwt_expiry_days
    );
    return sortAccounts(matched, sort);
  }, [
    accounts,
    filter,
    now,
    preferences.warn_jwt_expiry_days,
    sort,
    statuses,
    ui.query,
  ]);

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

  const openProfile = useCallback(
    async (steamid: string) => {
      try {
        await commands.openSteamProfile(steamid);
      } catch (cause) {
        notify(String(cause), "error");
      }
    },
    [notify]
  );

  const handleTogglePin = useCallback(
    (account: AccountView) => {
      setPinned(account.steamid, !account.pinned);
    },
    [setPinned]
  );

  const handleSaveNote = useCallback(
    (note: string) => {
      if (!noteTarget) {
        return;
      }
      setNote(noteTarget.steamid, note);
    },
    [noteTarget, setNote]
  );

  const handleSelectAll = useCallback(() => {
    selectAll(filtered);
  }, [filtered, selectAll]);

  const handleInvertSelection = useCallback(() => {
    invertSelection(filtered);
  }, [filtered, invertSelection]);

  useShellEvents({ notify, openImport });
  useShellShortcuts({
    clearSelection,
    closeSearch,
    onInvertSelection: handleInvertSelection,
    onSelectAll: handleSelectAll,
    openSearch,
    requestSignIn,
    searchOpen: ui.searchOpen,
    selectedIds,
  });

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

  const handleInstallUpdate = useCallback(() => {
    install().catch(() => undefined);
  }, [install]);

  const handleStartBulkCooldown = useCallback(
    (seconds: number) => {
      startMany(ui.bulkCooldownIds, seconds);
      closeBulkCooldown();
    },
    [startMany, ui.bulkCooldownIds, closeBulkCooldown]
  );

  const closeNote = useCallback(() => {
    setNoteTarget(null);
  }, []);

  const closeOverrides = useCallback(() => {
    setOverridesTarget(null);
  }, []);

  return (
    <div className={styles.app}>
      <Toolbar
        accountCount={accounts.length}
        countLabel={countLabel}
        filter={filter}
        onCloseSearch={closeSearch}
        onFilter={setFilter}
        onInvertSelection={handleInvertSelection}
        onOpenImport={openImport}
        onOpenSearch={openSearch}
        onOpenSettings={openSettings}
        onQueryChange={setQuery}
        onSelectAll={handleSelectAll}
        onSort={setSort}
        query={ui.query}
        searchOpen={ui.searchOpen}
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
          loading={loading}
          onClearCooldown={clearMany}
          onClearSelection={clearSelection}
          onCooldown={startMany}
          onCopyExport={copyExport}
          onCopySteamId={copySteamId}
          onCopyUsername={copyUsername}
          onCustomCooldown={askBulkCooldown}
          onEditNote={setNoteTarget}
          onEditOverrides={setOverridesTarget}
          onExportFile={exportFile}
          onImport={accounts.length === 0 ? openImport : undefined}
          onOpenProfile={openProfile}
          onRemove={askRemove}
          onSelect={selectAccount}
          onSignIn={requestSignIn}
          onTogglePin={handleTogglePin}
          pending={pending}
          selectedIds={selectedIds}
          statuses={statuses}
          streamer={preferences.streamer_mode}
        />
      </main>

      <LogPanel visible={preferences.show_log_panel} />
      <Footer currentVersion={currentVersion} />

      {error ? (
        <ErrorToastGate key={error} message={error} notify={notify} />
      ) : null}
      {!loading &&
      accounts.length > 0 &&
      preferences.warn_jwt_expiry_days > 0 ? (
        <JwtWarningGate
          accounts={accounts}
          notify={notify}
          warnDays={preferences.warn_jwt_expiry_days}
        />
      ) : null}

      <ShellDialogs
        available={available}
        bulkCooldownIds={ui.bulkCooldownIds}
        cooldownTarget={ui.cooldownTarget}
        currentVersion={currentVersion}
        importOpen={ui.importOpen}
        importPrefill={ui.importPrefill}
        importSession={ui.importSession}
        onChangePreference={setPreference}
        onCheckForUpdates={handleCheckForUpdates}
        onCloseBulkCooldown={closeBulkCooldown}
        onCloseCooldown={closeCooldown}
        onCloseImport={closeImport}
        onCloseRemove={closeRemove}
        onCloseSettings={closeSettings}
        onConfirmCooldownSignIn={handleConfirmCooldownSignIn}
        onConfirmRemove={handleConfirmRemove}
        onDismissUpdate={dismiss}
        onExportMetadata={exportBackup}
        onImportMetadata={importBackup}
        onInstallUpdate={handleInstallUpdate}
        onPatchPreferences={patchPreferences}
        onStartBulkCooldown={handleStartBulkCooldown}
        preferences={preferences}
        removeTargets={ui.removeTargets}
        settingsOpen={ui.settingsOpen}
        updateBusy={busy}
      />

      {noteTarget ? (
        <NoteDialog
          initial={noteTarget.note}
          key={noteTarget.steamid}
          name={noteTarget.display_name}
          onClose={closeNote}
          onSave={handleSaveNote}
          open
        />
      ) : null}
      {overridesTarget ? (
        <OverridesDialog
          account={overridesTarget}
          key={overridesTarget.steamid}
          onClose={closeOverrides}
          onSave={setOverrides}
          open
        />
      ) : null}
    </div>
  );
}
