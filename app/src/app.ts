import fastify from "fastify";
import { getTemporaryFile, sortKeys } from "./utils";
import fs from "fs";
import { svgToPng } from "@hiogawa/svg-rust-nodejs";

export const app = fastify({
  logger: true,
});

// allow accessing `Request.raw` on POST
app.addContentTypeParser("*", function (_request, _payload, done) {
  done(null);
});

app.get("/", (req) => {
  const url = `https://${req.hostname}/svg2png`;
  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 900 600"><rect fill="#fff" height="600" width="900"/><circle fill="#bc002d" cx="450" cy="300" r="180"/></svg>';
  const example = `example:\n\n    curl ${url} -d '${svg}' > test.png\n`;
  return example;
});

app.get("/debug", async () => {
  return {
    "process.env": sortKeys(process.env),
  };
});

app.post("/svg2png", async (req, res) => {
  const inFile = getTemporaryFile();
  const outFile = getTemporaryFile();
  try {
    await fs.promises.writeFile(inFile, req.raw);

    // TODO: use worker_threads
    svgToPng(inFile, outFile);

    const outData = await fs.promises.readFile(outFile);

    res.header("content-type", "image/png");
    res.send(outData);
  } finally {
    fs.rmSync(inFile);
    fs.rmSync(outFile);
  }
});
