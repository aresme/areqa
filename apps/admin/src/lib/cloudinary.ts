import { config } from './env';

export interface UploadedImage {
  url: string;
  publicId: string;
  width: number;
  height: number;
  /** Valid for 10 minutes: lets us delete an image removed in the same editing session. */
  deleteToken?: string;
}

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

export function cloudinaryReady(): boolean {
  return Boolean(config.cloudinary.cloudName && config.cloudinary.uploadPreset);
}

/** Unsigned upload with progress (XHR, because fetch has no upload progress events). */
export function uploadImage(
  file: File,
  onProgress: (pct: number) => void,
  folder = 'products',
): Promise<UploadedImage> {
  return new Promise((resolve, reject) => {
    if (!cloudinaryReady())
      return reject(
        new Error('Cloudinary is not configured. Add VITE_CLOUDINARY_* to apps/admin/.env.'),
      );
    if (!file.type.startsWith('image/')) return reject(new Error(`${file.name} is not an image.`));
    if (file.size > MAX_IMAGE_BYTES) return reject(new Error(`${file.name} is larger than 10 MB.`));

    const body = new FormData();
    body.append('file', file);
    body.append('upload_preset', config.cloudinary.uploadPreset);
    body.append('folder', `${config.cloudinary.folder}/${folder}`);
    body.append('return_delete_token', 'true');

    const xhr = new XMLHttpRequest();
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${config.cloudinary.cloudName}/image/upload`);
    xhr.upload.onprogress = (e) =>
      e.lengthComputable && onProgress(Math.round((e.loaded / e.total) * 100));
    xhr.onload = () => {
      try {
        const res = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve({
            url: res.secure_url,
            publicId: res.public_id,
            width: res.width,
            height: res.height,
            deleteToken: res.delete_token,
          });
        } else reject(new Error(res.error?.message ?? `Upload failed (${xhr.status})`));
      } catch {
        reject(new Error('Upload failed'));
      }
    };
    xhr.onerror = () => reject(new Error('Network error during upload'));
    xhr.send(body);
  });
}

/**
 * Deleting Cloudinary assets normally needs the API secret (a server). Delete tokens from
 * the upload response allow it for 10 minutes; older images are simply unlinked.
 */
export async function deleteByToken(token: string): Promise<boolean> {
  try {
    const body = new FormData();
    body.append('token', token);
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${config.cloudinary.cloudName}/delete_by_token`,
      { method: 'POST', body },
    );
    return res.ok;
  } catch {
    return false;
  }
}
