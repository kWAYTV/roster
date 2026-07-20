import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SearchIcon, SettingsIcon, XIcon } from "lucide-react";

import { Hint } from "@/components/hint";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import type { AccountView } from "./roster/account";
import { RosterList } from "./roster/roster-list";
import { useRoster } from "./roster/use-roster";
import { useStatus } from "./status/use-status";
import { useUpdater } from "./updater/use-updater";
import styles from "./app.module.css";

const GITHUB_REPO = "https://github.com/kWAYTV/roster";

export function App() {
  const { accounts, loading, error, patchProfile } = useRoster();
  const statuses = useStatus(!loading, patchProfile);
  const { preferences, setPreference, patchPreferences } = usePreferences();
  const { signIn, pending } = useSignIn();
  const { remove, removeMany } = useForget();
  const { startMany, clearMany } = useCooldown();
  const { notify } = useToast();
  const { available, busy, currentVersion, checkForUpdate, install, dismiss } =
    useUpdater(notify);

  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [importPrefill, setImportPrefill] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [removeTargets, setRemoveTargets] = useState<AccountView[]>([]);
  const [cooldownTarget, setCooldownTarget] = useState<AccountView | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [bulkCooldownIds, setBulkCooldownIds] = useState<string[]>([]);
  const searchRef = useRef<HTMLInputElement>(null);

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

  const openImport = useCallback((prefill = "") => {
    setImportPrefill(prefill);
    setImportOpen(true);
  }, []);

  const closeSearch = useCallback(() => {
    setSearchOpen(false);
    setQuery("");
  }, []);

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
      onImportRequest((text) => openImport(text.trim())),
    ];
    return () => {
      subscriptions.forEach((subscription) => subscription.then((stop) => stop()));
    };
  }, [notify, openImport]);

  useEffect(() => {
    if (error) {
      notify(error, "error");
    }
  }, [error, notify]);

  useEffect(() => {
    if (searchOpen) {
      searchRef.current?.focus();
    }
  }, [searchOpen]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (searchOpen) {
          closeSearch();
          return;
        }
        clearSelection();
      }
      if (event.altKey && event.key === "Enter" && selectedIds.size === 1) {
        const steamid = [...selectedIds][0];
        if (steamid) {
          requestSignIn(steamid);
        }
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "f") {
        event.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [clearSelection, closeSearch, requestSignIn, searchOpen, selectedIds]);

  const filtered = useMemo(() => filterAccounts(accounts, query), [accounts, query]);
  const countLabel =
    filtered.length === accounts.length
      ? `${accounts.length}`
      : `${filtered.length}/${accounts.length}`;

  return (
    <div className={styles.app}>
      <header className={styles.toolbar}>
        {searchOpen ? (
          <>
            <SearchIcon className={styles.searchGlyph} aria-hidden="true" />
            <Input
              ref={searchRef}
              className={styles.searchInput}
              placeholder="Filter accounts"
              aria-label="Filter accounts"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            {accounts.length > 0 ? (
              <Badge variant="secondary" className={styles.count}>
                {countLabel}
              </Badge>
            ) : null}
            <Hint label="Close search">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Close search"
                onClick={closeSearch}
              >
                <XIcon />
              </Button>
            </Hint>
          </>
        ) : (
          <>
            <div className={styles.brand}>
              <span className={styles.title}>Roster</span>
              {accounts.length > 0 ? (
                <Badge variant="secondary" className={styles.count}>
                  {accounts.length}
                </Badge>
              ) : null}
            </div>
            <div className={styles.actions}>
              <Button
                variant="outline"
                size="sm"
                className={styles.importBtn}
                onClick={() => openImport()}
              >
                Import
              </Button>
              <Hint label="Search accounts">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Search accounts"
                  onClick={() => setSearchOpen(true)}
                >
                  <SearchIcon />
                </Button>
              </Hint>
              <Hint label="Settings">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Settings"
                  onClick={() => setSettingsOpen(true)}
                >
                  <SettingsIcon />
                </Button>
              </Hint>
            </div>
          </>
        )}
      </header>

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
        <div className={styles.footMeta}>
          <span className={styles.version}>v{currentVersion ?? "…"}</span>
          <Button
            type="button"
            variant="link"
            size="sm"
            className={styles.footLink}
            onClick={() => void commands.openExternalUrl(GITHUB_REPO)}
          >
            GitHub
          </Button>
        </div>
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
        currentVersion={currentVersion}
        updateBusy={busy}
        onChange={setPreference}
        onPatch={patchPreferences}
        onCheckForUpdates={() => void checkForUpdate(true)}
        onClose={() => setSettingsOpen(false)}
      />
      <ConfirmDialog
        open={available !== null}
        title="Update available"
        message={
          available
            ? `Roster ${available.version} is ready. Install now and restart?`
            : ""
        }
        confirmLabel={busy ? "Installing…" : "Install and restart"}
        confirmDisabled={busy}
        closeOnConfirm={false}
        onConfirm={() => void install()}
        onClose={dismiss}
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
