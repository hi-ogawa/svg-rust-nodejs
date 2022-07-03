#!/bin/bash
set -eu -o pipefail

# cf. https://github.com/hi-ogawa/ytsub-v3/blob/f55c6bbffddb468e98030f7e28d460bbf9cec6ce/scripts/vercel.sh

#
# setup files for `vercel deploy --prebuilt`
#   https://vercel.com/docs/build-output-api/v3#vercel-primitives/serverless-functions
#
# vercel.json
# .vercel/
#   project.json
#   output/
#     config.json
#     functions/
#       index.func/
#         .vc-config.json
#         bundle.js
#         node_modules/
#         fonts/

deploy_dir=build/deploy
rm -rf "$deploy_dir"
mkdir -p "$deploy_dir/.vercel/output/functions/index.func/node_modules"

# nodejs
npx esbuild src/index-vercel.ts --outfile="$deploy_dir/.vercel/output/functions/index.func/bundle.js" --bundle --platform=node --external:@hiogawa/svg-rust-nodejs
cp -r node_modules/@hiogawa "$deploy_dir/.vercel/output/functions/index.func/node_modules"

# fonts
cp -r fonts "$deploy_dir/.vercel/output/functions/index.func"

# config.json
cat > "$deploy_dir/.vercel/output/config.json" << "EOF"
{
  "version": 3,
  "routes": [
    {
      "src": "^/(.*)$",
      "dest": "/",
      "check": true
    }
  ]
}
EOF

# .vc-config.json
cat > "$deploy_dir/.vercel/output/functions/index.func/.vc-config.json" <<EOF
{
  "runtime": "nodejs16.x",
  "handler": "bundle.js",
  "launcherType": "Nodejs",
  "regions": ["hnd1"]
}
EOF

# project.json
cp .vercel/project.json "$deploy_dir/.vercel"
