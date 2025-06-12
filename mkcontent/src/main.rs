pub(crate) mod blog;

pub(crate) mod site;

pub(crate) mod crypto;

pub(crate) mod render;


use blog::{manifest::BlogManifest, Blog};
use clap::Parser;
use render::{save_html, save_html_secret};
use site::manifest::SiteManifest;
use std::collections::HashSet;
use std::process;
use std::{io, fs, path::Path};
use std::io::{stdout, Write};
use base64::prelude::*;

/// Load blog content to static
#[derive(Parser)]
#[command(version, about, long_about = None)]
struct Args {
    #[arg(default_value_t = String::from("../content"))]
    input: String,

    #[arg(short, long, default_value_t = String::from("../dist"))]
    output: String,

    #[arg(short, long, default_value_t = String::from("Daniel Gu"))]
    copyright_name: String,
    
    /// Regenerate everything
    #[arg(short, long)]
    regenerate: bool,

    /// Do not generate archive.
    #[arg(long)]
    no_archive: bool,
    
    /// Do not encrypt secret blogs.
    #[arg(long)]
    no_encrypt: bool,
}

fn copy_dir_all(src: impl AsRef<Path>, dst: impl AsRef<Path>) -> io::Result<()> {
    fs::create_dir_all(&dst)?;
    for entry in fs::read_dir(src)? {
        let entry = entry?;
        let ty = entry.file_type()?;
        if ty.is_dir() {
            copy_dir_all(entry.path(), dst.as_ref().join(entry.file_name()))?;
        } else {
            fs::copy(entry.path(), dst.as_ref().join(entry.file_name()))?;
        }
    }
    Ok(())
}

