import { useCallback, useState } from "react";
import { ClockIcon } from "@/ui/icons/clock";
import { Button } from "@/ui/primitives/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/ui/primitives/dropdown-menu";
import { Hint } from "@/ui/widgets/hint";
import { COOLDOWN_PRESETS, isCooldownActive } from "./cooldown";
import { CooldownDialog } from "./cooldown-dialog";
import { useCooldown } from "./use-cooldown";

interface CooldownMenuProps {
  disabled: boolean;
  steamid: string;
  until: number;
}

export function CooldownMenu({ steamid, until, disabled }: CooldownMenuProps) {
  const [customOpen, setCustomOpen] = useState(false);
  const { start, clear } = useCooldown();

  const openCustom = useCallback(() => {
    setCustomOpen(true);
  }, []);

  const closeCustom = useCallback(() => {
    setCustomOpen(false);
  }, []);

  const handleClear = useCallback(() => {
    clear(steamid);
  }, [clear, steamid]);

  const handleStart = useCallback(
    (seconds: number) => {
      start(steamid, seconds);
    },
    [start, steamid]
  );

  const handlePresetClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const seconds = Number(event.currentTarget.dataset.seconds);
      if (Number.isFinite(seconds)) {
        start(steamid, seconds);
      }
    },
    [start, steamid]
  );

  return (
    <>
      <DropdownMenu>
        <Hint label="Set cooldown">
          <DropdownMenuTrigger
            disabled={disabled}
            render={
              <Button
                aria-label="Set cooldown"
                size="icon-sm"
                variant="ghost"
              />
            }
          >
            <ClockIcon size={16} />
          </DropdownMenuTrigger>
        </Hint>
        <DropdownMenuContent align="end" className="w-auto min-w-40">
          {COOLDOWN_PRESETS.map((preset) => (
            <DropdownMenuItem
              data-seconds={preset.seconds}
              key={preset.seconds}
              onClick={handlePresetClick}
            >
              {preset.label}
            </DropdownMenuItem>
          ))}
          <DropdownMenuItem onClick={openCustom}>Custom…</DropdownMenuItem>
          {isCooldownActive(until) ? (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleClear}>
                Clear cooldown
              </DropdownMenuItem>
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
      <CooldownDialog
        onClose={closeCustom}
        onStart={handleStart}
        open={customOpen}
      />
    </>
  );
}
