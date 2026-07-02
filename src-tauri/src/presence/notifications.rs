//! Silence Steam friend notifications and sounds on sign-in.

use crate::vdf::{block_body_offset, insert_before_last_brace, replace_key_line};

const KEYS: [&str; 8] = [
    "Notifications_ShowOnline",
    "Notifications_ShowMessage",
    "Notifications_ShowIngame",
    "Notifications_EventsAndAnnouncements",
    "Sounds_PlayOnline",
    "Sounds_PlayMessage",
    "Sounds_PlayIngame",
    "Sounds_EventsAndAnnouncements",
];

/// Turn every friend notification and sound preference off.
pub fn mute(content: &str) -> String {
    let mut out = ensure_friends_block(content);
    for key in KEYS {
        out = replace_key_line(&out, key, "0");
    }
    out
}

fn ensure_friends_block(content: &str) -> String {
    if block_body_offset(content, "friends").is_some() {
        return content.to_string();
    }
    insert_before_last_brace(
        content,
        "\t\"friends\"\n\t{\n\t\t\"SignIntoFriends\"\t\t\"1\"\n\t}\n",
    )
}
