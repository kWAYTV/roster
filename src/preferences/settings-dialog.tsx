import { Modal } from "../feedback/modal";
import type { Preferences } from "./preferences";
import { ToggleRow } from "./toggle-row";
import styles from "./settings-dialog.module.css";

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

interface SettingSection {
  title: string;
  items: BoolSetting[];
}

const SECTIONS: SettingSection[] = [
  {
    title: "Sign-in",
    items: [
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
    ],
  },
  {
    title: "Privacy",
    items: [
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
    ],
  },
  {
    title: "App",
    items: [
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
    ],
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
  return (
    <Modal open={open} title="Settings" onClose={onClose}>
      <div className={styles.root}>
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Updates</h3>
          <div className={styles.updateRow}>
            <div>
              <div className={styles.updateLabel}>Version</div>
              <div className={styles.updateMeta}>{currentVersion ?? "Unknown"}</div>
            </div>
            <button className="btn btn-sm" disabled={updateBusy} onClick={onCheckForUpdates}>
              {updateBusy ? "Updating…" : "Check for updates"}
            </button>
          </div>
        </section>
        {SECTIONS.map((section) => (
          <section key={section.title} className={styles.section}>
            <h3 className={styles.sectionTitle}>{section.title}</h3>
            <div className={styles.list}>
              {section.items.map((setting) => (
                <ToggleRow
                  key={setting.key}
                  label={setting.label}
                  description={setting.description}
                  checked={preferences[setting.key] as boolean}
                  onChange={(value) => onChange(setting.key, value)}
                />
              ))}
            </div>
          </section>
        ))}
        {preferences.launch_cs2_on_login ? (
          <label className={styles.field}>
            <span className={styles.fieldLabel}>CS2 launch options</span>
            <input
              className="field"
              placeholder="-nojoy -high"
              value={preferences.cs2_launch_options}
              onChange={(event) => onPatch({ cs2_launch_options: event.target.value })}
            />
          </label>
        ) : null}
      </div>
    </Modal>
  );
}
