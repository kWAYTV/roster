import { useCallback } from "react";
import {
  IMPORT_WITHOUT_SIGN_IN_MODES,
  type ImportWithoutSignIn,
  normalizeImportWithoutSignIn,
  type Preferences,
} from "@/preferences/preferences";
import { SettingList } from "@/preferences/setting-list";
import { SIGN_IN_SETTINGS } from "@/preferences/settings-fields";
import { Input } from "@/ui/primitives/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/primitives/select";
import { TabsContent } from "@/ui/primitives/tabs";

const CS2_OPTIONS_ID = "cs2-launch-options";
const IMPORT_WITHOUT_SIGN_IN_ID = "import-without-sign-in";

const IMPORT_WITHOUT_SIGN_IN_LABELS: Record<ImportWithoutSignIn, string> = {
  ask: "Ask",
  off: "Off",
  on: "On",
};

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

  const handleImportWithoutSignInChange = useCallback(
    (value: string | null) => {
      if (value === null) {
        return;
      }
      onPatch({
        import_without_sign_in: normalizeImportWithoutSignIn(value),
      });
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
      <div className="flex items-center justify-between gap-3 border-border/80 border-b py-2.5">
        <div className="min-w-0 flex-1">
          <label
            className="block font-semibold text-sm leading-snug tracking-tight"
            htmlFor={IMPORT_WITHOUT_SIGN_IN_ID}
          >
            Import without signing in
          </label>
          <p className="mt-0.5 text-pretty text-muted-foreground text-xs leading-snug">
            Off signs into the last imported account. On stores tokens only. Ask
            chooses each time.
          </p>
        </div>
        <Select
          onValueChange={handleImportWithoutSignInChange}
          value={normalizeImportWithoutSignIn(
            preferences.import_without_sign_in
          )}
        >
          <SelectTrigger
            className="w-24"
            id={IMPORT_WITHOUT_SIGN_IN_ID}
            size="sm"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="end">
            {IMPORT_WITHOUT_SIGN_IN_MODES.map((mode) => (
              <SelectItem key={mode} value={mode}>
                {IMPORT_WITHOUT_SIGN_IN_LABELS[mode]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
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
