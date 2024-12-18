import { AtpAgent } from "@atproto/api";
import { readFileSync } from "node:fs";
import mime from "mime-types";

const agent = new AtpAgent({
  service: "https://bsky.social",
});

await agent.login({
  identifier: process.env.IDENTIFIER!,
  password: process.env.APP_PASSWORD!,
});

const readText = (p) => readFileSync(p, "utf8").trimEnd();

const displayName = readText("bio/name.txt");
const description = readText("bio/description.txt");
const avatar = await (async () => {
  const filename = readText("bio/avatar.filename");
  const image = readFileSync(`avatars/${filename}`).buffer;
  const encoding = mime.lookup(filename) as string;
  const { data } = await agent.uploadBlob(image as Uint8Array, {
    encoding,
  });
  return data.blob;
})();
const banner = await (async () => {
  const filename = readText("bio/banner.filename");
  const image = readFileSync(`banners/${filename}`).buffer;
  const encoding = mime.lookup(filename) as string;
  const { data } = await agent.uploadBlob(image as Uint8Array, {
    encoding,
  });
  return data.blob;
})();

await agent.upsertProfile((old) => ({
  ...old,
  displayName,
  description,
  avatar,
  banner,
}));
