/** Structural type satisfied by both client and admin-SDK Firestore Timestamps. */
export interface TimestampLike {
  seconds: number;
  nanoseconds: number;
  toDate(): Date;
}

/** Firestore timestamp field: a Timestamp when read, a FieldValue sentinel when written. */
export type DateField = TimestampLike | Date | null;

/** Amount in whole Kenyan shillings. Never a float. */
export type KES = number;

export interface ImageAsset {
  url: string;
  /** Cloudinary public_id. Empty for externally hosted images. */
  publicId: string;
  alt?: string;
  width?: number;
  height?: number;
}

export type WithId<T> = T & { id: string };
