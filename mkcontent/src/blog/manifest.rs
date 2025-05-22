use std::collections::HashMap;

use serde::{Serialize, Deserialize};

use super::Blog;



#[derive(Debug, Default, Serialize, Deserialize)]
pub struct BlogManifest {
    pub blogs: HashMap<String, Blog>,
    pub tags: Vec<String>,
}
