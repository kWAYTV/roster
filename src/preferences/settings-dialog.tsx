import { Modal } from "../feedback/modal";
import type { Preferences } from "./preferences";
import { ToggleRow } from "./toggle-row";
import styles from "./settings-dialog.module.css";

interface SettingsDialogProps {
  open: boolean;
  preferences: Preferences;
  onChange: (key: keyof Preferences, value: boolean) => void;
  onClose: () => void;
}

interface Setting {
  key: keyof Preferences;
  label: string;
  description: string;
}

const SETTINGS: Setting[] = [
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
    key: "streamer_mode",
    label: "Streamer mode",
    description: "Mask usernames and avatars in this app and the tray.",
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
    key: "minimize_to_tray_on_close",
    label: "Minimize to tray on close",
    description: "Keep Roster running in the system tray when you close the window.",
  },
];

export function SettingsDialog({ open, preferences, onChange, onClose }: SettingsDialogProps) {
  return (
    <Modal open={open} title="Settings" onClose={onClose}>
      <div className={styles.list}>
        {SETTINGS.map((setting) => (
          <ToggleRow
            key={setting.key}
            label={setting.label}
            description={setting.description}
            checked={preferences[setting.key]}
            onChange={(value) => onChange(setting.key, value)}
          />
        ))}
      </div>
    </Modal>
  );
}
