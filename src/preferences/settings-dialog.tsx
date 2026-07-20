import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConfirmDialog } from "../feedback/confirm-dialog";
import { useReset } from "../reset/use-reset";
import type { Preferences } from "./preferences";

interface SettingsDialogProps {
  open: boolean;
  preferences: Preferences;
  currentVersion: string | null;
  updateBusy: boolean;
  onChange: (key: keyof Preferences, value: boolean) => void;
  onPatch: (patch: Partial<Preferences>) => void;
  onCheckForUpdates: () => void;
  onClose: () => void;
}

interface BoolSetting {
  key: keyof Preferences;
  label: string;
  description: string;
}

const SIGN_IN: BoolSetting[] = [
  {
    key: "always_invisible",
    label: "Always start invisible",
    description: "Sign in as Invisible instead of Online.",
  },
  {
    key: "cancel_downloads_on_login",
    label: "Cancel downloads on login",
    description: "Pause active downloads right after signing in.",
  },
  {
    key: "launch_steam_minimized",
    label: "Launch Steam minimized",
    description: "Start Steam in the background after sign-in.",
  },
  {
    key: "mute_notifications_on_login",
    label: "Mute notifications on login",
    description: "Turn off friend online and message notifications.",
  },
  {
    key: "launch_cs2_on_login",
    label: "Launch CS2 on sign-in",
    description: "Start Counter-Strike 2 after Steam opens.",
  },
];

const PRIVACY: BoolSetting[] = [
  {
    key: "streamer_mode",
    label: "Streamer mode",
    description: "Mask usernames and avatars in this app and the tray.",
  },
  {
    key: "hide_from_capture",
    label: "Hide from screen capture",
    description: "Exclude this window from Discord, OBS, and similar capture.",
  },
];

const APP: BoolSetting[] = [
  {
    key: "show_log_panel",
    label: "Show log panel",
    description: "Display recent backend output at the bottom of the window.",
  },
  {
    key: "minimize_to_tray_on_close",
    label: "Minimize to tray on close",
    description: "Keep Roster running in the system tray when you close the window.",
  },
];

export function SettingsDialog({
  open,
  preferences,
  currentVersion,
  updateBusy,
  onChange,
  onPatch,
  onCheckForUpdates,
  onClose,
}: SettingsDialogProps) {
  const [tab, setTab] = useState("sign-in");
  const [resetOpen, setResetOpen] = useState(false);
  const { reset } = useReset();

  return (
    <>
      <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
        <DialogContent className="gap-4 p-5 sm:max-w-md">
          <DialogHeader className="pr-8">
            <DialogTitle>Settings</DialogTitle>
          </DialogHeader>

          <Tabs value={tab} onValueChange={setTab} className="gap-4">
            <TabsList
              variant="line"
              className="h-auto w-full justify-stretch gap-0 border-b border-border pb-0"
            >
              <TabsTrigger value="sign-in" className="flex-1 rounded-none px-2 text-xs">
                Sign-in
              </TabsTrigger>
              <TabsTrigger value="privacy" className="flex-1 rounded-none px-2 text-xs">
                Privacy
              </TabsTrigger>
              <TabsTrigger value="app" className="flex-1 rounded-none px-2 text-xs">
                App
              </TabsTrigger>
              <TabsTrigger value="updates" className="flex-1 rounded-none px-2 text-xs">
                Updates
              </TabsTrigger>
              <TabsTrigger
                value="danger"
                className="flex-1 rounded-none px-2 text-xs text-destructive hover:text-destructive data-active:text-destructive after:bg-destructive dark:text-destructive dark:hover:text-destructive dark:data-active:text-destructive"
              >
                Danger
              </TabsTrigger>
            </TabsList>

            <TabsContent value="sign-in" className="mt-0 min-h-52 space-y-3 outline-none">
              <SettingList items={SIGN_IN} preferences={preferences} onChange={onChange} />
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
              <SettingList items={PRIVACY} preferences={preferences} onChange={onChange} />
            </TabsContent>

            <TabsContent value="app" className="mt-0 min-h-52 outline-none">
              <SettingList items={APP} preferences={preferences} onChange={onChange} />
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
                  onClick={() => setResetOpen(true)}
                >
                  Reset login data
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={resetOpen}
        title="Reset login data"
        message="This clears every saved Steam login on this PC. Continue?"
        confirmLabel="Reset"
        danger
        onConfirm={reset}
        onClose={() => setResetOpen(false)}
      />
    </>
  );
}

function SettingList({
  items,
  preferences,
  onChange,
}: {
  items: BoolSetting[];
  preferences: Preferences;
  onChange: (key: keyof Preferences, value: boolean) => void;
}) {
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
