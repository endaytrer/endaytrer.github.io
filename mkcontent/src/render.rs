use quick_xml::events::{Event, BytesText};
use quick_xml::Writer;
use std::io::Cursor;
use katex::Opts;

use crate::blog::Blog;


fn render_katex(x: &str, display: bool) -> String {
    katex::render_with_opts(x, Opts::builder().display_mode(display).build().unwrap()).unwrap_or_else(|_| x.to_string())
}
pub fn render(md: &str) -> String {
    let options = markdown::Options {
        parse: markdown::ParseOptions { constructs: markdown::Constructs {
            math_flow: true,
            math_text: true,
            html_flow: true,
            html_text: true,
            frontmatter: true,
            ..markdown::Constructs::gfm()
        }, ..markdown::ParseOptions::gfm() },
        compile: markdown::CompileOptions {
            allow_dangerous_html: true,
            allow_dangerous_protocol: true,
            ..markdown::CompileOptions::gfm()
        }
    };
    let rendered = markdown::to_html_with_options(md, &options).unwrap();
    // render math

    let reader = quick_xml::reader::Reader::from_str(&rendered);

    let mut writer = Writer::new(Cursor::new(Vec::new()));
    let mut math_mode_display = None;
    let mut math_content = String::new();

    let mut reader = reader;

    loop {
        let event = reader.read_event();
        match event {
            Ok(Event::Start(ref e)) => {
                let tag = e.name().0;
                if tag == b"code" {
                    let mut is_math = None;
                    for attr in e.attributes().flatten() {
                        if attr.key.0 == b"class" {
                            if let Ok(val) = std::str::from_utf8(&attr.value) {
                                if val.contains("language-math") {
                                    let display = val.contains("math-display");
                                    is_math = Some(display);
                                    break;
                                }
                            }
                        }
                    }
                    if let Some(display) = is_math {
                        math_mode_display = Some(display);
                        math_content.clear();
                    }
                }
                writer.write_event(Event::Start(e.clone())).unwrap();
            }
            Ok(Event::End(ref e)) => {
                let tag = std::str::from_utf8(e.name().0).unwrap_or("");
                if tag == "code" {
                    if let Some(display) = math_mode_display {
                        let rendered = render_katex(&math_content, display);
                        writer.write_event(Event::Text(BytesText::from_escaped(&rendered))).unwrap();
                        math_mode_display = None;
                        math_content.clear();
                    }
                }
                writer.write_event(Event::End(e.clone())).unwrap();
            }
            Ok(Event::Text(e)) => {
                if math_mode_display.is_some() {
                    math_content.push_str(
                        &e.unescape()
                            .map(|cow| cow.into_owned())
                            .unwrap_or_else(|_| String::from_utf8_lossy(&e.into_inner()).into_owned())
                    );
                } else {
                    writer.write_event(Event::Text(e)).unwrap();
                }
            }
            Ok(Event::Eof) => {
                writer.write_event(Event::Eof).unwrap();
                break
            },
            Ok(e) => {
                writer.write_event(e).unwrap();
            }
            Err(_) => panic!("Fail to parse html"),
        }
    }
    let result = writer.into_inner().into_inner();
    String::from_utf8(result).unwrap()
}

pub fn save_html(metadata: &Blog, content: String) -> String {
    format!(include_str!("template/blog.html"), title=metadata.title, lang=metadata.language, content=content)
}
pub fn save_html_secret(metadata: &Blog, content: String) -> String {
    let secret_content = format!(include_str!("template/secret.html"), hint=metadata.hint.as_ref().map(|h| {
        let mut ans = "Hint: ".to_string();
        ans.push_str(h);
        ans
    }).unwrap_or(String::new()), content=content);
    format!(include_str!("template/blog.html"), title=metadata.title, lang=metadata.language, content=secret_content)
}