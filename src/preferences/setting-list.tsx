import { useCallback } from "react";

import { Switch } from "@/ui/primitives/switch";

import type { Preferences } from "./preferences";
import type { BoolSetting } from "./settings-fields";

interface SettingListProps {
  items: BoolSetting[];
  onChange: (key: keyof Preferences, value: boolean) => void;
  preferences: Preferences;
}

export function SettingList({
  items,
  preferences,
  onChange,
}: SettingListProps) {
  return (
    <div className="flex flex-col">
      {items.map((setting) => (
        <SettingRow
          checked={preferences[setting.key] as boolean}
          key={setting.key}
          onChange={onChange}
          setting={setting}
        />
      ))}
    </div>
  );
}

interface SettingRowProps {
  checked: boolean;
  onChange: (key: keyof Preferences, value: boolean) => void;
  setting: BoolSetting;
}

function SettingRow({ setting, checked, onChange }: SettingRowProps) {
  const id = `setting-${setting.key}`;

  const handleChange = useCallback(
    (value: boolean) => {
      onChange(setting.key, value);
    },
    [onChange, setting.key]
  );

  return (
    <label
      className="flex cursor-pointer items-start justify-between gap-3 border-border border-b py-2 last:border-0"
      htmlFor={id}
    >
      <span className="min-w-0 flex-1">
        <span className="block font-medium text-sm leading-snug">
          {setting.label}
        </span>
        <span className="mt-0.5 block text-pretty text-muted-foreground text-xs leading-snug">
          {setting.description}
        </span>
      </span>
      <Switch checked={checked} id={id} onCheckedChange={handleChange} />
    </label>
  );
}
