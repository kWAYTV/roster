import { useCallback, useState } from "react";

import { Button } from "@/ui/primitives/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/ui/primitives/dialog";
import { Input } from "@/ui/primitives/input";
import { Label } from "@/ui/primitives/label";
import type { OverridePatch } from "../platform/invoke";
import type { AccountView } from "./account";
import {
  fromTri,
  OverrideTriField,
  type TriState,
  toTri,
} from "./override-tri-field";

interface OverridesDialogProps {
  account: AccountView;
  onClose: () => void;
  onSave: (steamid: string, patch: OverridePatch) => void;
  open: boolean;
}

/// Parent should remount with `key={account.steamid}` when the target changes.
export function OverridesDialog({
  open,
  account,
  onSave,
  onClose,
}: OverridesDialogProps) {
  const [invisible, setInvisible] = useState<TriState>(() =>
    toTri(account.always_invisible)
  );
  const [mute, setMute] = useState<TriState>(() =>
    toTri(account.mute_notifications)
  );
  const [cs2, setCs2] = useState<TriState>(() => toTri(account.launch_cs2));
  const [cs2Options, setCs2Options] = useState(
    () => account.cs2_launch_options ?? ""
  );
  const [cs2OptionsInherit, setCs2OptionsInherit] = useState(
    () => account.cs2_launch_options === null
  );

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (!next) {
        onClose();
      }
    },
    [onClose]
  );

  const inheritCs2Options = useCallback(() => {
    setCs2OptionsInherit(true);
  }, []);

  const customCs2Options = useCallback(() => {
    setCs2OptionsInherit(false);
  }, []);

  const handleCs2OptionsChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setCs2Options(event.target.value);
    },
    []
  );

  const handleSave = useCallback(() => {
    onSave(account.steamid, {
      always_invisible: fromTri(invisible),
      cs2_launch_options: cs2OptionsInherit ? null : cs2Options,
      launch_cs2: fromTri(cs2),
      mute_notifications: fromTri(mute),
    });
    onClose();
  }, [
    account.steamid,
    cs2,
    cs2Options,
    cs2OptionsInherit,
    invisible,
    mute,
    onClose,
    onSave,
  ]);

  return (
    <Dialog onOpenChange={handleOpenChange} open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sign-in overrides</DialogTitle>
          <DialogDescription>
            Per-account overrides for {account.display_name}. Inherit uses
            global settings.
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="gap-3.5">
          <OverrideTriField
            label="Always invisible"
            onChange={setInvisible}
            value={invisible}
          />
          <OverrideTriField
            label="Mute notifications"
            onChange={setMute}
            value={mute}
          />
          <OverrideTriField label="Launch CS2" onChange={setCs2} value={cs2} />

          <div className="flex flex-col gap-1.5">
            <Label>CS2 launch options</Label>
            <div className="flex gap-1.5">
              <Button
                className="flex-1"
                onClick={inheritCs2Options}
                size="xs"
                type="button"
                variant={cs2OptionsInherit ? "default" : "outline"}
              >
                Inherit
              </Button>
              <Button
                className="flex-1"
                onClick={customCs2Options}
                size="xs"
                type="button"
                variant={cs2OptionsInherit ? "outline" : "default"}
              >
                Custom
              </Button>
            </div>
            {cs2OptionsInherit ? null : (
              <Input
                autoFocus
                onChange={handleCs2OptionsChange}
                placeholder="-nojoy -high"
                value={cs2Options}
              />
            )}
          </div>
        </DialogBody>

        <DialogFooter>
          <Button onClick={onClose} size="sm" variant="outline">
            Cancel
          </Button>
          <Button onClick={handleSave} size="sm">
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
