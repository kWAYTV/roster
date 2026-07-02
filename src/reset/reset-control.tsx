import { useState } from "react";

import { ConfirmDialog } from "../feedback/confirm-dialog";
import { useReset } from "./use-reset";

export function ResetControl() {
  const { reset } = useReset();
  const [confirming, setConfirming] = useState(false);

  return (
    <>
      <button className="btn-link" onClick={() => setConfirming(true)}>
        Reset local login data
      </button>
      <ConfirmDialog
        open={confirming}
        title="Reset login data"
        message="This clears every saved Steam login on this PC. Continue?"
        confirmLabel="Reset"
        danger
        onConfirm={reset}
        onClose={() => setConfirming(false)}
      />
    </>
  );
}
