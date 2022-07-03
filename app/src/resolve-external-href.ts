import { uniq, zip } from "lodash";
import assert from "assert";
import { fetch } from "undici";
import { streamToString } from "./utils";

export async function resolveExternalHref(data: string): Promise<string> {
  // find href
  const matches = data.matchAll(/href="(https?:\/\/.*?)"/g);
  const urls = uniq(Array.from(matches, (match) => match[1]));

  // fetch resource
  const dataUrls = await Promise.all(
    urls.map(async (url) => {
      url = xmlUnescape(url);
      const res = await fetch(xmlUnescape(url));
      const bin = await res.arrayBuffer();
      const base64 = Buffer.from(bin).toString("base64");
      return `data:;base64,${base64}`;
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

function xmlUnescape(value: string): string {
  for (const [escaped, original] of XML_ESCAPES) {
    value = value.replaceAll(escaped, original);
  }
  return value;
}

const XML_ESCAPES = [
  ["&amp;", "&"],
  ["&lt;", "<"],
  ["&gt;", ">"],
  ["&quot;", '"'],
  ["&apos;", "'"],
] as const;

//
// cli
//

async function main() {
  const stdin = await streamToString(process.stdin);
  process.stdout.write(await resolveExternalHref(stdin));
}

if (process.env.NODE_ENV !== "production" && require.main === module) {
  main();
}
