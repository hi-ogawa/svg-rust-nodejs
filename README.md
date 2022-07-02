# svg-rust-nodejs

```sh
# build
cargo build --release

# compare with other svg renderers
cargo build --release --examples
./target/release/examples/demo-resvg   misc/examples/test.svg misc/examples/test.resvg.png 800 600
./target/release/examples/demo-librsvg misc/examples/test.svg misc/examples/test.librsvg.png 800 600
cairosvg misc/examples/test.svg '--background=#ffffff' -o misc/examples/test.cairosvg.png
inkscape misc/examples/test.svg -o                        misc/examples/test.inkscape.png
convert misc/examples/test.svg                            misc/examples/test.convert.png  # internally uses inkscape (if available) or librsvg

# build nodejs binding on local OS
npm run napi:release
node -e 'require("./build/napi/svg-rust-nodejs.linux-x64-gnu.node").svgToPng("misc/examples/test.svg", "misc/examples/test.png")'

# build in napi-rs debian image
docker-compose build builder
docker-compose run -T --rm builder cat build/napi/svg-rust-nodejs.linux-x64-gnu.node > build/napi/svg-rust-nodejs.linux-x64-gnu.node

# publish npm package
npm run release
```

## todo

- [x] background
- [x] font
  - [x] embed font data to binary
- [x] nodejs binding
- [x] deploy on aws lambda
- [ ] testing and CI
- [ ] build for multi platform
- [ ] hack unsupported `dominant-baseline`
  - https://github.com/RazrFalcon/resvg/issues/119
  - https://gitlab.gnome.org/GNOME/librsvg/-/issues/414

## references

- https://github.com/RazrFalcon/resvg
- https://gitlab.gnome.org/GNOME/librsvg
- https://github.com/napi-rs/napi-rs
- https://github.com/googlefonts/roboto
