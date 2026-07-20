import { useEffect, useRef } from "react";

import type { AccountView } from "../roster/account";

const DAY_SECONDS = 86_400;

interface JwtWarningsOptions {
  accounts: AccountView[];
  notify: (message: string, kind?: "ok" | "error") => void;
  warnDays: number;
}

/// Toast once per session when tokens expire within the configured window.
export function useJwtWarnings({
  accounts,
  warnDays,
  notify,
}: JwtWarningsOptions) {
  const warned = useRef(false);

  useEffect(() => {
    if (warned.current || warnDays <= 0 || accounts.length === 0) {
      return;
    }
    const windowSeconds = warnDays * DAY_SECONDS;
    const soon = accounts.filter(
      (account) =>
        account.jwt_expires_in > 0 && account.jwt_expires_in <= windowSeconds
    );
    const expired = accounts.filter((account) => account.jwt_expires_in < 0);
    if (soon.length === 0 && expired.length === 0) {
      return;
    }
    warned.current = true;
    if (soon.length && expired.length) {
      notify(
        `${soon.length} token(s) expire soon · ${expired.length} expired`,
        "error"
      );
      return;
    }
    if (soon.length) {
      notify(
        soon.length === 1
          ? "1 token expires soon"
          : `${soon.length} tokens expire soon`,
        "error"
      );
      return;
    }
    notify(
      expired.length === 1
        ? "1 token expired"
        : `${expired.length} tokens expired`,
      "error"
    );
  }, [accounts, notify, warnDays]);
}
