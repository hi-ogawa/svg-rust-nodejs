import fs from "fs";
import fastify, { FastifyReply } from "fastify";
import { getTemporaryFile, sortKeys, streamToString } from "./utils";
import { svgToPng } from "@hiogawa/svg-rust-nodejs";
import { fetch } from "undici";
import { hackDominantBaseline } from "./hack-dominant-baseline";
import { resolveExternalHref } from "./resolve-external-href";
import { z } from "zod";

export const app = fastify({
  logger: true,
});

// allow accessing `Request.raw` on POST
app.addContentTypeParser("*", function (_request, _payload, done) {
  done(null);
});

//
// GET /
//

app.get("/", (req) => {
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
  const url = `${protocol}://${req.hostname}/svg2png`;
  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 900 600"><rect fill="#fff" height="600" width="900"/><circle fill="#bc002d" cx="450" cy="300" r="180"/></svg>';
  const svgEmbeddedFont =
    '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200"><text x="50%" y="50%" text-anchor="middle" dominant-baseline="central" style="font-size:40px;" fill="#000">日本語テスト</text></svg>';
  const svgCustomFont =
    '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200"><text x="50%" y="50%" text-anchor="middle" dominant-baseline="central" style="font-size:40px;" fill="#000">🅐🄰🄐</text></svg>';
  const example = `

# example

- GET

  - url parameter

${url}?url=https://raw.githubusercontent.com/hi-ogawa/svg-rust-nodejs/master/misc/examples/test.svg

  - svg parameter

${url}?svg=${encodeURIComponent(svg)}

  - svg parameter (embedded font)

${url}?svg=${encodeURIComponent(svgEmbeddedFont)}

  - fontUrl parameter

${url}?svg=${encodeURIComponent(
    svgCustomFont
  )}&fontUrl=https://rawcdn.githack.com/googlefonts/noto-emoji/c0040cb09cae5ee7ec3723251d7fa2581673c50b/fonts/NotoColorEmoji.ttf

- POST

curl https://raw.githubusercontent.com/hi-ogawa/svg-rust-nodejs/master/misc/examples/test.svg | curl ${url} -d @- > test.png

curl ${url} -d '${svg}' > test.png

`.trim();
  return example;
});

//
// GET /debug
//

app.get("/debug", async () => {
  return {
    "process.env": sortKeys(process.env),
  };
});

//
// GET /svg2png
//

const GET_SCHEMA = z.object({
  svg: z.string().optional(),
  url: z.string().optional(),
  fontFamily: z.string().optional(),
  fontUrl: z.string().url().optional(),
});

app.get("/svg2png", async (req, res) => {
  const parsed = GET_SCHEMA.safeParse(req.query);
  if (!parsed.success) {
    res.code(400).send({ message: "invalid parameters" });
    return;
  }
  let svg: string;
  if (parsed.data.url) {
    const urlRes = await fetch(parsed.data.url);
    svg = await urlRes.text();
  } else if (parsed.data.svg) {
    svg = parsed.data.svg;
  } else {
    res.code(400).send({ message: "invalid parameters" });
    return;
  }
  await svg2pngHandler(svg, res, parsed.data.fontFamily, parsed.data.fontUrl);
});

//
// POST / svg2png
//

const POST_SCHEMA = GET_SCHEMA.pick({ fontFamily: true, fontUrl: true });

app.post("/svg2png", async (req, res) => {
  const parsed = POST_SCHEMA.safeParse(req.query);
  if (!parsed.success) {
    res.code(400).send({ message: "invalid parameters" });
    return;
  }
  const svg = await streamToString(req.raw);
  await svg2pngHandler(svg, res, parsed.data.fontFamily, parsed.data.fontUrl);
});

//
// utils
//

async function svg2pngHandler(
  svg: string,
  res: FastifyReply,
  fontFamily?: string,
  fontUrl?: string
) {
  const inFile = getTemporaryFile();
  const outFile = getTemporaryFile();
  const fontFile = getTemporaryFile();
  try {
    svg = hackDominantBaseline(svg);
    svg = await resolveExternalHref(svg);
    await fs.promises.writeFile(inFile, svg);

    const fontFiles = [...EMBEDDED_FONT_FILES];
    if (fontUrl) {
      const fontRes = await fetch(fontUrl);
      if (fontRes.body) {
        await fs.promises.writeFile(fontFile, fontRes.body);
        fontFiles.push(fontFile);
      }
    }
    // TODO: use worker_threads
    svgToPng(inFile, outFile, fontFamily, fontFiles);

    const outData = await fs.promises.readFile(outFile);

    res.header("content-type", "image/png");
    res.send(outData);
  } finally {
    fs.rmSync(inFile, { force: true });
    fs.rmSync(outFile, { force: true });
    fs.rmSync(fontFile, { force: true });
  }
}

const EMBEDDED_FONT_FILES = ["fonts/NotoSansJP-Regular.otf"];
