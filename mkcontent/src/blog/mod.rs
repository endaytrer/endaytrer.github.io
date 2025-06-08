use std::{error::Error, fmt::Display, fs, io::{BufRead, BufReader}, path::Path, time::SystemTime};

use license::License;
use serde::{Deserialize, Serialize};
use time::OffsetDateTime;
pub mod manifest;
pub mod license;

pub(super) mod password_serde {

    use serde::{Deserializer, Serializer};

    pub fn serialize<S: Serializer>(pwd: &Option<String>, s: S) -> Result<S::Ok, S::Error> {
        s.serialize_bool(pwd.is_some())
    }
    pub fn deserialize<'a, D: Deserializer<'a>>(s: D) -> Result<Option<String>, D::Error> {

        struct BoolVisitor;

        impl<'de> serde::de::Visitor<'de> for BoolVisitor {
            type Value = Option<String>;

            fn expecting(&self, formatter: &mut std::fmt::Formatter) -> std::fmt::Result {
                formatter.write_str("a boolean representing password presence or a string")
            }

            fn visit_bool<E>(self, v: bool) -> Result<Self::Value, E>
            where
                E: serde::de::Error,
            {
                if v {
                    Ok(Some(String::new()))
                } else {
                    Ok(None)
                }
            }
            fn visit_str<E>(self, value: &str) -> Result<Self::Value, E>
            where
                E: serde::de::Error,
            {
                Ok(Some(value.to_string()))
            }
        }

        s.deserialize_bool(BoolVisitor)
    }
}

#[derive(Debug, Serialize, Deserialize)]
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

#[derive(Debug, Serialize, Deserialize)]
pub struct Blog {
    #[serde(default, with = "password_serde")]
    password: Option<String>,
    pub hint: Option<String>,
    pub title: String,
    #[serde(default)]
    pub language: Language,
    pub license: Option<License>,
    #[serde(default)]
    pub tags: Vec<String>,
    #[serde(with = "time::serde::rfc3339")]
    pub modified: OffsetDateTime,
}

impl Blog {
    pub fn parse(path: impl AsRef<Path>, modified: SystemTime) -> Result<Self, Box<dyn Error>> {

        let file = fs::File::open(path)?;
        let file_reader = BufReader::new(file);
        let mut file_metadata = String::new();
        let mut in_frontmatter = false;
        for line in file_reader.lines() {
            let line = line?;
            if line.trim() == "---" {
                if in_frontmatter {
                    let modified = Into::<OffsetDateTime>::into(modified);
                    #[derive(Serialize)]
                    struct Modified {
                        #[serde(with = "time::serde::rfc3339")]
                        modified: OffsetDateTime,
                    }
                    let m = Modified {
                        modified
                    };
                    file_metadata.push_str(&format!("{}\n", toml::ser::to_string(&m).unwrap()));
                    let t = toml::from_str::<Blog>(&file_metadata)?;
                    return Ok(t)
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
    pub fn update(&mut self, path: impl AsRef<Path>, last_modified: SystemTime, regenerate: bool) -> Result<bool, Box<dyn Error>> {
        if !regenerate && last_modified <= self.modified {
            return Ok(false)
        }
        *self = Self::parse(path, last_modified)?;
        Ok(true)
    }
    pub fn get_tags(&self) -> Vec<String> {
        self.tags.clone()
    }
    pub fn get_password(&self) -> Option<&String> {
        self.password.as_ref()
    }
    pub fn get_license(&self) -> Option<&License> {
        self.license.as_ref()
    }
    pub fn get_copyright_year(&self) -> i32 {
        self.modified.year()
    }
}