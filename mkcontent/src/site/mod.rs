use serde::{Serialize, Deserialize};

pub mod manifest;

#[derive(Debug, Serialize, Deserialize)]
pub struct Site {
    name: String,
    introduction: String,
}