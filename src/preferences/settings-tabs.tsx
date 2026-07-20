import { useCallback } from "react";

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

const CS2_OPTIONS_ID = "cs2-launch-options";

interface SettingsTabsProps {
  currentVersion: string | null;
  onChange: (key: keyof Preferences, value: boolean) => void;
  onCheckForUpdates: () => void;
  onPatch: (patch: Partial<Preferences>) => void;
  onRequestReset: () => void;
  preferences: Preferences;
  updateBusy: boolean;
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
  const handleCs2OptionsChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onPatch({ cs2_launch_options: event.target.value });
    },
    [onPatch]
  );

  return (
    <>
      <TabsContent
        className="mt-0 min-h-52 space-y-3 outline-none"
        value="sign-in"
      >
        <SettingList
          items={SIGN_IN_SETTINGS}
          onChange={onChange}
          preferences={preferences}
        />
        {preferences.launch_cs2_on_login ? (
          <label className="flex flex-col gap-1.5" htmlFor={CS2_OPTIONS_ID}>
            <span className="font-medium text-sm">CS2 launch options</span>
            <Input
              id={CS2_OPTIONS_ID}
              onChange={handleCs2OptionsChange}
              placeholder="-nojoy -high"
              value={preferences.cs2_launch_options}
            />
          </label>
        ) : null}
      </TabsContent>

      <TabsContent className="mt-0 min-h-52 outline-none" value="privacy">
        <SettingList
          items={PRIVACY_SETTINGS}
          onChange={onChange}
          preferences={preferences}
        />
      </TabsContent>

      <TabsContent className="mt-0 min-h-52 outline-none" value="app">
        <SettingList
          items={APP_SETTINGS}
          onChange={onChange}
          preferences={preferences}
        />
      </TabsContent>

      <TabsContent className="mt-0 min-h-52 outline-none" value="updates">
        <div className="flex items-center justify-between gap-3 py-2">
          <div>
            <div className="font-medium text-sm">Version</div>
            <div className="mt-0.5 text-muted-foreground text-xs">
              {currentVersion ?? "Unknown"}
            </div>
          </div>
          <Button
            disabled={updateBusy}
            onClick={onCheckForUpdates}
            size="sm"
            variant="outline"
          >
            {updateBusy ? "Updating…" : "Check for updates"}
          </Button>
        </div>
      </TabsContent>

      <TabsContent className="mt-0 min-h-52 outline-none" value="danger">
        <div className="flex flex-col gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
          <div>
            <div className="font-medium text-destructive text-sm">
              Reset local login data
            </div>
            <p className="mt-1 text-pretty text-muted-foreground text-xs leading-snug">
              Clears every saved Steam login on this PC — config files and the
              token cache. This cannot be undone.
            </p>
          </div>
          <Button
            className="self-start"
            onClick={onRequestReset}
            size="sm"
            variant="destructive"
          >
            Reset login data
          </Button>
        </div>
      </TabsContent>
    </>
  );
}
