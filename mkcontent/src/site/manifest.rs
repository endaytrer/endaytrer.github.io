use std::collections::HashMap;

use serde::{Serialize, Deserialize};

use super::Site;



#[derive(Debug, Default, Serialize, Deserialize)]
pub struct SiteManifest(pub HashMap<String, Site>);
