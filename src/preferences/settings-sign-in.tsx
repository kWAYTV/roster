import { useCallback } from "react";

import { Input } from "@/ui/primitives/input";
import { TabsContent } from "@/ui/primitives/tabs";

import type { Preferences } from "./preferences";
import { SettingList } from "./setting-list";
import { SIGN_IN_SETTINGS } from "./settings-fields";

const CS2_OPTIONS_ID = "cs2-launch-options";

interface SettingsSignInProps {
  onChange: (key: keyof Preferences, value: boolean) => void;
  onPatch: (patch: Partial<Preferences>) => void;
  preferences: Preferences;
}

export function SettingsSignIn({
  preferences,
  onChange,
  onPatch,
}: SettingsSignInProps) {
  const handleCs2OptionsChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onPatch({ cs2_launch_options: event.target.value });
    },
    [onPatch]
  );

  return (
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
  );
}
