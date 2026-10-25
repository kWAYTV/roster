/// An account as delivered by the backend, with the avatar inlined as a data URL.
export interface AccountView {
  account_name: string;
  always_invisible: boolean | null;
  avatar: string | null;
  cooldown_duration: number;
  /** Unix seconds; 0 when no cooldown is set. */
  cooldown_until: number;
  cs2_launch_options: string | null;
  display_name: string;
  /** Whether a decryptable JWT is present in ConnectCache. */
  has_token: boolean;
  initials: string;
  /** Registry AutoLoginUser match — the account Steam is signed into. */
  is_autologin: boolean;
  /** Seconds until JWT expiry; 0 = unknown/none; -1 = expired. */
  jwt_expires_in: number;
  /** Unix seconds; 0 when never used through this app. */
  last_used: number;
  launch_cs2: boolean | null;
  most_recent: boolean;
  mute_notifications: boolean | null;
  note: string;
  persona_name: string;
  pinned: boolean;
  steamid: string;
  tags: string[];
}

const GENERATED_USERNAME = /^user\d{6}$/;

/// `user` plus the last 6 SteamID digits — the placeholder used when a token has no login.
export function isGeneratedUsername(value: string): boolean {
  return GENERATED_USERNAME.test(value);
}

/// Login shown in the UI. Placeholder names fall back to the SteamID.
export function visibleAccountName(account: AccountView): string {
  if (isGeneratedUsername(account.account_name)) {
    return account.steamid;
  }
  return account.account_name;
}
