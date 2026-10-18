import { useRef, useState } from 'react';
import { ImagePlus, Trash2 } from 'lucide-react';
import { imageUrl, type ImageAsset } from '@areqa/shared';
import { cloudinaryReady, uploadImage } from '@/lib/cloudinary';
import { cn } from '@/lib/cn';

/** One image (category, collection, banner…). */
export function SingleImageUpload({
  value,
  onChange,
  folder,
  aspect = 0.8,
  label = 'Image',
}: {
  value: ImageAsset | null;
  onChange: (v: ImageAsset | null) => void;
  folder: string;
  aspect?: number;
  label?: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState('');

  const pick = async (file: File) => {
    setError('');
    setProgress(0);
    try {
      const res = await uploadImage(file, setProgress, folder);
      onChange({
        url: res.url,
        publicId: res.publicId,
        width: res.width,
        height: res.height,
        alt: value?.alt ?? '',
      });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setProgress(null);
    }
  };

  return (
    <div>
      <p className="mb-1.5 text-sm font-medium">{label}</p>
      <div className="flex items-start gap-4">
        <div
          className="border-line bg-mist relative w-28 shrink-0 overflow-hidden rounded border"
          style={{ aspectRatio: String(aspect) }}
        >
          {value?.url ? (
            <img
              src={imageUrl(value.url, { width: 240, aspect })}
              alt=""
              className="size-full object-cover"
            />
          ) : (
            <ImagePlus className="text-muted absolute inset-0 m-auto size-6" aria-hidden />
          )}
          {progress !== null && (
            <div className="bg-line absolute inset-x-0 bottom-0 h-1">
              <div className="bg-mint-strong h-full" style={{ width: `${progress}%` }} />
            </div>
          )}
        </div>
        <div className="space-y-2 text-sm">
          <button
            type="button"
            disabled={!cloudinaryReady() || progress !== null}
            onClick={() => input.current?.click()}
            className={cn(
              'border-ink rounded border px-3 py-1.5 text-xs font-semibold uppercase',
              !cloudinaryReady() && 'opacity-40',
            )}
          >
            {value ? 'Replace' : 'Upload'}
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange(null)}
              className="text-danger-deep flex items-center gap-1 text-xs"
            >
              <Trash2 className="size-3.5" /> Remove
            </button>
          )}
          {!cloudinaryReady() && (
            <p className="text-muted text-xs">Configure Cloudinary to upload.</p>
          )}
          {error && (
            <p role="alert" className="text-danger-deep text-xs">
              {error}
            </p>
          )}
        </div>
        <input
          ref={input}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => e.target.files?.[0] && void pick(e.target.files[0])}
        />
      </div>
    </div>
  );
}
