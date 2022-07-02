import { uniq, zip } from "lodash";
import assert from "assert";
import { fetch } from "undici";

export async function resolveExternalHref(data: string): Promise<string> {
  // find href
  const matches = data.matchAll(/href="(https?:\/\/.*?)"/g);
  const urls = uniq(Array.from(matches, (match) => match[1]));

  // fetch resource
  const dataUrls = await Promise.all(
    urls.map(async (url) => {
      const ext = url.split(".").at(-1);
      assert.ok(
        ext && ["png", "jpg"].includes(ext),
        `invalid href: ext = ${ext}`
      );

      const res = await fetch(url);
      const bin = await res.arrayBuffer();
      const base64 = Buffer.from(bin).toString("base64");
      return `data:image/${ext};base64,${base64}`;
    })
  );

  // replace
  let result = data;
  for (const [url, dataUrl] of zip(urls, dataUrls)) {
    assert.ok(url && dataUrl);
    result = result.replaceAll(url, dataUrl);
  }

  return result;
}
