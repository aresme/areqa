import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Heart, MessageCircle, Package, User } from 'lucide-react';
import { whatsappLink } from '@areqa/shared';
import { useCatalog, useCategories } from '@/features/catalog/hooks';
import { useSettings } from '@/features/content/hooks';
import { useUi } from '@/features/ui/uiStore';
import { Sheet } from '@/components/ui/Sheet';
import { cn } from '@/lib/cn';
import { MAIN_NAV } from './nav';

export function MobileMenu() {
  const { panel, close } = useUi();
  const { settings } = useSettings();
  const { data: catalog = [] } = useCatalog();
  const { data: categories = [] } = useCategories();
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <Sheet open={panel === 'menu'} onClose={close} side="left" title="Menu" hideTitle>
      <nav aria-label="Mobile" className="px-5 pb-8">
        <ul className="divide-line border-line divide-y border-y">
          {MAIN_NAV.map((item) => {
            const gender = item.mega;
            const cats = gender
              ? categories.filter((c) =>
                  catalog.some(
                    (e) =>
                      e.categoryId === c.id &&
                      (e.gender === gender || (gender !== 'unisex' && e.gender === 'unisex')),
                  ),
                )
              : [];
            const isOpen = expanded === item.to;
            return (
              <li key={item.to}>
                {cats.length > 0 ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setExpanded(isOpen ? null : item.to)}
                      aria-expanded={isOpen}
                      className="font-display flex w-full items-center justify-between py-4 text-xl font-bold uppercase"
                    >
                      {item.label}
                      <ChevronRight
                        className={cn('size-5 transition-transform', isOpen && 'rotate-90')}
                        aria-hidden
                      />
                    </button>
                    {isOpen && (
                      <ul className="space-y-3 pb-5 pl-1">
                        <li>
                          <Link to={item.to} onClick={close} className="font-semibold">
                            View all {item.label.toLowerCase()}
                          </Link>
                        </li>
                        {cats.map((c) => (
                          <li key={c.id}>
                            <Link
                              to={`${item.to}?category=${c.id}`}
                              onClick={close}
                              className="text-muted"
                            >
                              {c.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                ) : (
                  <Link
                    to={item.to}
                    onClick={close}
                    className={cn(
                      'font-display block py-4 text-xl font-bold uppercase',
                      item.accent && 'text-mint-deep',
                    )}
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
        <ul className="mt-6 space-y-4 text-sm">
          {[
            { to: '/account', label: 'My account', icon: User },
            { to: '/wishlist', label: 'Wishlist', icon: Heart },
            { to: '/track', label: 'Track order', icon: Package },
          ].map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <Link to={to} onClick={close} className="flex items-center gap-3">
                <Icon className="size-4" aria-hidden /> {label}
              </Link>
            </li>
          ))}
          {settings.whatsappNumber && (
            <li>
              <a
                href={whatsappLink(settings.whatsappNumber, `Hi ${settings.storeName}!`)}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3"
              >
                <MessageCircle className="size-4" aria-hidden /> Chat on WhatsApp
              </a>
            </li>
          )}
        </ul>
      </nav>
    </Sheet>
  );
}
