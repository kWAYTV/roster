//! Valve KeyValues (VDF) text format: reading fields and editing key lines.

mod edit;
mod query;
mod tokens;

pub use edit::{insert_before_last_brace, replace_key_line};
pub use query::{block_body_offset, block_range, byte_offset_of_line, indent_of};
pub use tokens::quoted_fields;
