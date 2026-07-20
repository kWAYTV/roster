import { useMountEffect } from "../ui/use-mount-effect";

interface ErrorToastGateProps {
  message: string;
  notify: (message: string, kind?: "ok" | "error") => void;
}

/// Mount when an error string appears; toast once for that message.
export function ErrorToastGate({ message, notify }: ErrorToastGateProps) {
  useMountEffect(() => {
    notify(message, "error");
  });
  return null;
}
