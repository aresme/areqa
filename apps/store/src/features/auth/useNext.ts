import { useSearchParams } from 'react-router-dom';

/** Safe post-login redirect: only same-site paths are allowed. */
export function useNext(fallback = '/account'): string {
  const [params] = useSearchParams();
  const next = params.get('next') ?? '';
  return next.startsWith('/') && !next.startsWith('//') ? next : fallback;
}
