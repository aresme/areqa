import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Heart, Menu, Search, ShoppingBag, User } from 'lucide-react';
import type { Gender } from '@areqa/shared';
import { cartCount, useCart } from '@/features/cart/cartStore';
import { useUi } from '@/features/ui/uiStore';
import { useWishlist } from '@/features/wishlist/wishlistStore';
import { IconButton } from '@/components/ui/IconButton';
import { cn } from '@/lib/cn';
import { Logo } from './Logo';
import { MegaMenu } from './MegaMenu';
import { MAIN_NAV } from './nav';

function CountBubble({ count }: { count: number }) {
  if (count === 0) return null;
  return (
    <span
      className="bg-mint text-ink absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold leading-none"
      aria-hidden
    >
      {count > 99 ? '99+' : count}
    </span>
  );
}

export function Header() {
  const open = useUi((s) => s.open);
  const count = useCart((s) => cartCount(s.items));
  const wishCount = useWishlist((s) => s.ids.length);
  const [scrolled, setScrolled] = useState(false);
  const [mega, setMega] = useState<Gender | null>(null);
  const closeTimer = useRef<number>();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setMega(null), [location.pathname, location.search]);

  const showMega = (g: Gender | undefined) => {
    window.clearTimeout(closeTimer.current);
    setMega(g ?? null);
  };
  const hideMega = () => {
    closeTimer.current = window.setTimeout(() => setMega(null), 120);
  };

  return (
    <header
      className={cn(
        'bg-paper/95 sticky top-0 z-40 border-b backdrop-blur transition-colors',
        scrolled ? 'border-line' : 'border-transparent',
      )}
      onMouseLeave={hideMega}
    >
      <div
        className={cn(
          'container-page flex items-center gap-4 transition-[height] duration-300',
          scrolled ? 'h-14' : 'h-16 lg:h-[72px]',
        )}
      >
        <IconButton label="Open menu" className="-ml-2 lg:hidden" onClick={() => open('menu')}>
          <Menu className="size-5" />
        </IconButton>

        <Logo className="lg:mr-8" />

        <nav aria-label="Main" className="hidden h-full lg:block">
          <ul className="flex h-full items-center gap-7">
            {MAIN_NAV.map((item) => (
              <li
                key={item.to}
                className="flex h-full items-center"
                onMouseEnter={() => showMega(item.mega)}
              >
                <NavLink
                  to={item.to}
                  aria-haspopup={item.mega ? 'true' : undefined}
                  aria-expanded={item.mega ? mega === item.mega : undefined}
                  onFocus={() => showMega(item.mega)}
                  className={({ isActive }) =>
                    cn(
                      'label after:bg-mint-strong relative py-2 after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:origin-left after:scale-x-0 after:transition-transform hover:after:scale-x-100',
                      isActive && 'after:scale-x-100',
                      item.accent && 'text-mint-deep',
                    )
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-0.5 sm:gap-1">
          <IconButton label="Search" onClick={() => open('search')}>
            <Search className="size-5" />
          </IconButton>
          <Link
            to="/wishlist"
            aria-label={`Wishlist, ${wishCount} items`}
            className="hover:bg-mist relative hidden size-10 items-center justify-center rounded sm:inline-flex"
          >
            <Heart className="size-5" />
            <CountBubble count={wishCount} />
          </Link>
          <Link
            to="/account"
            aria-label="Account"
            className="hover:bg-mist hidden size-10 items-center justify-center rounded sm:inline-flex"
          >
            <User className="size-5" />
          </Link>
          <IconButton label={`Cart, ${count} items`} onClick={() => open('cart')} className="-mr-2">
            <ShoppingBag className="size-5" />
            <CountBubble count={count} />
          </IconButton>
        </div>
      </div>

      <div className="hidden lg:block" onMouseEnter={() => window.clearTimeout(closeTimer.current)}>
        <AnimatePresence>
          {mega && <MegaMenu key={mega} gender={mega} onNavigate={() => setMega(null)} />}
        </AnimatePresence>
      </div>
    </header>
  );
}
