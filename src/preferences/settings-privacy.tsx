import { TabsContent } from "@/ui/primitives/tabs";

import type { Preferences } from "./preferences";
import { SettingList } from "./setting-list";
import { PRIVACY_SETTINGS } from "./settings-fields";

interface SettingsPrivacyProps {
  onChange: (key: keyof Preferences, value: boolean) => void;
  preferences: Preferences;
}

export function SettingsPrivacy({
  preferences,
  onChange,
}: SettingsPrivacyProps) {
  return (
    <TabsContent className="mt-0 min-h-52 outline-none" value="privacy">
      <SettingList
        items={PRIVACY_SETTINGS}
        onChange={onChange}
        preferences={preferences}
      />
    </TabsContent>
  );
}
