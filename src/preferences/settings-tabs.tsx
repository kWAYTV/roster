import { Button } from "@/ui/primitives/button";
import { Input } from "@/ui/primitives/input";
import { TabsContent } from "@/ui/primitives/tabs";

import type { Preferences } from "./preferences";
import { SettingList } from "./setting-list";
import {
  APP_SETTINGS,
  PRIVACY_SETTINGS,
  SIGN_IN_SETTINGS,
} from "./settings-fields";

interface SettingsTabsProps {
  preferences: Preferences;
  currentVersion: string | null;
  updateBusy: boolean;
  onChange: (key: keyof Preferences, value: boolean) => void;
  onPatch: (patch: Partial<Preferences>) => void;
  onCheckForUpdates: () => void;
  onRequestReset: () => void;
}

export function SettingsTabs({
  preferences,
  currentVersion,
  updateBusy,
  onChange,
  onPatch,
  onCheckForUpdates,
  onRequestReset,
}: SettingsTabsProps) {
  return (
    <>
      <TabsContent value="sign-in" className="mt-0 min-h-52 space-y-3 outline-none">
        <SettingList items={SIGN_IN_SETTINGS} preferences={preferences} onChange={onChange} />
        {preferences.launch_cs2_on_login ? (
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">CS2 launch options</span>
            <Input
              placeholder="-nojoy -high"
              value={preferences.cs2_launch_options}
              onChange={(event) => onPatch({ cs2_launch_options: event.target.value })}
            />
          </label>
        ) : null}
      </TabsContent>

      <TabsContent value="privacy" className="mt-0 min-h-52 outline-none">
        <SettingList items={PRIVACY_SETTINGS} preferences={preferences} onChange={onChange} />
      </TabsContent>

      <TabsContent value="app" className="mt-0 min-h-52 outline-none">
        <SettingList items={APP_SETTINGS} preferences={preferences} onChange={onChange} />
      </TabsContent>

      <TabsContent value="updates" className="mt-0 min-h-52 outline-none">
        <div className="flex items-center justify-between gap-3 py-2">
          <div>
            <div className="text-sm font-medium">Version</div>
            <div className="mt-0.5 text-xs text-muted-foreground">
              {currentVersion ?? "Unknown"}
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            disabled={updateBusy}
            onClick={onCheckForUpdates}
          >
            {updateBusy ? "Updating…" : "Check for updates"}
          </Button>
        </div>
      </TabsContent>

      <TabsContent value="danger" className="mt-0 min-h-52 outline-none">
        <div className="flex flex-col gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
          <div>
            <div className="text-sm font-medium text-destructive">
              Reset local login data
            </div>
            <p className="mt-1 text-xs leading-snug text-muted-foreground text-pretty">
              Clears every saved Steam login on this PC — config files and the token cache.
              This cannot be undone.
            </p>
          </div>
          <Button
            variant="destructive"
            size="sm"
            className="self-start"
            onClick={onRequestReset}
          >
            Reset login data
          </Button>
        </div>
      </TabsContent>
    </>
  );
}
