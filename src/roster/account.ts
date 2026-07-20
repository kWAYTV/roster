/// An account as delivered by the backend, with the avatar inlined as a data URL.
export interface AccountView {
  account_name: string;
  avatar: string | null;
  cooldown_duration: number;
  /** Unix seconds; 0 when no cooldown is set. */
  cooldown_until: number;
  display_name: string;
  initials: string;
  /** Seconds until JWT expiry; 0 = unknown/none; -1 = expired. */
  jwt_expires_in: number;
  /** Unix seconds; 0 when never used through this app. */
  last_used: number;
  most_recent: boolean;
  persona_name: string;
  steamid: string;
}
