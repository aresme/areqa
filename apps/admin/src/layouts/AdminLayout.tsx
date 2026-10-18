import { Suspense, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { ExternalLink, LogOut, Menu, Search, X } from 'lucide-react';
import { initials } from '@areqa/shared';
import { NAV_ITEMS } from '@/app/nav';
import { RequireAdmin } from '@/components/RequireAdmin';
import { Skeleton } from '@/components/ui/Skeleton';
import { Toaster } from '@/components/ui/Toaster';
import { adminSignOut, isOwner, useAdminAuth } from '@/features/auth/adminAuth';
import { config } from '@/lib/env';
import { cn } from '@/lib/cn';

function TopSearch() {
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        const v = q.trim();
        if (!v) return;
        // Order numbers and phone numbers go to orders, anything else searches products.
        navigate(
          /^(ord-|0|\+?254)/i.test(v)
            ? `/orders?q=${encodeURIComponent(v)}`
            : `/products?q=${encodeURIComponent(v)}`,
        );
        setQ('');
      }}
      className="relative hidden max-w-md flex-1 sm:block"
    >
      <Search
        className="text-muted pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2"
        aria-hidden
      />
      <label htmlFor="admin-search" className="sr-only">
        Search orders or products
      </label>
      <input
        id="admin-search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search order no., phone or product…"
        className="border-line bg-mist focus:border-ink focus:bg-paper h-10 w-full rounded border pl-9 pr-3 text-sm"
      />
    </form>
  );
}

export function AdminLayout() {
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const admin = useAdminAuth((s) => s.admin);
  const owner = isOwner(admin?.role);

  return (
    <RequireAdmin>
      <div className="min-h-dvh lg:pl-60 print:pl-0">
        <aside
          className={cn(
            'border-line bg-paper fixed inset-y-0 left-0 z-40 flex w-60 flex-col border-r transition-transform lg:translate-x-0 print:hidden',
            open ? 'translate-x-0' : '-translate-x-full',
          )}
        >
          <div className="flex h-16 items-center justify-between px-5">
            <span className="font-display text-xl font-bold uppercase">
              Areqa<span className="text-mint-strong">.</span>{' '}
              <span className="bg-mint ml-1 rounded px-1.5 py-0.5 align-middle text-[10px] tracking-widest">
                Admin
              </span>
            </span>
            <button className="lg:hidden" onClick={() => setOpen(false)} aria-label="Close menu">
              <X className="size-5" />
            </button>
          </div>
          <nav aria-label="Admin" className="flex-1 space-y-0.5 overflow-y-auto px-3 py-2">
            {NAV_ITEMS.filter((n) => owner || !n.ownerOnly).map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded px-3 py-2 font-medium transition-colors',
                    isActive ? 'bg-mint text-ink' : 'text-muted hover:bg-mist hover:text-ink',
                  )
                }
              >
                <Icon className="size-4" aria-hidden />
                {label}
              </NavLink>
            ))}
          </nav>
          <a
            href={config.storeUrl}
            target="_blank"
            rel="noreferrer"
            className="border-line hover:border-ink m-3 flex items-center justify-between rounded border px-3 py-2 text-xs font-medium"
          >
            View store <ExternalLink className="size-3.5" />
          </a>
        </aside>
        {open && (
          <div
            className="bg-ink/40 fixed inset-0 z-30 lg:hidden"
            onClick={() => setOpen(false)}
            aria-hidden
          />
        )}

        <header className="border-line bg-paper sticky top-0 z-20 flex h-16 items-center gap-4 border-b px-4 lg:px-8 print:hidden">
          <button className="lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
            <Menu className="size-5" />
          </button>
          <TopSearch />
          <div className="relative ml-auto">
            <button
              onClick={() => setMenu((m) => !m)}
              aria-expanded={menu}
              aria-haspopup="menu"
              className="hover:bg-mist flex items-center gap-3 rounded px-2 py-1.5"
            >
              <span className="hidden text-right sm:block">
                <span className="block text-sm font-semibold leading-tight">{admin?.name}</span>
                <span className="text-muted block text-xs capitalize">{admin?.role}</span>
              </span>
              <span className="bg-ink text-paper flex size-9 items-center justify-center rounded-full text-xs font-bold">
                {initials(admin?.name ?? '?')}
              </span>
            </button>
            {menu && (
              <div
                role="menu"
                className="card shadow-soft absolute right-0 top-full mt-2 w-48 p-1"
                onMouseLeave={() => setMenu(false)}
              >
                <p className="text-muted truncate px-3 py-2 text-xs">{admin?.email}</p>
                <button
                  role="menuitem"
                  onClick={() => void adminSignOut()}
                  className="hover:bg-mist flex w-full items-center gap-2 rounded px-3 py-2 text-sm"
                >
                  <LogOut className="size-4" /> Sign out
                </button>
              </div>
            )}
          </div>
        </header>
        <main className="p-4 lg:p-8 print:p-0">
          <Suspense fallback={<Skeleton className="h-64 w-full" />}>
            <Outlet />
          </Suspense>
        </main>
        <Toaster />
      </div>
    </RequireAdmin>
  );
}
