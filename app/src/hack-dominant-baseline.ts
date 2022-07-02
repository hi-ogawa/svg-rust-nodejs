import { streamToString } from "./utils";

export function hackDominantBaseline(data: string): string {
  return data.replaceAll(/<text(.*?)>/g, replaceText);
}

// support only echarts/zrender's svg output https://github.com/ecomfe/zrender/blob/4b664fbdc32060032a35d1d39a4129264dbb44df/src/svg/graphic.ts#L276-L306
const FONT_SIZE_RE = /font-size:(\d+)px/;
const DOMINANT_BASELINE_RE = /dominant-baseline="(\w+)"/;

function replaceText(textTag: string): string {
  const fontSize = textTag.match(FONT_SIZE_RE);
  const dominantBaseline = textTag.match(DOMINANT_BASELINE_RE);
  if (fontSize && dominantBaseline && dominantBaseline[1] === "central") {
    const dy = Number(fontSize[1]) / 3;
    return textTag.replace(DOMINANT_BASELINE_RE, `dy="${dy}"`);
  }
  return textTag;
}

//
// cli
//

async function main() {
  const stdin = await streamToString(process.stdin);
  process.stdout.write(hackDominantBaseline(stdin));
}

if (process.env.NODE_ENV !== "production" && require.main === module) {
  main();
}
