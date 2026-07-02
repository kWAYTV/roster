/// What a public profile reports about an account right now.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ProfileStatus {
    pub state: OnlineState,
    pub game: String,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum OnlineState {
    Offline,
    Online,
    InGame,
}

/// Parse the community profile XML. Private profiles read as offline.
pub fn parse(xml: &str) -> ProfileStatus {
    let offline = ProfileStatus {
        state: OnlineState::Offline,
        game: String::new(),
    };

    if tag_text(xml, "privacyState").as_deref() != Some("public") {
        return offline;
    }

    match tag_text(xml, "onlineState").as_deref() {
        Some("in-game") => ProfileStatus {
            state: OnlineState::InGame,
            game: game_from_state_message(&tag_text(xml, "stateMessage").unwrap_or_default()),
        },
        Some("online") => ProfileStatus {
            state: OnlineState::Online,
            game: String::new(),
        },
        _ => offline,
    }
}

/// The text of the first `<tag>...</tag>`, unwrapping CDATA if present.
fn tag_text(xml: &str, tag: &str) -> Option<String> {
    let open = format!("<{tag}>");
    let close = format!("</{tag}>");
    let start = xml.find(&open)? + open.len();
    let end = xml[start..].find(&close)? + start;
    let inner = xml[start..end].trim();

    let inner = inner
        .strip_prefix("<![CDATA[")
        .and_then(|rest| rest.strip_suffix("]]>"))
        .unwrap_or(inner);
    Some(inner.trim().to_string())
}

/// `stateMessage` looks like `In-Game<br/>Counter-Strike 2`; keep the game.
fn game_from_state_message(message: &str) -> String {
    let text = strip_tags(message);
    let lowered = text.to_lowercase();
    let after = match lowered.find("in-game") {
        Some(index) => &text[index + "in-game".len()..],
        None => text.as_str(),
    };
    after
        .trim_matches([' ', ':', '/', '\\', '\n', '-'])
        .to_string()
}

fn strip_tags(text: &str) -> String {
    let mut result = String::with_capacity(text.len());
    let mut inside = false;
    for c in text.chars() {
        match c {
            '<' => inside = true,
            '>' => {
                inside = false;
                result.push(' ');
            }
            _ if !inside => result.push(c),
            _ => {}
        }
    }
    result.trim().to_string()
}

#[cfg(test)]
mod tests {
    use super::{parse, OnlineState};

    #[test]
    fn private_profile_reads_offline() {
        let xml = "<profile><privacyState><![CDATA[private]]></privacyState>\
                   <onlineState>online</onlineState></profile>";
        assert_eq!(parse(xml).state, OnlineState::Offline);
    }

    #[test]
    fn reads_online_state() {
        let xml = "<profile><privacyState>public</privacyState>\
                   <onlineState><![CDATA[online]]></onlineState></profile>";
        assert_eq!(parse(xml).state, OnlineState::Online);
    }

    #[test]
    fn extracts_game_name_when_in_game() {
        let xml = "<profile><privacyState>public</privacyState>\
                   <onlineState>in-game</onlineState>\
                   <stateMessage><![CDATA[In-Game<br/>Counter-Strike 2]]></stateMessage>\
                   </profile>";
        let status = parse(xml);
        assert_eq!(status.state, OnlineState::InGame);
        assert_eq!(status.game, "Counter-Strike 2");
    }

    #[test]
    fn missing_fields_read_offline() {
        assert_eq!(parse("<profile></profile>").state, OnlineState::Offline);
    }
}
