# svg2png-nodejs

```sh
# build
cargo run --release --examples

# demo
./target/release/examples/demo-librsvg test.svg test.librsvg.png 800 600
./target/release/examples/demo-resvg   test.svg test.resvg.png   800 600

# comparison
cairosvg test.svg '--background=#ffffff' -o test.py.png
inkscape test.svg -o test.is.png
convert test.svg test.im.png  # internally uses inkscape (if available) or librsvg
```

## todo

- [x] background
- [x] font
- [ ] nodejs binding
- [ ] hack unsupported `dominant-baseline`
  - https://github.com/RazrFalcon/resvg/issues/119
  - https://gitlab.gnome.org/GNOME/librsvg/-/issues/414

## references

- https://github.com/RazrFalcon/resvg
- https://gitlab.gnome.org/GNOME/librsvg
