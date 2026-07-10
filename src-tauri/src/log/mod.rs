//! In-memory log ring for the optional settings panel.

use std::collections::VecDeque;
use std::sync::Mutex;

const MAX_LINES: usize = 400;

static BUFFER: Mutex<VecDeque<String>> = Mutex::new(VecDeque::new());

pub fn append(line: impl Into<String>) {
    let text = line.into().trim().to_string();
    if text.is_empty() {
        return;
    }
    if let Ok(mut buffer) = BUFFER.lock() {
        buffer.push_back(text);
        while buffer.len() > MAX_LINES {
            buffer.pop_front();
        }
    }
}

pub fn lines() -> Vec<String> {
    BUFFER
        .lock()
        .map(|buffer| buffer.iter().cloned().collect())
        .unwrap_or_default()
}

pub fn clear() {
    if let Ok(mut buffer) = BUFFER.lock() {
        buffer.clear();
    }
}
