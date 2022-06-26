// based on https://gitlab.gnome.org/GNOME/librsvg/-/blob/main/examples/proportional.rs

use cairo;
use librsvg;

fn main() {
    let args: Vec<String> = std::env::args().collect();
    if args.len() != 5 {
        println!("usage: <in.svg> <out.png> <width> <height>");
        return;
    }
    let in_file = &args[1];
    let out_file = &args[2];
    let width: i32 = args[3].parse().unwrap();
    let height: i32 = args[4].parse().unwrap();

    let handle = librsvg::Loader::new()
        .read_path(in_file)
        .expect("svg input error");

    let surface = cairo::ImageSurface::create(cairo::Format::ARgb32, width, height)
        .expect("cairo surface error");
    let cr = cairo::Context::new(&surface).expect("cairo context error");

    let renderer = librsvg::CairoRenderer::new(&handle);
    let viewport = cairo::Rectangle {
        x: 0.0,
        y: 0.0,
        width: f64::from(width),
        height: f64::from(height),
    };

    let res = renderer.render_document(&cr, &viewport);

    match res {
        Ok(()) => {
            let mut file = std::io::BufWriter::new(std::fs::File::create(out_file).unwrap());
            surface.write_to_png(&mut file).expect("png output error");
        }
        Err(e) => {
            eprintln!("render error: {}", e);
        }
    }
}
