import fs from "fs";
import { IncomingMessage } from "http";
import fastify, { FastifyReply } from "fastify";
import { getTemporaryFile, sortKeys } from "./utils";
import { svgToPng } from "@hiogawa/svg-rust-nodejs";

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
## example

- GET

${url}?svg=${encodeURIComponent(svg)}

- POST

curl ${url} -d '${svg}' > test.png

`;
  return example;
});

app.get("/debug", async () => {
  return {
    "process.env": sortKeys(process.env),
  };
});

app.get("/svg2png", async (req, res) => {
  const { svg } = req.query as any;
  if (typeof svg !== "string") {
    res.code(400).send({ message: "[ERROR] invalid parameter: svg" });
    return;
  }
  await svg2pngHandler(svg, res);
});

app.post("/svg2png", async (req, res) => {
  await svg2pngHandler(req.raw, res);
});

async function svg2pngHandler(
  input: string | IncomingMessage,
  res: FastifyReply
) {
  const inFile = getTemporaryFile();
  const outFile = getTemporaryFile();
  try {
    await fs.promises.writeFile(inFile, input);

    // TODO: use worker_threads
    svgToPng(inFile, outFile);

    const outData = await fs.promises.readFile(outFile);

    res.header("content-type", "image/png");
    res.send(outData);
  } finally {
    fs.rmSync(inFile);
    fs.rmSync(outFile);
  }
}
