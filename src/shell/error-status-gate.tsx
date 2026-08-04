import { notify } from "../feedback/status";
import { useMountEffect } from "../ui/widgets/use-mount-effect";

interface ErrorStatusGateProps {
  message: string;
}

/** Mount when an error string appears; post it to the footer once. */
export function ErrorStatusGate({ message }: ErrorStatusGateProps) {
  useMountEffect(() => {
    notify(message, "error");
  });
  return null;
}
