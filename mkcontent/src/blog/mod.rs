use std::{error::Error, fmt::Display, fs, io::{BufRead, BufReader}, path::Path, time::SystemTime};

use license::License;
use serde::{Deserialize, Serialize};
use time::OffsetDateTime;
use toml::value::Datetime;
pub mod manifest;
pub mod license;

#[derive(Debug, Serialize, Deserialize, PartialEq)]
pub struct Language(String);

impl Default for Language {
    fn default() -> Self {
        Self("en-US".to_string())
    }
}
impl Display for Language {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.0)
    }
}

/// build blog info from toml
#[derive(Deserialize)]
struct BlogBuilder {
    password: Option<String>,
    hint: Option<String>,
    title: String,
    #[serde(default)]
    language: Language,
    license: Option<License>,
    #[serde(default)]
    tags: Vec<String>,
    created: Option<Datetime>,
}
impl BlogBuilder {
    fn new(input: &str) -> Result<Self, toml::de::Error> {
        toml::from_str::<Self>(input)
    }
    /// Return the blog and password as Option<String>
    fn build(self, os_created: OffsetDateTime, os_modified: OffsetDateTime) -> Result<(Blog, Option<String>), &'static str> {
        Ok((Blog {
            password: self.password.is_some(),
            hint: self.hint,
            title: self.title,
            language: self.language,
            license: self.license,
            tags: self.tags,
            created: self.created.map_or(Ok(os_created),
                |toml_time| {
                    let date = toml_time.date.map(|toml::value::Date{year, month, day}|
                        time::Date::from_calendar_date(year as i32, time::Month::try_from(month).unwrap(), day).unwrap()).ok_or("No date when parsing created time")?;
                    let time = toml_time.time.map_or(time::Time::from_hms(0, 0, 0).unwrap(),
                        |toml::value::Time{hour, minute, second, nanosecond}| time::Time::from_hms_nano(hour, minute, second, nanosecond).unwrap());
                    let offset = toml_time.offset.map(|offset| {
                        match offset {
                            toml::value::Offset::Z => time::UtcOffset::UTC,
                            toml::value::Offset::Custom { minutes } => time::UtcOffset::from_whole_seconds(minutes as i32 * 60).unwrap()
                        }
                    }).unwrap_or(time::UtcOffset::current_local_offset().unwrap());
                    Ok(time::OffsetDateTime::new_in_offset(date, time, offset))
                }
            )?,
            // modified is only used in os modified.
            modified: os_modified,
            preview: None,
        }, self.password))
    }
}

/// After building, will only be serialize and deserialize by json.
#[derive(Debug, Serialize, Deserialize, PartialEq)]
pub struct Blog {
    pub password: bool,
    pub hint: Option<String>,
    pub title: String,
    #[serde(default)]
    pub language: Language,
    pub license: Option<License>,
    #[serde(default)]
    pub tags: Vec<String>,
    #[serde(with = "time::serde::rfc3339")]
    pub created: OffsetDateTime,
    #[serde(with = "time::serde::rfc3339")]
    pub modified: OffsetDateTime,
    pub preview: Option<String>,
}

impl Blog {
    pub fn parse(path: impl AsRef<Path>, os_created: SystemTime, os_modified: SystemTime) -> Result<(Self, Option<String>), Box<dyn Error>> {

        let file = fs::File::open(path)?;
        let file_reader = BufReader::new(file);
        let mut file_metadata = String::new();
        let mut in_frontmatter = false;
        for line in file_reader.lines() {
            let line = line?;
            if line.trim() == "---" {
                if in_frontmatter {
                    let builder = BlogBuilder::new(&file_metadata)?;
                    return Ok(builder.build(os_created.into(), os_modified.into())?)
                } else {
                    in_frontmatter = true;
                }
            } else {
                file_metadata.push_str(&line);
                file_metadata.push('\n');
            }
        }
        return Err(Box::new(std::io::Error::new(
            std::io::ErrorKind::InvalidData,
            "No frontmatter found in blog file",
        )));
    }
    /// Return if the blog is updated.
    pub fn update(&mut self, path: impl AsRef<Path>, os_created: SystemTime, os_modified: SystemTime, regenerate: bool) -> Result<Option<Option<String>>, Box<dyn Error>> {
        if !regenerate && os_modified <= self.modified {
            return Ok(None)
        }
        let (blog, pwd) = Self::parse(path, os_created, os_modified)?;
        *self = blog;
        Ok(Some(pwd))
    }
    pub fn get_copyright_year(&self) -> i32 {
        self.created.year()
    }
}