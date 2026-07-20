/// Live account status as reported by Steam Community profiles.

export type OnlineState = "offline" | "online" | "in-game";

export interface AccountStatus {
  game: string;
  state: OnlineState;
}

export type StatusMap = Record<string, AccountStatus>;
