import { useCallback, useEffect, useMemo, useState } from "react";

import { formatRemaining, isCooldownActive } from "./cooldown/cooldown";
import { CooldownDialog } from "./cooldown/cooldown-dialog";
import { useCooldown } from "./cooldown/use-cooldown";
import { ConfirmDialog } from "./feedback/confirm-dialog";
import { LogPanel } from "./feedback/log-panel";
import { useToast } from "./feedback/toast";
import { useForget } from "./forget/use-forget";
import { ImportDialog } from "./intake/import-dialog";
import {
  onCooldownFinished,
  onImportRequest,
  onStatus,
  onStatusError,
} from "./ipc/events";
import { commands } from "./ipc/invoke";
import { useSignIn } from "./login/use-login";
import { SettingsDialog } from "./preferences/settings-dialog";
import { usePreferences } from "./preferences/use-preferences";
import { ResetControl } from "./reset/reset-control";
import type { AccountView } from "./roster/account";
import { RosterList } from "./roster/roster-list";
import { useRoster } from "./roster/use-roster";
import { useStatus } from "./status/use-status";
import styles from "./app.module.css";

export function App() {
  const { accounts, loading, error } = useRoster();
  const statuses = useStatus();
  const { preferences, setPreference, patchPreferences } = usePreferences();
  const { signIn, pending } = useSignIn();
  const { remove, removeMany } = useForget();
  const { startMany, clearMany } = useCooldown();
  const { notify } = useToast();

  const [query, setQuery] = useState("");
  const [importOpen, setImportOpen] = useState(false);
  const [importPrefill, setImportPrefill] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [removeTargets, setRemoveTargets] = useState<AccountView[]>([]);
  const [cooldownTarget, setCooldownTarget] = useState<AccountView | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [bulkCooldownIds, setBulkCooldownIds] = useState<string[]>([]);

  const requestSignIn = useCallback(
    (steamid: string) => {
      const account = accounts.find((candidate) => candidate.steamid === steamid);
      if (account && isCooldownActive(account.cooldown_until)) {
        setCooldownTarget(account);
        return;
      }
      signIn(steamid);
    },
    [accounts, signIn],
  );

  const selectAccount = useCallback((account: AccountView, additive: boolean) => {
    setSelectedIds((current) => {
      const next = additive ? new Set(current) : new Set<string>();
      if (additive && current.has(account.steamid)) {
        next.delete(account.steamid);
      } else {
        next.add(account.steamid);
      }
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const exportCountFor = useCallback(
    (steamids: string[]) => {
      const byId = new Map(accounts.map((account) => [account.steamid, account]));
      return steamids.filter((steamid) => {
        const account = byId.get(steamid);
        return account && account.jwt_expires_in !== 0;
      }).length;
    },
    [accounts],
  );

  const copyExport = useCallback(
    async (steamids: string[]) => {
      try {
        const lines = await commands.exportTokenEntries(steamids);
        if (!lines.length) {
          notify("No saved tokens to export.", "error");
          return;
        }
        await commands.writeClipboard(lines.join("\n"));
        const skipped = steamids.length - lines.length;
        notify(
          skipped
            ? `Copied ${lines.length} token(s). ${skipped} missing.`
            : `Copied ${lines.length} token(s).`,
        );
      } catch (cause) {
        notify(String(cause), "error");
      }
    },
    [notify],
  );

  const exportFile = useCallback(
    async (steamids: string[]) => {
      try {
        const lines = await commands.exportTokenEntries(steamids);
        if (!lines.length) {
          notify("No saved tokens to export.", "error");
          return;
        }
        const blob = new Blob([`${lines.join("\n")}\n`], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = "tokens.txt";
        anchor.click();
        URL.revokeObjectURL(url);
        notify(`Exported ${lines.length} token(s).`);
      } catch (cause) {
        notify(String(cause), "error");
      }
    },
    [notify],
  );

  const copyUsername = useCallback(
    async (account: AccountView) => {
      if (!account.account_name) {
        return;
      }
      try {
        await commands.writeClipboard(account.account_name);
        notify("Username copied.");
      } catch (cause) {
        notify(String(cause), "error");
      }
    },
    [notify],
  );

  const openProfile = useCallback(
    async (steamid: string) => {
      try {
        await commands.openSteamProfile(steamid);
      } catch (cause) {
        notify(String(cause), "error");
      }
    },
    [notify],
  );

  useEffect(() => {
    const subscriptions = [
      onStatus(notify),
      onStatusError((message) => notify(message, "error")),
      onCooldownFinished((names) => {
        if (names.length === 1) {
          notify(`${names[0]} cooldown finished.`);
        } else {
          notify(`${names.length} accounts ready.`);
        }
      }),
      onImportRequest((text) => {
        setImportPrefill(text);
        setImportOpen(true);
      }),
    ];
    return () => {
      subscriptions.forEach((subscription) => subscription.then((stop) => stop()));
    };
  }, [notify]);

  useEffect(() => {
    if (error) {
      notify(error, "error");
    }
  }, [error, notify]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        clearSelection();
      }
      if (event.altKey && event.key === "Enter" && selectedIds.size === 1) {
        const steamid = [...selectedIds][0];
        if (steamid) {
          requestSignIn(steamid);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [clearSelection, requestSignIn, selectedIds]);

  const filtered = useMemo(() => filterAccounts(accounts, query), [accounts, query]);

  return (
    <div className={styles.app}>
      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <SearchIcon />
          <input
            className={styles.searchInput}
            placeholder="Search accounts"
            aria-label="Search accounts"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        {accounts.length > 0 ? (
          <span className={styles.count}>
            {filtered.length === accounts.length
              ? `${accounts.length}`
              : `${filtered.length}/${accounts.length}`}
          </span>
        ) : null}
        <button className="btn btn-accent btn-sm" onClick={() => setImportOpen(true)}>
          Import
        </button>
        <button className="btn-icon" aria-label="Settings" onClick={() => setSettingsOpen(true)}>
          <GearIcon />
        </button>
      </div>

      <main className={styles.main}>
        <RosterList
          accounts={filtered}
          loading={loading}
          streamer={preferences.streamer_mode}
          pending={pending}
          statuses={statuses}
          selectedIds={selectedIds}
          onSelect={selectAccount}
          onClearSelection={clearSelection}
          onSignIn={requestSignIn}
          onRemove={setRemoveTargets}
          onCopyUsername={copyUsername}
          onOpenProfile={openProfile}
          onCopyExport={copyExport}
          onExportFile={exportFile}
          onCooldown={(steamids, seconds) => startMany(steamids, seconds)}
          onClearCooldown={(steamids) => clearMany(steamids)}
          onCustomCooldown={(steamids) => setBulkCooldownIds(steamids)}
          exportCountFor={exportCountFor}
        />
      </main>

      <LogPanel visible={preferences.show_log_panel} />

      <footer className={styles.foot}>
        <ResetControl />
      </footer>

      <ImportDialog
        open={importOpen}
        prefill={importPrefill}
        onClose={() => {
          setImportOpen(false);
          setImportPrefill("");
        }}
      />
      <SettingsDialog
        open={settingsOpen}
        preferences={preferences}
        onChange={setPreference}
        onPatch={patchPreferences}
        onClose={() => setSettingsOpen(false)}
      />
      <ConfirmDialog
        open={removeTargets.length > 0}
        title={removeTargets.length > 1 ? "Remove accounts" : "Remove account"}
        message={removeMessage(removeTargets, preferences.streamer_mode)}
        confirmLabel="Remove"
        danger
        onConfirm={() => {
          const ids = removeTargets.map((account) => account.steamid);
          if (ids.length === 1) {
            remove(ids[0]);
          } else {
            removeMany(ids);
          }
          clearSelection();
        }}
        onClose={() => setRemoveTargets([])}
      />
      <ConfirmDialog
        open={cooldownTarget !== null}
        title="Account on cooldown"
        message={cooldownMessage(cooldownTarget, preferences.streamer_mode)}
        confirmLabel="Sign in anyway"
        danger
        onConfirm={() => cooldownTarget && signIn(cooldownTarget.steamid)}
        onClose={() => setCooldownTarget(null)}
      />
      <CooldownDialog
        open={bulkCooldownIds.length > 0}
        onClose={() => setBulkCooldownIds([])}
        onStart={(seconds) => {
          startMany(bulkCooldownIds, seconds);
          setBulkCooldownIds([]);
        }}
      />
    </div>
  );
}

function filterAccounts(accounts: AccountView[], query: string): AccountView[] {
  const needle = query.trim().toLowerCase();
  if (!needle) {
    return accounts;
  }
  return accounts.filter((account) =>
    `${account.display_name} ${account.account_name}`.toLowerCase().includes(needle),
  );
}

function removeMessage(accounts: AccountView[], streamer: boolean): string {
  if (!accounts.length) {
    return "";
  }
  if (accounts.length > 1) {
    return `Remove ${accounts.length} accounts?`;
  }
  const name = streamer ? "this account" : accounts[0].display_name;
  return `Remove ${name}?`;
}

function cooldownMessage(account: AccountView | null, streamer: boolean): string {
  if (!account) {
    return "";
  }
  const name = streamer ? "This account" : account.display_name;
  const remaining = formatRemaining(account.cooldown_until);
  return remaining
    ? `${name} is on cooldown for another ${remaining}. Sign in anyway?`
    : `${name} is on cooldown. Sign in anyway?`;
}

function GearIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg
      className={styles.searchIcon}
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-4-4" />
    </svg>
  );
}
