import fs from "fs";
import path from "path";
import { ContentfulExport } from "./types/ContentfulExport";
import { downloadFile, runPool, fixPartialUrl } from "./helpers";

const INPUT_FILE = "contentful.json";
const IMAGE_DIR = "images";

async function run() {
  const raw = JSON.parse(
    fs.readFileSync(INPUT_FILE, "utf-8"),
  ) as ContentfulExport;

  if (!fs.existsSync(IMAGE_DIR)) {
    fs.mkdirSync(IMAGE_DIR);
  }

  const assets = raw.assets ?? [];

  console.log(`Found ${assets.length} assets`);

  await runPool(assets, 5, async (asset) => {
    const file = asset.fields?.file?.["en-US"];
    if (!file) return;

    const url = file.url;
    const fileName = file.fileName;

    const fullUrl = fixPartialUrl(url);
    const filePath = path.join(IMAGE_DIR, fileName);

    // Already downloaded.
    if (fs.existsSync(filePath)) {
      console.log("Skip:", fileName);
      return;
    }

    console.log("Downloading:", fileName);

    await downloadFile(fullUrl, filePath);
  });

  console.log("Done.");
}

run().catch(console.error);
