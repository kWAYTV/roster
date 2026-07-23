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
}
