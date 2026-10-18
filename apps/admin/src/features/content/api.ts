import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { COL, DOC, type HomeContent, type PagesContent } from '@areqa/shared';
import { requireFirebase } from '@/lib/firebase';

const ref = (id: string) => doc(requireFirebase().db, COL.content, id);

export const EMPTY_HOME: HomeContent = {
  announcement: { text: '', href: '', isActive: false },
  heroSlides: [],
  featureBanner: {
    eyebrow: '',
    headline: '',
    body: '',
    image: { url: '', publicId: '' },
    cta: { label: 'Shop now', href: '/shop' },
  },
  testimonials: [],
  lookbook: [],
  newsletter: { headline: 'Join the list', body: '' },
};

const blankPage = (title: string) => ({ title, body: '' });
export const EMPTY_PAGES: PagesContent = {
  faq: [],
  pages: {
    about: blankPage('About'),
    shipping: blankPage('Shipping & Delivery'),
    returns: blankPage('Returns & Exchanges'),
    privacy: blankPage('Privacy Policy'),
    terms: blankPage('Terms & Conditions'),
  },
};

export const useHomeContent = () =>
  useQuery({
    queryKey: ['admin-content', 'home'],
    queryFn: async () => ({
      ...EMPTY_HOME,
      ...((await getDoc(ref(DOC.homeContent))).data() as Partial<HomeContent> | undefined),
    }),
  });

export const usePagesContent = () =>
  useQuery({
    queryKey: ['admin-content', 'pages'],
    queryFn: async () => ({
      ...EMPTY_PAGES,
      ...((await getDoc(ref(DOC.pagesContent))).data() as Partial<PagesContent> | undefined),
    }),
  });

/** Whole-document writes keep the storefront's single read per content doc. */
export async function saveHome(content: HomeContent) {
  await setDoc(ref(DOC.homeContent), content);
}

export async function savePages(content: PagesContent) {
  await setDoc(ref(DOC.pagesContent), content);
}

export function useContentCache() {
  const qc = useQueryClient();
  return {
    setHome: (c: HomeContent) => qc.setQueryData(['admin-content', 'home'], c),
    setPages: (c: PagesContent) => qc.setQueryData(['admin-content', 'pages'], c),
  };
}

export const newId = () => crypto.randomUUID().slice(0, 8);
