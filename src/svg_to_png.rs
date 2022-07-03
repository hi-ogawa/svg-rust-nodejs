use napi::bindgen_prelude::{Error, Result, Status};
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
) -> Result<()> {
    // configuration
    let mut opts = usvg::Options::default();
    opts.font_size = 16.0; // TODO: configurable

    #[cfg(feature = "embed-font")]
    {
        opts.font_family = "Roboto".to_string();
        let font_data = std::include_bytes!("../misc/fonts/roboto-android/Roboto-Regular.ttf");
        opts.fontdb.load_font_data(font_data.to_vec()); // logging only when error
    }

    if let Some(font_family) = font_family {
        opts.font_family = font_family;
    }
    if let Some(font_file) = font_file {
        opts.fontdb.load_font_file(font_file)?;
    }

    // conver svg to usvg tree
    let svg = std::fs::read(in_file)?;
    let tree = usvg::Tree::from_data(&svg, &opts.to_ref()).map_err(to_generic_failure)?;

    // render to pixmap
    let screen_size = tree.svg_node().size.to_screen_size();
    let mut pixmap = tiny_skia::Pixmap::new(screen_size.width(), screen_size.height())
        .ok_or(to_generic_failure("tiny_skia::Pixmap::new error"))?;

    // while background (TODO: configurable)
    let background = tiny_skia::Color::from_rgba(1.0, 1.0, 1.0, 1.0)
        .ok_or(to_generic_failure("tiny_skia::Color::from_rgba error"))?;
    pixmap.fill(background);

    resvg::render(
        &tree,
        usvg::FitTo::Original,
        tiny_skia::Transform::default(),
        pixmap.as_mut(),
    )
    .ok_or(to_generic_failure("resvg::render error"))?;

    // write png
    pixmap.save_png(out_file).map_err(to_generic_failure)?;
    Ok(())
}

fn to_generic_failure<T: ToString>(e: T) -> Error {
    Error::new(Status::GenericFailure, e.to_string())
}
