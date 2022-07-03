import fs from "fs";
import fastify, { FastifyReply } from "fastify";
import { getTemporaryFile, sortKeys, streamToString } from "./utils";
import { svgToPng } from "@hiogawa/svg-rust-nodejs";
import { fetch } from "undici";
import { hackDominantBaseline } from "./hack-dominant-baseline";
import { resolveExternalHref } from "./resolve-external-href";

export const app = fastify({
  logger: true,
});

// allow accessing `Request.raw` on POST
app.addContentTypeParser("*", function (_request, _payload, done) {
  done(null);
});

app.get("/", (req) => {
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
  const url = `${protocol}://${req.hostname}/svg2png`;
  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 900 600"><rect fill="#fff" height="600" width="900"/><circle fill="#bc002d" cx="450" cy="300" r="180"/></svg>';
  const example = `

# example

- GET

${url}?url=https://raw.githubusercontent.com/hi-ogawa/svg-rust-nodejs/master/misc/examples/test.svg

${url}?svg=${encodeURIComponent(svg)}

- POST

curl https://raw.githubusercontent.com/hi-ogawa/svg-rust-nodejs/master/misc/examples/test.svg | curl ${url} -d @- > test.png

curl ${url} -d '${svg}' > test.png

`.trim();
  return example;
});

app.get("/debug", async () => {
  return {
    "process.env": sortKeys(process.env),
  };
});

app.get("/svg2png", async (req, res) => {
  const { svg, url } = req.query as any;
  if (typeof url === "string") {
    const urlRes = await fetch(url);
    const urlSvg = await urlRes.text();
    await svg2pngHandler(urlSvg, res);
    return;
  }
  if (typeof svg === "string") {
    await svg2pngHandler(svg, res);
    return;
  }
  res.code(400).send({ message: "[ERROR] invalid parameters" });
});

app.post("/svg2png", async (req, res) => {
  const svg = await streamToString(req.raw);
  await svg2pngHandler(svg, res);
});

async function svg2pngHandler(svg: string, res: FastifyReply) {
  const inFile = getTemporaryFile();
  const outFile = getTemporaryFile();
  try {
    svg = hackDominantBaseline(svg);
    svg = await resolveExternalHref(svg);
    await fs.promises.writeFile(inFile, svg);

    // TODO: use worker_threads
    svgToPng(inFile, outFile);

    const outData = await fs.promises.readFile(outFile);

    res.header("content-type", "image/png");
    res.send(outData);
  } finally {
    fs.rmSync(inFile, { force: true });
    fs.rmSync(outFile, { force: true });
  }
}
