# svg-rust-nodejs

```sh
# experiment with svg rendering libraries
cargo run --release --examples
./target/release/examples/demo-resvg   test.svg test.resvg.png   800 600
./target/release/examples/demo-librsvg test.svg test.librsvg.png 800 600

# comparison
cairosvg test.svg '--background=#ffffff' -o test.py.png
inkscape test.svg -o test.is.png
convert test.svg test.im.png  # internally uses inkscape (if available) or librsvg

# build nodejs binding
npm run napi:release
node -e 'require("./").svgToPng("./test.svg", "test.node.png", "Roboto", "/usr/share/fonts/TTF/Roboto-Medium.ttf")'

# publish npm package
```

## todo

- [x] background
- [x] font
- [x] nodejs binding
- [ ] deploy on aws lambda
- [ ] hack unsupported `dominant-baseline`
  - https://github.com/RazrFalcon/resvg/issues/119
  - https://gitlab.gnome.org/GNOME/librsvg/-/issues/414

## references

- https://github.com/RazrFalcon/resvg
- https://gitlab.gnome.org/GNOME/librsvg
- https://github.com/napi-rs/napi-rs
