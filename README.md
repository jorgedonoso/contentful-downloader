# Contentful Downloader

A Node.js script to download image assets from a Contentful export file.

## Background

Contentful changed their free tier and archived these spaces. Users can download text content with the official CLI but it does not include images.

## Features

- Downloads image assets from a Contentful export.
- Limits concurrent download requests.
- Skips files that already exist locally.
- Retries failed downloads automatically.

## Implementation Highlights

### Concurrency Pool

This helper processes items with up to limit concurrent workers. Resolves once all items have been processed.

```js
export async function runPool<T>(
  items: T[],
  limit: number,
  worker: (item: T) => Promise<void>,
) {
  // Create queue of items to process.
  const queue = [...items];

  // Start a fixed number of concurrent workers.
  const runners = Array.from({ length: limit }).map(async () => {
    // Continue processing until the queue is empty.
    while (queue.length) {
      const item = queue.shift();
      if (!item) return;
      await worker(item);
    }
  });

  // Wait for all workers to finish.
  await Promise.all(runners);
}
```

## Requirements

- Node.js
- A Contentful export file (`contentful.json`)

## Usage

### 1. Export data from Contentful

Install and use the Contentful CLI:

```bash
npm install -g contentful-cli
contentful login
contentful space export --space-id {YOUR_SPACE_ID}
```

### 2. Install and run the downloader

```bash
npm install
npm run download-assets
```

## Demo

```cli
Found 312 assets
...
Skip: BDE3BC3B-D4E8-4DA6-8C6B-A0D3F3888D87_1_201_a.jpeg
Skip: 5976DF5E-E52F-4839-B55D-133889AE247A_1_201_a.jpeg
Skip: 7F9BA5EA-E2F5-44AA-A08D-0BB3667B67BB_1_201_a.jpeg
Downloading: 5C7DB9E1-5311-44D5-B675-07A12A311F18_1_201_a.jpeg
Downloading: 037760F2-09CE-402C-8C5A-4E88A0F3B7ED_1_201_a.jpeg
Downloading: 775029CA-9E3F-4A1C-9981-D97F6DC844D3_1_201_a.jpeg
...
Done.
```

## Author

Jorge Donoso

## License

MIT
