import { Modal } from "./modal";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  danger?: boolean;
  confirmDisabled?: boolean;
  closeOnConfirm?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

/// A yes/no dialog built on `Modal`, used for destructive actions.
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  danger,
  confirmDisabled,
  closeOnConfirm = true,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      title={title}
      onClose={onClose}
      footer={
        <>
          <button className="btn" onClick={onClose}>
            Cancel
          </button>
          <button
            className={danger ? "btn btn-danger" : "btn btn-accent"}
            disabled={confirmDisabled}
            onClick={() => {
              onConfirm();
              if (closeOnConfirm) {
                onClose();
              }
            }}
          >
            {confirmLabel}
          </button>
        </>
      }
    >
      <p>{message}</p>
    </Modal>
  );
}
