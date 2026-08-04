import { notify } from "../feedback/status";
import type { AccountView } from "../roster/account";
import { useMountEffect } from "../ui/widgets/use-mount-effect";

const DAY_SECONDS = 86_400;

interface JwtWarningGateProps {
  accounts: AccountView[];
  warnDays: number;
}

/** Mounts once the roster is ready; posts JWT expiry to the footer once. */
export function JwtWarningGate({ accounts, warnDays }: JwtWarningGateProps) {
  useMountEffect(() => {
    if (warnDays <= 0 || accounts.length === 0) {
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
  });

  return null;
}
