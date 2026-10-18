/**
 * Firestore writes wait for the server while offline, which would leave a button spinning.
 * Use this for user-initiated writes so the customer gets a clear message instead.
 */
export function withTimeout<T>(
  promise: Promise<T>,
  ms = 15_000,
  message = 'This is taking too long. Check your connection and try again.',
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(message)), ms);
    promise.then(
      (v) => {
        clearTimeout(t);
        resolve(v);
      },
      (e) => {
        clearTimeout(t);
        reject(e);
      },
    );
  });
}
