// based on https://github.com/RazrFalcon/resvg/blob/master/examples/minimal.rs

use resvg;
use tiny_skia;
use usvg;

fn main() {
    let args: Vec<String> = std::env::args().collect();
    if args.len() != 5 {
        println!("usage: <in.svg> <out.png> <width> <height>");
        return;
    }
    let in_file = &args[1];
    let out_file = &args[2];
    let width: u32 = args[3].parse().unwrap();
    let height: u32 = args[4].parse().unwrap();

    // TODO: font_family, font_size, etc...
    let mut opts = usvg::Options::default();
    opts.font_size = 16.0;
    opts.font_family = "Roboto".to_string();
    opts.fontdb
        .load_font_file("/usr/share/fonts/TTF/Roboto-Medium.ttf")
        .unwrap();

    // conver svg to usvg tree
    let svg = std::fs::read(in_file).unwrap();
    let tree = usvg::Tree::from_data(&svg, &opts.to_ref()).unwrap();

    // render to pixmap
    let mut pixmap = tiny_skia::Pixmap::new(width, height).unwrap();

    // while background (TODO: option)
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
