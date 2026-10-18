import { useRef, useState, type DragEvent } from 'react';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, ImagePlus, Star, Trash2, TriangleAlert } from 'lucide-react';
import { imageUrl, type ProductColor } from '@areqa/shared';
import { cloudinaryReady, deleteByToken, uploadImage } from '@/lib/cloudinary';
import { toast } from '@/features/ui/toastStore';
import type { EditorImage } from '@/features/products/types';
import { cn } from '@/lib/cn';

interface Upload {
  id: string;
  name: string;
  progress: number;
  error?: string;
}

const TOKEN_TTL = 9 * 60_000;

function SortableImage({
  img,
  index,
  colors,
  onRemove,
  onMain,
  onColor,
}: {
  img: EditorImage;
  index: number;
  colors: ProductColor[];
  onRemove: () => void;
  onMain: () => void;
  onColor: (c: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: img.url,
  });
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        'bg-paper group relative overflow-hidden rounded border',
        index === 0 ? 'border-ink' : 'border-line',
        isDragging && 'shadow-soft z-10',
      )}
    >
      <img
        src={imageUrl(img.url, { width: 320, aspect: 0.8 })}
        alt={img.alt ?? ''}
        className="aspect-product w-full object-cover"
      />
      {index === 0 && (
        <span className="bg-mint absolute left-2 top-2 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
          Main
        </span>
      )}
      <button
        type="button"
        {...attributes}
        {...listeners}
        aria-label="Drag to reorder"
        className="bg-paper/90 absolute right-2 top-2 cursor-grab rounded p-1 active:cursor-grabbing"
      >
        <GripVertical className="size-4" />
      </button>
      <div className="border-line flex items-center gap-1 border-t p-1.5">
        <select
          value={img.color ?? ''}
          onChange={(e) => onColor(e.target.value)}
          aria-label="Image colour"
          className="border-line bg-paper h-8 min-w-0 flex-1 rounded border px-1 text-xs"
        >
          <option value="">All colours</option>
          {colors.map((c) => (
            <option key={c.name} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
        {index !== 0 && (
          <button
            type="button"
            onClick={onMain}
            title="Set as main image"
            aria-label="Set as main image"
            className="hover:bg-mist rounded p-1.5"
          >
            <Star className="size-4" />
          </button>
        )}
        <button
          type="button"
          onClick={onRemove}
          title="Remove"
          aria-label="Remove image"
          className="text-danger-deep hover:bg-danger/10 rounded p-1.5"
        >
          <Trash2 className="size-4" />
        </button>
      </div>
    </li>
  );
}

export function ImageManager({
  images,
  onChange,
  colors,
  productName,
}: {
  images: EditorImage[];
  onChange: (imgs: EditorImage[]) => void;
  colors: ProductColor[];
  productName: string;
}) {
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [over, setOver] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const latest = useRef(images);
  latest.current = images;
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleFiles = async (files: FileList | File[]) => {
    const list = [...files].filter((f) => f.type.startsWith('image/'));
    if (list.length === 0) return;
    // Upload in parallel; append each as it finishes, preserving drop order.
    await Promise.all(
      list.map(async (file) => {
        const id = `${file.name}-${crypto.randomUUID()}`;
        setUploads((u) => [...u, { id, name: file.name, progress: 0 }]);
        try {
          const res = await uploadImage(file, (progress) =>
            setUploads((u) => u.map((x) => (x.id === id ? { ...x, progress } : x))),
          );
          onChange([
            ...latest.current,
            {
              url: res.url,
              publicId: res.publicId,
              width: res.width,
              height: res.height,
              alt: productName,
              deleteToken: res.deleteToken,
              uploadedAt: Date.now(),
            },
          ]);
          setUploads((u) => u.filter((x) => x.id !== id));
        } catch (err) {
          setUploads((u) =>
            u.map((x) => (x.id === id ? { ...x, error: (err as Error).message } : x)),
          );
        }
      }),
    );
  };

  const remove = async (img: EditorImage) => {
    onChange(images.filter((i) => i.url !== img.url));
    if (img.deleteToken && img.uploadedAt && Date.now() - img.uploadedAt < TOKEN_TTL) {
      await deleteByToken(img.deleteToken);
    } else if (img.publicId) {
      toast.info('Image unlinked', {
        description:
          'It stays in your Cloudinary media library; delete it there if no longer needed.',
      });
    }
  };

  const onDragEnd = (e: DragEndEvent) => {
    if (!e.over || e.active.id === e.over.id) return;
    const from = images.findIndex((i) => i.url === e.active.id);
    const to = images.findIndex((i) => i.url === e.over!.id);
    onChange(arrayMove(images, from, to));
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setOver(false);
    void handleFiles(e.dataTransfer.files);
  };

  return (
    <div>
      {!cloudinaryReady() && (
        <p className="mb-3 flex items-center gap-2 rounded bg-[#FFF1C2] p-3 text-sm text-[#7A5A00]">
          <TriangleAlert className="size-4 shrink-0" /> Cloudinary is not configured, so uploads are
          disabled. Add VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET to
          apps/admin/.env.
        </p>
      )}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={onDrop}
        className={cn(
          'flex flex-col items-center justify-center rounded border-2 border-dashed p-6 text-center transition-colors',
          over ? 'border-mint-strong bg-mint/20' : 'border-line',
        )}
      >
        <ImagePlus className="text-muted size-7" aria-hidden />
        <p className="mt-2 text-sm">
          Drag images here or{' '}
          <button
            type="button"
            onClick={() => input.current?.click()}
            className="font-semibold underline underline-offset-4"
            disabled={!cloudinaryReady()}
          >
            browse
          </button>
        </p>
        <p className="text-muted mt-1 text-xs">
          JPG, PNG or WebP up to 10 MB. Portrait 4:5 looks best. First image is the main image.
        </p>
        <input
          ref={input}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => e.target.files && void handleFiles(e.target.files)}
        />
      </div>

      {uploads.length > 0 && (
        <ul className="mt-3 space-y-2">
          {uploads.map((u) => (
            <li key={u.id} className="text-xs">
              <div className="flex justify-between">
                <span className="truncate">{u.name}</span>
                <span className={u.error ? 'text-danger-deep' : 'text-muted'}>
                  {u.error ?? `${u.progress}%`}
                </span>
              </div>
              {!u.error && (
                <div className="bg-line mt-1 h-1 overflow-hidden rounded">
                  <div
                    className="bg-mint-strong h-full transition-[width]"
                    style={{ width: `${u.progress}%` }}
                  />
                </div>
              )}
              {u.error && (
                <button
                  type="button"
                  className="underline"
                  onClick={() => setUploads((x) => x.filter((y) => y.id !== u.id))}
                >
                  Dismiss
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {images.length > 0 && (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={images.map((i) => i.url)} strategy={rectSortingStrategy}>
            <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
              {images.map((img, i) => (
                <SortableImage
                  key={img.url}
                  img={img}
                  index={i}
                  colors={colors}
                  onRemove={() => void remove(img)}
                  onMain={() => onChange([img, ...images.filter((x) => x.url !== img.url)])}
                  onColor={(c) =>
                    onChange(
                      images.map((x) => (x.url === img.url ? { ...x, color: c || undefined } : x)),
                    )
                  }
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
