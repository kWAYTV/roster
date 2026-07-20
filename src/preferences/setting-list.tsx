import { Switch } from "@/ui/primitives/switch";

import type { Preferences } from "./preferences";
import type { BoolSetting } from "./settings-fields";

interface SettingListProps {
  items: BoolSetting[];
  preferences: Preferences;
  onChange: (key: keyof Preferences, value: boolean) => void;
}

export function SettingList({ items, preferences, onChange }: SettingListProps) {
  return (
    <div className="flex flex-col">
      {items.map((setting) => (
        <label
          key={setting.key}
          className="flex cursor-pointer items-start justify-between gap-3 border-b border-border py-2 last:border-0"
        >
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-medium leading-snug">{setting.label}</span>
            <span className="mt-0.5 block text-xs leading-snug text-muted-foreground text-pretty">
              {setting.description}
            </span>
          </span>
          <Switch
            checked={preferences[setting.key] as boolean}
            onCheckedChange={(value) => onChange(setting.key, value)}
          />
        </label>
      ))}
    </div>
  );
}
