import { useCallback } from "react";

import { Button } from "@/ui/primitives/button";
import { Input } from "@/ui/primitives/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/primitives/select";
import { TabsContent } from "@/ui/primitives/tabs";

import {
  normalizeTheme,
  THEME_MODES,
  type ThemeMode,
} from "../theme/theme-mode";
import type { Preferences } from "./preferences";
import { SettingList } from "./setting-list";
import { APP_SETTINGS } from "./settings-fields";

const JWT_WARN_ID = "jwt-warn-days";
const THEME_ID = "appearance-theme";

const THEME_LABELS: Record<ThemeMode, string> = {
  dark: "Dark",
  light: "Light",
  system: "System",
};

interface SettingsAppProps {
  onChange: (key: keyof Preferences, value: boolean) => void;
  onExportMetadata: () => void;
  onImportMetadata: () => void;
  onPatch: (patch: Partial<Preferences>) => void;
  preferences: Preferences;
}

export function SettingsApp({
  preferences,
  onChange,
  onPatch,
  onExportMetadata,
  onImportMetadata,
}: SettingsAppProps) {
  const handleJwtWarnChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const next = Number(event.target.value);
      onPatch({
        warn_jwt_expiry_days: Number.isFinite(next)
          ? Math.max(0, Math.floor(next))
          : 0,
      });
    },
    [onPatch]
  );

  const handleThemeChange = useCallback(
    (value: string | null) => {
      if (value === null) {
        return;
      }
      onPatch({ theme: normalizeTheme(value) });
    },
    [onPatch]
  );

  return (
    <TabsContent className="mt-0 min-h-52 space-y-3 outline-none" value="app">
      <div className="flex items-center justify-between gap-3 border-border/80 border-b py-2.5">
        <div className="min-w-0 flex-1">
          <label
            className="block font-semibold text-sm leading-snug tracking-tight"
            htmlFor={THEME_ID}
          >
            Appearance
          </label>
          <p className="mt-0.5 text-pretty text-muted-foreground text-xs leading-snug">
            Default is dark. Choose light or system if you prefer.
          </p>
        </div>
        <Select
          onValueChange={handleThemeChange}
          value={normalizeTheme(preferences.theme)}
        >
          <SelectTrigger className="w-28" id={THEME_ID} size="sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="end">
            {THEME_MODES.map((mode) => (
              <SelectItem key={mode} value={mode}>
                {THEME_LABELS[mode]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <SettingList
        items={APP_SETTINGS}
        onChange={onChange}
        preferences={preferences}
      />
      <label className="flex flex-col gap-1.5" htmlFor={JWT_WARN_ID}>
        <span className="font-medium text-sm">JWT expiry warning (days)</span>
        <span className="text-muted-foreground text-xs">
          Toast on launch when tokens expire within this many days. 0 disables.
        </span>
        <Input
          className="tabular-nums"
          id={JWT_WARN_ID}
          max={90}
          min={0}
          onChange={handleJwtWarnChange}
          type="number"
          value={preferences.warn_jwt_expiry_days}
        />
      </label>
      <div className="flex flex-col gap-2 border-border border-t pt-3">
        <div>
          <div className="font-medium text-sm">Metadata backup</div>
          <p className="mt-1 text-pretty text-muted-foreground text-xs leading-snug">
            Pins, notes, cooldowns, and per-account overrides. Does not include
            Steam tokens.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={onExportMetadata} size="sm" variant="outline">
            Export…
          </Button>
          <Button onClick={onImportMetadata} size="sm" variant="outline">
            Restore…
          </Button>
        </div>
      </div>
    </TabsContent>
  );
}
