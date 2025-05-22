pub(crate) mod blog;

pub(crate) mod site;

pub(crate) mod crypto;


use blog::{manifest::BlogManifest, Blog};
use clap::Parser;
use site::manifest::SiteManifest;
use std::{fs, path::Path};

/// Load blog content to static
#[derive(Parser)]
#[command(version, about, long_about = None)]
struct Args {
    #[arg(default_value_t = String::from("../content"))]
    input: String,

    #[arg(short, long, default_value_t = String::from("../dist"))]
    output: String,
}
fn main() {
    let Args { input, output } = Args::parse();
    
    let blogs_path = Path::new(&input).join("blogs");
    let sites_path = Path::new(&input).join("sites");
    let dst_blogs_path = Path::new(&output).join("blogs");
    let dst_sites_path = Path::new(&output).join("sites");
    let blog_manifest_path = Path::new(&output).join("api").join("blog-manifest");
    let site_manifest_path = Path::new(&output).join("api").join("site-manifest");

    let mut blog_manifest = fs::File::open(&blog_manifest_path).ok().and_then(|s| {
        serde_json::from_reader::<fs::File, BlogManifest>(s).ok()
    }).unwrap_or_default();
    
    let mut site_manifest = fs::File::open(&site_manifest_path).ok().and_then(|s| {
        serde_json::from_reader::<fs::File, SiteManifest>(s).ok()
    }).unwrap_or_default();

    for blog in fs::read_dir(&blogs_path).unwrap() {
        let blog_entry = blog.unwrap();
        let id = blog_entry.file_name().into_string().unwrap();
        if !id.ends_with(".md") {
            continue
        }
        let last_modified = blog_entry.metadata().unwrap().modified().unwrap();
        let res = match blog_manifest.blogs.entry(id.clone()) {
            std::collections::hash_map::Entry::Occupied(mut occupied_entry) => occupied_entry.get_mut().update(blog_entry.path(), &id, last_modified),
            std::collections::hash_map::Entry::Vacant(vacant_entry) => Blog::parse(blog_entry.path(), &id, last_modified)
                .and_then(|blog| { vacant_entry.insert(blog); Ok(()) }),
        };
        if let Err(e) = res {
            eprintln!("{}", e);
        }
    }
    // calculate tags, also copy files
    for (id, blog) in &blog_manifest.blogs {
        blog_manifest.tags.extend(blog.get_tags());
        if !blog.is_secret() {
            fs::copy(blogs_path.join(id), dst_blogs_path.join(id)).unwrap();
            let mut assets = id.strip_suffix(".md").unwrap().to_string();
            assets.push_str(".assets");
            let _ = fs::copy(blogs_path.join(&assets), dst_blogs_path.join(&assets));
        } else {
        }
    }
    
    serde_json::to_writer(fs::File::create(&blog_manifest_path).unwrap(), &blog_manifest).unwrap();
    
    for site in fs::read_dir(sites_path).unwrap() {
        let site_entry = site.unwrap();
        let id = site_entry.file_name().into_string().unwrap();
        if site_entry.file_type().unwrap().is_file() {
            continue
        }
        let site_info = site_entry.path().join("site.toml");
        let s = match fs::read_to_string(site_info) {
            Ok(s) => s,
            Err(e) => {
                eprintln!("{}", e);
                continue
            },
        };
        let site = match toml::from_str(&s) {
            Ok(s) => s,
            Err(e) => {
                eprintln!("{}", e);
                continue
            }
        };
        site_manifest.0.insert(id, site);
    }

    serde_json::to_writer(fs::File::create(&site_manifest_path).unwrap(), &site_manifest).unwrap();
}
