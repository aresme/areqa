import { Suspense, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { NAV_ITEMS } from '@/app/nav';
import { cn } from '@/lib/cn';
import { Skeleton } from '@/components/ui/Skeleton';

/** Phase 1 shell — auth guard, top bar search and profile menu arrive in phase 5. */
export function AdminLayout() {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-dvh lg:pl-64">
      <aside
        className={cn(
          'border-line bg-paper fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r transition-transform lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-16 items-center justify-between px-5">
          <span className="font-display text-xl font-bold uppercase">
            Areqa{' '}
            <span className="bg-mint rounded px-1.5 py-0.5 text-[10px] tracking-widest">Admin</span>
          </span>
          <button className="lg:hidden" onClick={() => setOpen(false)} aria-label="Close menu">
            <X className="size-5" />
          </button>
        </div>
        <nav aria-label="Admin" className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
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
      </aside>
      {open && (
        <div
          className="bg-ink/40 fixed inset-0 z-30 lg:hidden"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      )}
      <header className="border-line bg-paper sticky top-0 z-20 flex h-16 items-center border-b px-4 lg:px-8">
        <button className="lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
          <Menu className="size-5" />
        </button>
      </header>
      <main className="p-4 lg:p-8">
        <Suspense fallback={<Skeleton className="h-64 w-full" />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
}
