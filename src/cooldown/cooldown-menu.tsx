import { useState } from "react";
import { ClockIcon } from "@/ui/icons/clock";
import { Hint } from "@/ui/widgets/hint";
import { Button } from "@/ui/primitives/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/ui/primitives/dropdown-menu";
import { COOLDOWN_PRESETS, isCooldownActive } from "./cooldown";
import { CooldownDialog } from "./cooldown-dialog";
import { useCooldown } from "./use-cooldown";

interface CooldownMenuProps {
  steamid: string;
  until: number;
  disabled: boolean;
}

export function CooldownMenu({ steamid, until, disabled }: CooldownMenuProps) {
  const [customOpen, setCustomOpen] = useState(false);
  const { start, clear } = useCooldown();

  return (
    <>
      <DropdownMenu>
        <Hint label="Set cooldown">
          <DropdownMenuTrigger
            disabled={disabled}
            render={
              <Button variant="ghost" size="icon-sm" aria-label="Set cooldown" />
            }
          >
            <ClockIcon size={16} />
          </DropdownMenuTrigger>
        </Hint>
        <DropdownMenuContent align="end" className="min-w-40 w-auto">
          {COOLDOWN_PRESETS.map((preset) => (
            <DropdownMenuItem
              key={preset.seconds}
              onClick={() => start(steamid, preset.seconds)}
            >
              {preset.label}
            </DropdownMenuItem>
          ))}
          <DropdownMenuItem onClick={() => setCustomOpen(true)}>Custom…</DropdownMenuItem>
          {isCooldownActive(until) ? (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => clear(steamid)}>Clear cooldown</DropdownMenuItem>
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
      <CooldownDialog
        open={customOpen}
        onClose={() => setCustomOpen(false)}
        onStart={(seconds) => start(steamid, seconds)}
      />
    </>
  );
}
