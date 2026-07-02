import { useState } from "react";

import { Modal } from "../feedback/modal";
import styles from "./cooldown-dialog.module.css";

const UNITS = [
  { label: "minutes", seconds: 60 },
  { label: "hours", seconds: 3600 },
  { label: "days", seconds: 86400 },
];

interface CooldownDialogProps {
  open: boolean;
  onClose: () => void;
  onStart: (seconds: number) => void;
}

/// Pick a custom cooldown duration as an amount plus a unit.
export function CooldownDialog({ open, onClose, onStart }: CooldownDialogProps) {
  const [amount, setAmount] = useState("1");
  const [unit, setUnit] = useState(3600);

  const seconds = Math.round(Number(amount) * unit);
  const valid = Number.isFinite(seconds) && seconds > 0;

  const submit = () => {
    if (!valid) {
      return;
    }
    onStart(seconds);
    onClose();
  };

  return (
    <Modal
      open={open}
      title="Custom cooldown"
      onClose={onClose}
      footer={
        <button className="btn btn-accent" disabled={!valid} onClick={submit}>
          Start cooldown
        </button>
      }
    >
      <div className={styles.controls}>
        <input
          className={`field ${styles.amount}`}
          type="number"
          min="1"
          value={amount}
          autoFocus
          onChange={(event) => setAmount(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              submit();
            }
          }}
        />
        <select
          className={`field ${styles.unit}`}
          value={unit}
          onChange={(event) => setUnit(Number(event.target.value))}
        >
          {UNITS.map((option) => (
            <option key={option.seconds} value={option.seconds}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </Modal>
  );
}
