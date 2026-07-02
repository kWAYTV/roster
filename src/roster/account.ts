/// An account as delivered by the backend, with the avatar inlined as a data URL.
export interface AccountView {
  steamid: string;
  account_name: string;
  persona_name: string;
  display_name: string;
  initials: string;
  most_recent: boolean;
  avatar: string | null;
  /** Unix seconds; 0 when never used through this app. */
  last_used: number;
  /** Unix seconds; 0 when no cooldown is set. */
  cooldown_until: number;
  cooldown_duration: number;
}
