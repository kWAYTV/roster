import { useEffect } from "react";

interface ShellShortcutsOptions {
  clearSelection: () => void;
  closeSearch: () => void;
  onInvertSelection: () => void;
  onSelectAll: () => void;
  openSearch: () => void;
  requestRemoveSelection: () => void;
  requestSignIn: (steamid: string) => void;
  searchOpen: boolean;
  selectedIds: Set<string>;
}

export function useShellShortcuts({
  searchOpen,
  selectedIds,
  closeSearch,
  clearSelection,
  openSearch,
  requestRemoveSelection,
  requestSignIn,
  onSelectAll,
  onInvertSelection,
}: ShellShortcutsOptions) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      handleShortcut(event, {
        clearSelection,
        closeSearch,
        onInvertSelection,
        onSelectAll,
        openSearch,
        requestRemoveSelection,
        requestSignIn,
        searchOpen,
        selectedIds,
      });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [
    clearSelection,
    closeSearch,
    onInvertSelection,
    onSelectAll,
    openSearch,
    requestRemoveSelection,
    requestSignIn,
    searchOpen,
    selectedIds,
  ]);
}

function handleShortcut(
  event: KeyboardEvent,
  options: ShellShortcutsOptions
): void {
  if (handleEscape(event, options)) {
    return;
  }
  if (handleSignInShortcut(event, options)) {
    return;
  }
  if (handleRemoveShortcut(event, options)) {
    return;
  }
  if (handleSearchShortcut(event, options)) {
    return;
  }
  handleSelectionShortcuts(event, options);
}

function handleEscape(
  event: KeyboardEvent,
  options: Pick<
    ShellShortcutsOptions,
    "searchOpen" | "closeSearch" | "clearSelection"
  >
): boolean {
  if (event.key !== "Escape") {
    return false;
  }
  if (options.searchOpen) {
    options.closeSearch();
    return true;
  }
  options.clearSelection();
  return true;
}

function handleSignInShortcut(
  event: KeyboardEvent,
  options: Pick<ShellShortcutsOptions, "selectedIds" | "requestSignIn">
): boolean {
  if (
    !(event.altKey && event.key === "Enter" && options.selectedIds.size === 1)
  ) {
    return false;
  }
  const [steamid] = [...options.selectedIds];
  if (!steamid) {
    return true;
  }
  options.requestSignIn(steamid);
  return true;
}

function handleRemoveShortcut(
  event: KeyboardEvent,
  options: Pick<ShellShortcutsOptions, "selectedIds" | "requestRemoveSelection">
): boolean {
  if (event.key !== "Delete" && event.key !== "Backspace") {
    return false;
  }
  if (isEditable(event.target) || options.selectedIds.size === 0) {
    return false;
  }
  event.preventDefault();
  options.requestRemoveSelection();
  return true;
}

function handleSearchShortcut(
  event: KeyboardEvent,
  options: Pick<ShellShortcutsOptions, "openSearch">
): boolean {
  if (!((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "f")) {
    return false;
  }
  event.preventDefault();
  options.openSearch();
  return true;
}

function handleSelectionShortcuts(
  event: KeyboardEvent,
  options: Pick<ShellShortcutsOptions, "onSelectAll" | "onInvertSelection">
): void {
  if (!(event.ctrlKey || event.metaKey) || isEditable(event.target)) {
    return;
  }
  const key = event.key.toLowerCase();
  if (key === "a") {
    event.preventDefault();
    options.onSelectAll();
    return;
  }
  if (key === "i") {
    event.preventDefault();
    options.onInvertSelection();
  }
}

function isEditable(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || target.isContentEditable;
}
