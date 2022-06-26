#!/bin/bash
set -eux -o pipefail

# build binding
npm run napi:release

# package files
package_dir=./build/dist
package_files=(
  README.md
  package.json
  index.js
  index.d.ts
  svg-rust-nodejs.linux-x64-gnu.node
)

rm -rf "$package_dir"
mkdir -p "$package_dir"
cp "${package_files[@]}" "$package_dir"

# publish
npm publish "$package_dir" --access public
