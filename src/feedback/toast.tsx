import { toast } from "sonner";

type ToastKind = "ok" | "error";

interface ToastApi {
  notify: (message: string, kind?: ToastKind) => void;
}

export function notify(message: string, kind: ToastKind = "ok") {
  if (kind === "error") {
    toast.error(message);
    return;
  }
  toast.success(message);
}

export function useToast(): ToastApi {
  return { notify };
}
