import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const CACHE_FILE = join(dirname(fileURLToPath(import.meta.url)), '.cache', 'uploads.json');

interface Uploaded {
  url: string;
  publicId: string;
  width?: number;
  height?: number;
}

/**
 * Copies remote seed images into the owner's Cloudinary account via the unsigned preset
 * (Cloudinary fetches the remote URL itself). Results are cached so re-seeding is free.
 */
export class SeedImageUploader {
  private cache: Record<string, Uploaded>;

  constructor(
    private readonly cloudName: string,
    private readonly preset: string,
    private readonly folder: string,
  ) {
    this.cache = existsSync(CACHE_FILE) ? JSON.parse(readFileSync(CACHE_FILE, 'utf8')) : {};
  }

  get enabled() {
    return Boolean(this.cloudName && this.preset);
  }

  async upload(remoteUrl: string): Promise<Uploaded> {
    if (!this.enabled) return { url: remoteUrl, publicId: '' };
    const cached = this.cache[remoteUrl];
    if (cached) return cached;

    const body = new FormData();
    body.set('file', `${remoteUrl}?w=1600&q=85&fm=jpg`);
    body.set('upload_preset', this.preset);
    body.set('folder', `${this.folder}/seed`);
    const res = await fetch(`https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`, {
      method: 'POST',
      body,
    });
    if (!res.ok) {
      const text = await res.text();
      console.warn(
        `  ! Cloudinary upload failed (${res.status}), using original URL: ${text.slice(0, 160)}`,
      );
      return { url: remoteUrl, publicId: '' };
    }
    const json = (await res.json()) as {
      secure_url: string;
      public_id: string;
      width: number;
      height: number;
    };
    const result = {
      url: json.secure_url,
      publicId: json.public_id,
      width: json.width,
      height: json.height,
    };
    this.cache[remoteUrl] = result;
    mkdirSync(dirname(CACHE_FILE), { recursive: true });
    writeFileSync(CACHE_FILE, JSON.stringify(this.cache, null, 2));
    return result;
  }
}
