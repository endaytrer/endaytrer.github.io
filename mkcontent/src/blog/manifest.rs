use std::collections::{HashMap, HashSet};

use serde::{Serialize, Deserialize};

use super::Blog;



#[derive(Debug, Default, Serialize, Deserialize)]
pub struct BlogManifest {
    pub blogs: HashMap<String, Blog>,
    pub tags: HashMap<String, HashSet<String>>,
}
