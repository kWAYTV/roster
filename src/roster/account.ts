/// An account as delivered by the backend, with the avatar inlined as a data URL.
export interface AccountView {
  steamid: string;
  account_name: string;
  persona_name: string;
  display_name: string;
  initials: string;
  most_recent: boolean;
  avatar: string | null;
}
