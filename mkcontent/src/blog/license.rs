use serde::{Deserialize, Deserializer, Serialize, Serializer};
use serde::de::{self, Visitor};
use std::fmt;

#[derive(Debug, PartialEq)]
pub enum License {
    CcBy4_0,
    CcByNc4_0,
    CcByNcNd4_0,
    CcByNcSa4_0,
    CcByNd4_0,
    CcBySa4_0,
    Cc01_0,
}
impl License {
    pub fn parse(value: &str) -> Result<Self, &str> {
        match value {
            "CC BY 4.0" => Ok(License::CcBy4_0),
            "CC BY-NC 4.0" => Ok(License::CcByNc4_0),
            "CC BY-NC-ND 4.0" => Ok(License::CcByNcNd4_0),
            "CC BY-NC-SA 4.0" => Ok(License::CcByNcSa4_0),
            "CC BY-ND 4.0" => Ok(License::CcByNd4_0),
            "CC BY-SA 4.0" => Ok(License::CcBySa4_0),
            "CC0 1.0" => Ok(License::Cc01_0),
            v => Err(v)
        }
    }
    /// whether the license allows downloading the archive
    pub fn is_permissive(&self) -> bool {
        true
    }
    pub fn is_public_domain(&self) -> bool {
        match self {
            License::CcBy4_0 |
            License::CcByNc4_0 |
            License::CcByNcNd4_0 |
            License::CcByNcSa4_0 |
            License::CcByNd4_0 |
            License::CcBySa4_0 => false,
            License::Cc01_0 => true,
        }
    }
    fn canonical_name(&self) -> &'static str {
        match self {
            License::CcBy4_0 => "CC BY 4.0",
            License::CcByNc4_0 => "CC BY-NC 4.0",
            License::CcByNcNd4_0 => "CC BY-NC-ND 4.0",
            License::CcByNcSa4_0 => "CC BY-NC-SA 4.0",
            License::CcByNd4_0 =>  "CC BY-ND 4.0",
            License::CcBySa4_0 => "CC BY-SA 4.0",
            License::Cc01_0 => "CC0 1.0",
        }
    }
    fn url(&self) -> &'static str {
        match self {
            License::CcBy4_0 => "https://creativecommons.org/licenses/by/4.0/ ",
            License::CcByNc4_0 => "https://creativecommons.org/licenses/by-nc/4.0/ ",
            License::CcByNcNd4_0 => "https://creativecommons.org/licenses/by-nc-nd/4.0/ ",
            License::CcByNcSa4_0 => "https://creativecommons.org/licenses/by-nc-sa/4.0/ ",
            License::CcByNd4_0 =>  "https://creativecommons.org/licenses/by-nd/4.0/ ",
            License::CcBySa4_0 => "https://creativecommons.org/licenses/by-sa/4.0/ ",
            License::Cc01_0 => "CC0 1.0",
        }
    }
    pub fn license_text(&self, title: &str, year: i32, creator: &str) -> String {
        let license_type = if self.is_public_domain() {
            "mark"
        } else {
            "license"
        };
        let canonical_name = self.canonical_name();
        let url = self.url();
        let preamble = if self.is_public_domain() {
            format!("{title} by {creator} is marked {canonical_name}. To view a copy of this mark, visit {url}")
        } else {
            format!("{title} © {year} by {creator} is licensed under {canonical_name}. To view a copy of this license, visit {url}")
        };
        let epilogue = if self.is_public_domain() {
            ".\n".to_string()
        } else {
            format!(", and each are © {year} by {creator}.\n")
        };
        
        return format!(r#"{preamble}

{canonical_name} ("this {license_type}") applies to all files contained in this archive
including its subdirectories ("these files"), including text, images, and other media .

These files are collectively referred to as "{title}"{epilogue}
"#)
        
    }
}
impl Serialize for License {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        let s = self.canonical_name();
        serializer.serialize_str(&s)
    }
}

impl<'de> Deserialize<'de> for License {
    fn deserialize<D>(deserializer: D) -> Result<License, D::Error>
    where
        D: Deserializer<'de>,
    {
        struct LicenseVisitor;

        impl<'de> Visitor<'de> for LicenseVisitor {
            type Value = License;

            fn expecting(&self, formatter: &mut fmt::Formatter) -> fmt::Result {
                formatter.write_str("a license string like 'CC BY 4.0'")
            }

            fn visit_str<E>(self, value: &str) -> Result<License, E>
            where
                E: de::Error,
            {
                License::parse(value).map_err(|e| E::custom(e))
            }
        }

        deserializer.deserialize_str(LicenseVisitor)
    }
}