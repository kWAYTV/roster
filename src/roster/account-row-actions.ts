import type { AccountView } from "./account";

/// Every callback a roster row or its context menu can fire. The shell builds
/// this once (memoized) so rows can be `memo`'d and skip unrelated renders.
export interface AccountRowActions {
  onClearCooldown: (steamids: string[]) => void;
  onCooldown: (steamids: string[], seconds: number) => void;
  onCopyExport: (steamids: string[]) => void;
  onCopySteamId: (account: AccountView) => void;
  onCopyUsername: (account: AccountView) => void;
  onCustomCooldown: (steamids: string[]) => void;
  onEditDetails: (account: AccountView) => void;
  onEditOverrides: (account: AccountView) => void;
  onExportFile: (steamids: string[]) => void;
  onOpenProfile: (steamid: string) => void;
  onPin: (steamids: string[], pinned: boolean) => void;
  onReimport: (account: AccountView) => void;
  onRemove: (accounts: AccountView[]) => void;
  onSelect: (account: AccountView, additive: boolean) => void;
  onSignIn: (steamid: string, forceInvisible?: boolean) => void;
  onTogglePin: (account: AccountView) => void;
}
