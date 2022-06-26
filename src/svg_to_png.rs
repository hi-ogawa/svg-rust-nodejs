use napi_derive;
use resvg;
use tiny_skia;
use usvg;

#[napi_derive::napi]
pub fn svg_to_png(
    in_file: String,
    out_file: String,
    font_family: Option<String>,
    font_file: Option<String>,
) {
    // configuration
    let mut opts = usvg::Options::default();
    opts.font_size = 16.0; // TODO: configurable
    if let Some(font_family) = font_family {
        opts.font_family = font_family;
    }
    if let Some(font_file) = font_file {
        opts.fontdb.load_font_file(font_file).unwrap();
    }

    // conver svg to usvg tree
    let svg = std::fs::read(in_file).unwrap();
    let tree = usvg::Tree::from_data(&svg, &opts.to_ref()).unwrap();

    // render to pixmap
    let screen_size = tree.svg_node().size.to_screen_size();
    let mut pixmap = tiny_skia::Pixmap::new(screen_size.width(), screen_size.height()).unwrap();

    // while background (TODO: configurable)
    pixmap.fill(tiny_skia::Color::from_rgba(1.0, 1.0, 1.0, 1.0).unwrap());

    resvg::render(
        &tree,
        usvg::FitTo::Original,
        tiny_skia::Transform::default(),
        pixmap.as_mut(),
    )
    .unwrap();

    // write png
    pixmap.save_png(out_file).unwrap();
}
