use std::{fs, io::{BufRead, BufReader}, path::Path, time::SystemTime};

use markdown_extension::{HINT_REGEX, LICENSE_REGEX, PASSWORD_REGEX, PREVIEW_REGEX, TAG_REGEX, TITLE_REGEX};
use serde::{Serialize, Deserialize};
use time::OffsetDateTime;
pub mod manifest;

#[derive(Debug, Serialize, Deserialize)]
pub struct Blog {
    // id is represented by manifest key
    is_secret: bool,
    hint: Option<String>,
    title: String,
    license: Option<String>,
    tags: Vec<String>,
    #[serde(with = "time::serde::rfc3339")]
    modified: OffsetDateTime,
    preview: String,
}
pub(super) mod markdown_extension {

    use once_cell::sync::Lazy;
    use regex::Regex;
    pub static TITLE_REGEX: Lazy<Regex> = Lazy::new(|| Regex::new(r"^#\s(.*?)$").unwrap());
    pub static LICENSE_REGEX: Lazy<Regex> = Lazy::new(|| Regex::new(r"^>\s+License:\s*(.*?)$").unwrap());
    pub static PASSWORD_REGEX: Lazy<Regex> = Lazy::new(|| Regex::new(r"^>\s+Password:\s*(.*?)$").unwrap());
    pub static HINT_REGEX: Lazy<Regex> = Lazy::new(|| Regex::new(r"^>\s+Hint:\s*(.*?)$").unwrap());
    pub static TAG_REGEX: Lazy<Regex> = Lazy::new(|| Regex::new(r"^>\s+Tags:\s*([^\s][^,]*(,\s*[^\s][^,]*)*),?$").unwrap());
    pub static PREVIEW_REGEX: Lazy<Regex> = Lazy::new(|| Regex::new(r"^(|[^#>].*?)$").unwrap());
}
impl Blog {
    const SCAN_LINES: usize = 25;
    const MAX_PREVIEW_LEN: usize = 5;

    pub fn parse(path: impl AsRef<Path>, filename: &str, modified: SystemTime) -> Result<Self, std::io::Error> {

        let file = fs::File::open(path)?;
        let file_reader = BufReader::new(file);
        let first_ten_lines = file_reader.lines().take(Self::SCAN_LINES);
        let mut title = None;
        let mut license = None;
        let mut password = None;
        let mut hint = None;
        let mut tags = None;
        let mut preview = vec![];

        for line in first_ten_lines {
            let line = line?;
            if title.is_none() {
                if let Some(matches) = TITLE_REGEX.captures(&line) {
                    title = Some(matches[1].to_string());
                }
            }
            if license.is_none() {
                if let Some(matches) = LICENSE_REGEX.captures(&line) {
                    license = Some(matches[1].to_string());
                }
            }
            if password.is_none() {
                if let Some(matches) = PASSWORD_REGEX.captures(&line) {
                    password = Some(matches[1].to_string());
                }
            }
            if hint.is_none() {
                if let Some(matches) = HINT_REGEX.captures(&line) {
                    hint = Some(matches[1].to_string());
                }
            }
            if tags.is_none() {
                if let Some(matches) = TAG_REGEX.captures(&line) {
                    tags = Some(matches[1].split(",").map(|tag| tag.trim().to_string()).collect());
                }
            }
            if preview.len() < Self::MAX_PREVIEW_LEN {

                if let Some(matches) = PREVIEW_REGEX.captures(&line) {
                    preview.push(matches[0].to_string())
                }
            }
        }
        let is_secret = password.is_some();
        let title = title.unwrap_or(filename.to_string());
        let tags = tags.unwrap_or_default();

        Ok(Self { is_secret, hint, title, license, tags, modified: modified.into(), preview: if is_secret {
            String::new()
        } else {
            preview.join("\n").trim().to_string()
        } })
    }
    pub fn update(&mut self, path: impl AsRef<Path>, filename: &str, last_modified: SystemTime) -> Result<(), std::io::Error> {

        if last_modified <= self.modified {
            return Ok(())
        }
        *self = Self::parse(path, filename, last_modified)?;
        Ok(())
    }
    pub fn get_tags(&self) -> Vec<String> {
        self.tags.clone()
    } 
    pub fn is_secret(&self) -> bool {
        self.is_secret
    }
}