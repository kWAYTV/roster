import { useCallback, useEffect, useState } from "react";

import { Button } from "@/ui/primitives/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/ui/primitives/dialog";
import { Input } from "@/ui/primitives/input";
import { Label } from "@/ui/primitives/label";
import type { OverridePatch } from "../platform/invoke";
import type { AccountView } from "./account";

type Tri = "inherit" | "on" | "off";

interface OverridesDialogProps {
  account: AccountView | null;
  onClose: () => void;
  onSave: (steamid: string, patch: OverridePatch) => void;
  open: boolean;
}

export function OverridesDialog({
  open,
  account,
  onSave,
  onClose,
}: OverridesDialogProps) {
  const [invisible, setInvisible] = useState<Tri>("inherit");
  const [mute, setMute] = useState<Tri>("inherit");
  const [cs2, setCs2] = useState<Tri>("inherit");
  const [cs2Options, setCs2Options] = useState("");
  const [cs2OptionsInherit, setCs2OptionsInherit] = useState(true);

  useEffect(() => {
    if (!(open && account)) {
      return;
    }
    setInvisible(toTri(account.always_invisible));
    setMute(toTri(account.mute_notifications));
    setCs2(toTri(account.launch_cs2));
    setCs2OptionsInherit(account.cs2_launch_options === null);
    setCs2Options(account.cs2_launch_options ?? "");
  }, [open, account]);

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
    if (!account) {
      return;
    }
    onSave(account.steamid, {
      always_invisible: fromTri(invisible),
      cs2_launch_options: cs2OptionsInherit ? null : cs2Options,
      launch_cs2: fromTri(cs2),
      mute_notifications: fromTri(mute),
    });
    onClose();
  }, [
    account,
    cs2,
    cs2Options,
    cs2OptionsInherit,
    invisible,
    mute,
    onClose,
    onSave,
  ]);

  if (!account) {
    return null;
  }

  return (
    <Dialog onOpenChange={handleOpenChange} open={open}>
      <DialogContent className="gap-4 p-5 sm:max-w-md" showCloseButton>
        <DialogHeader className="pr-8">
          <DialogTitle>Sign-in overrides</DialogTitle>
          <DialogDescription>
            Per-account overrides for {account.display_name}. Inherit uses
            global settings.
          </DialogDescription>
        </DialogHeader>

        <TriField
          label="Always invisible"
          onChange={setInvisible}
          value={invisible}
        />
        <TriField label="Mute notifications" onChange={setMute} value={mute} />
        <TriField label="Launch CS2" onChange={setCs2} value={cs2} />

        <div className="flex flex-col gap-1.5">
          <Label>CS2 launch options</Label>
          <div className="flex gap-2">
            <Button
              onClick={inheritCs2Options}
              size="xs"
              variant={cs2OptionsInherit ? "default" : "outline"}
            >
              Inherit
            </Button>
            <Button
              onClick={customCs2Options}
              size="xs"
              variant={cs2OptionsInherit ? "outline" : "default"}
            >
              Custom
            </Button>
          </div>
          {cs2OptionsInherit ? null : (
            <Input
              onChange={handleCs2OptionsChange}
              placeholder="-nojoy -high"
              value={cs2Options}
            />
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button onClick={onClose} size="sm" variant="outline">
            Cancel
          </Button>
          <Button onClick={handleSave} size="sm">
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function TriField({
  label,
  value,
  onChange,
}: {
  label: string;
  onChange: (value: Tri) => void;
  value: Tri;
}) {
  const selectInherit = useCallback(() => {
    onChange("inherit");
  }, [onChange]);
  const selectOn = useCallback(() => {
    onChange("on");
  }, [onChange]);
  const selectOff = useCallback(() => {
    onChange("off");
  }, [onChange]);

  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <Button
          onClick={selectInherit}
          size="xs"
          variant={value === "inherit" ? "default" : "outline"}
        >
          Inherit
        </Button>
        <Button
          onClick={selectOn}
          size="xs"
          variant={value === "on" ? "default" : "outline"}
        >
          On
        </Button>
        <Button
          onClick={selectOff}
          size="xs"
          variant={value === "off" ? "default" : "outline"}
        >
          Off
        </Button>
      </div>
    </div>
  );
}

function toTri(value: boolean | null): Tri {
  if (value === null) {
    return "inherit";
  }
  return value ? "on" : "off";
}

function fromTri(value: Tri): boolean | null {
  if (value === "inherit") {
    return null;
  }
  return value === "on";
}
