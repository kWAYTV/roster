//! Per-account CS2 launch options in localconfig.vdf.

use crate::vdf::{block_body_offset, indent_of, insert_before_last_brace};

const CS2_APP_ID: &str = "730";

/// Set or clear launch options for CS2 under the `apps` block.
pub fn apply(content: &str, options: &str) -> String {
    let key = format!("\"{CS2_APP_ID}\"");
    if content.contains(&key) {
        return upsert_launch_options(content, options);
    }

    let block = format!(
        "\t\"apps\"\n\t{{\n\t\t\"{CS2_APP_ID}\"\n\t\t{{\n\t\t\t\"LaunchOptions\"\t\t\"{options}\"\n\t\t}}\n\t}}\n"
    );
    insert_before_last_brace(content, &block)
}

fn upsert_launch_options(content: &str, options: &str) -> String {
    let mut out = String::new();
    let mut inside_app = false;
    let mut depth = 0_i32;
    let mut wrote = false;

    for line in content.lines() {
        let trimmed = line.trim();
        if trimmed == format!("\"{CS2_APP_ID}\"") {
            inside_app = true;
            depth = 0;
            out.push_str(line);
            out.push('\n');
            continue;
        }

        if inside_app {
            if trimmed.starts_with('{') {
                depth += 1;
            } else if trimmed.starts_with('}') {
                depth -= 1;
                if depth == 0 && !wrote {
                    out.push_str(&format!(
                        "{}\t\t\"LaunchOptions\"\t\t\"{options}\"\n",
                        indent_of(line)
                    ));
                    wrote = true;
                    inside_app = false;
                }
            } else if trimmed.starts_with("\"LaunchOptions\"") {
                out.push_str(&format!(
                    "{}\t\t\"LaunchOptions\"\t\t\"{options}\"\n",
                    indent_of(line)
                ));
                wrote = true;
                continue;
            }
        }

        out.push_str(line);
        out.push('\n');
    }

    if wrote {
        out
    } else if let Some(offset) = block_body_offset(content, "apps") {
        let mut patched = content.to_string();
        let entry = format!(
            "\t\t\"{CS2_APP_ID}\"\n\t\t{{\n\t\t\t\"LaunchOptions\"\t\t\"{options}\"\n\t\t}}\n"
        );
        patched.insert_str(offset, &entry);
        patched
    } else {
        apply(content, options)
    }
}
