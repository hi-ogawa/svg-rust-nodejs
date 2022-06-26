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

app.get("/", () => {
  return { hello: "world" };
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