fn main() {
    let Args { input, output, copyright_name, regenerate, no_archive, no_encrypt } = Args::parse();
    let mut stdout = stdout().lock();

    // if regenerate {
    //     let success = process::Command::new("npm")
    //         .arg("run")
    //         .arg("build")
    //         .status()
    //         .unwrap()
    //         .success();
    //     if !success {
    //         panic!("cannot build")
    //     }
    // }
    
    let blogs_path = Path::new(&input).join("blogs");
    let sites_path = Path::new(&input).join("sites");
    let output_path = Path::new(&output);
    let dst_blogs_path = output_path.join("blogs");
    let dst_sites_path = output_path.join("sites");
    let apis_path = output_path.join("api");
    let blog_manifest_path = apis_path.join("blog-manifest.json");
    let site_manifest_path = apis_path.join("site-manifest.json");

    println!("Creating required directories...");
    fs::create_dir_all(&blogs_path).unwrap();
    fs::create_dir_all(&sites_path).unwrap();
    fs::create_dir_all(&dst_blogs_path).unwrap();
    fs::create_dir_all(&dst_sites_path).unwrap();
    fs::create_dir_all(&apis_path).unwrap();

    // generating basic css and js

    print!("Generating CSS and JS...");
    let blog_css_path = dst_blogs_path.join("blog.css");
    let blog_decrypt_path = dst_blogs_path.join("decrypt.js");
    let blog_script_path = dst_blogs_path.join("script.js");
    if regenerate || !fs::exists(blog_css_path).unwrap() {
        fs::copy("template/blog.css", dst_blogs_path.join("blog.css")).unwrap();
    }
    if regenerate || !fs::exists(blog_decrypt_path).unwrap() {
        fs::copy("template/decrypt.js", dst_blogs_path.join("decrypt.js")).unwrap();
    }
    if regenerate || !fs::exists(blog_script_path).unwrap() {
        fs::copy("template/script.js", dst_blogs_path.join("script.js")).unwrap();
    }
    println!("done.");
    print!("Reading previous manifests...");
    stdout.flush().unwrap();
    let mut blog_manifest = fs::File::open(&blog_manifest_path).ok().and_then(|s| {
        serde_json::from_reader::<fs::File, BlogManifest>(s).ok()
    }).unwrap_or_default();
    
    let mut site_manifest = fs::File::open(&site_manifest_path).ok().and_then(|s| {
        serde_json::from_reader::<fs::File, SiteManifest>(s).ok()
    }).unwrap_or_default();
    println!("done.");

    let mut updated_blogs = vec![];
    

    for blog in fs::read_dir(&blogs_path).unwrap() {
        let blog_entry = blog.unwrap();
        let id = blog_entry.file_name().into_string().unwrap();

        if !id.ends_with(".md") {
            continue
        }
        print!("Reading blog manifest {id}...");
        
        stdout.flush().unwrap();
        let blog_metadata = blog_entry.metadata().unwrap();
        let os_created = blog_metadata.created().unwrap();
        let os_modified = blog_metadata.modified().unwrap();

        let res = match blog_manifest.blogs.entry(id.clone()) {
            std::collections::hash_map::Entry::Occupied(mut occupied_entry) => occupied_entry.get_mut().update(blog_entry.path(), os_created, os_modified, regenerate),
            std::collections::hash_map::Entry::Vacant(vacant_entry) => Blog::parse(blog_entry.path(), os_created, os_modified)
                .and_then(|(blog, pwd)| { vacant_entry.insert(blog); Ok(Some(pwd)) }),
        };
        match res {
            Ok(Some(pwd)) => { updated_blogs.push((id, pwd)); },
            Ok(None) => {} 
            Err(e) =>  {
                eprintln!("Error happended: {}\n. Skipped.", e);
                continue
            }
        }
        println!("done.");
    }
    println!("All blog manifest are read. Total blogs: {}, needs update: {}", blog_manifest.blogs.len(), updated_blogs.len());
    // calculate tags
    for (id, _) in &updated_blogs {
        let blog = blog_manifest.blogs.get(id).unwrap();
        for tag_blogs in blog_manifest.tags.values_mut() {
            tag_blogs.remove(id);
        }
        for tag in &blog.tags {
            blog_manifest.tags.entry(tag.clone()).or_insert(HashSet::new()).insert(id.clone());
        }
    }

    // calculate preview, also copy files
    for (id, pwd) in updated_blogs {
        let blog = blog_manifest.blogs.get_mut(&id).unwrap();

        let archive_name = id.strip_suffix(".md").unwrap().to_string();

        let assets = archive_name.clone() + ".assets";
        let html = archive_name.clone() + ".html";
        let archive_name_zipped = archive_name.clone() + ".zip";

        print!("Copying blog and assets: {}...", id);
        stdout.flush().unwrap();

        let archive_path = dst_blogs_path.join(&archive_name);

        // don't care with removing results.
        let _ = fs::remove_file(dst_blogs_path.join(&id));
        let _ = fs::remove_file(dst_blogs_path.join(&archive_name_zipped));
        let _ = fs::remove_dir_all(output_path.join(&assets));
        let _ = fs::remove_dir_all(&archive_path);

        if fs::exists(blogs_path.join(&assets)).unwrap() {
            copy_dir_all(blogs_path.join(&assets), dst_blogs_path.join(&assets)).unwrap();
        }

        let blog_content = fs::read_to_string(blogs_path.join(&id)).unwrap();
        let (rendered_blog_content, preview) = render::render(&blog_content);

        let mut dst_blog = fs::File::create(dst_blogs_path.join(&html)).unwrap();

        if let Some(password) = pwd.and_then(|pwd| (!no_encrypt).then_some(pwd)) {
            print!("\n    Blog {id} needs encryption. encrypting...");
            stdout.flush().unwrap();
            
            let encrypted = crypto::encrypt_data(&rendered_blog_content, &password);
            let encoded = BASE64_STANDARD.encode(encrypted);
            dst_blog.write(save_html_secret(blog, encoded, &copyright_name).as_bytes()).unwrap();
            println!("done.");
        } else {
            blog.preview = preview;
            dst_blog.write(save_html(blog, rendered_blog_content, &copyright_name).as_bytes()).unwrap();
            if let Some(license) = &blog.license {
                if license.is_permissive() && !no_archive {
                    // allow downloading and archive
                    print!("\n    Creating archive for blog {id} due to permissive license...");
                    stdout.flush().unwrap();
                    fs::create_dir_all(&archive_path).unwrap();
                    
                    fs::copy(blogs_path.join(&id), archive_path.join(&id)).unwrap();
                    
                    // create license

                    let mut archive_license = fs::File::create(archive_path.join("LICENSE.txt")).unwrap();
                    archive_license.write(license.license_text(&id, blog.get_copyright_year(), &copyright_name).as_bytes()).unwrap();

                    let success = process::Command::new("zip")
                        .current_dir(&dst_blogs_path)
                        .arg("-r")
                        .arg("-m")
                        .arg(archive_name_zipped)
                        .arg(archive_name)
                        .stdout(process::Stdio::null())
                        .status().unwrap().success();
                    if !success {
                        panic!("failed to create archive")
                    }
                    println!("done.");
                }
            }
        }
        println!("done.");
    }

    print!("Writing blog manifest to file...");
    stdout.flush().unwrap();
    serde_json::to_writer(fs::File::create(&blog_manifest_path).unwrap(), &blog_manifest).unwrap();
    println!("done.");
    
    
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
