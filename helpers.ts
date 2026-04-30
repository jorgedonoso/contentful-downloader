import fs from "fs";

// Fix partial urls.
export function fixPartialUrl(url: string): string {
  return url.startsWith("//") ? `https:${url}` : url;
}

// Concurrency pool.
export async function runPool<T>(
  items: T[],
  limit: number,
  worker: (item: T) => Promise<void>,
) {
  const queue = [...items];

  const runners = Array.from({ length: limit }).map(async () => {
    while (queue.length) {
      const item = queue.shift();
      if (!item) return;
      await worker(item);
    }
  });

  await Promise.all(runners);
}

// Retry helper.
export async function withRetry<T>(
  fn: () => Promise<T>,
  retries = 3,
): Promise<T> {
  let err: unknown;

  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (e) {
      err = e;
      await new Promise((r) => setTimeout(r, 500 * (i + 1)));
    }
  }

  throw err;
}

// Download file.
export async function downloadFile(url: string, filePath: string) {
  await withRetry(async () => {
    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`Failed to fetch ${url}`);
    }

    const buffer = await res.arrayBuffer();
    fs.writeFileSync(filePath, Buffer.from(buffer));
  });
}
