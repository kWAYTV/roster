import { useEffect } from "react";

interface ShellShortcutsOptions {
  clearSelection: () => void;
  closeSearch: () => void;
  openSearch: () => void;
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
  requestSignIn,
}: ShellShortcutsOptions) {
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
        const [steamid] = [...selectedIds];
        if (steamid) {
          requestSignIn(steamid);
        }
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "f") {
        event.preventDefault();
        openSearch();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [
    clearSelection,
    closeSearch,
    openSearch,
    requestSignIn,
    searchOpen,
    selectedIds,
  ]);
}
