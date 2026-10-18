import {
  LayoutDashboard,
  Shirt,
  FolderTree,
  ShoppingBag,
  Boxes,
  Users,
  TicketPercent,
  Star,
  Mail,
  PanelsTopLeft,
  Settings,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  ownerOnly?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/orders', label: 'Orders', icon: ShoppingBag },
  { to: '/products', label: 'Products', icon: Shirt },
  { to: '/categories', label: 'Categories', icon: FolderTree },
  { to: '/inventory', label: 'Inventory', icon: Boxes },
  { to: '/customers', label: 'Customers', icon: Users },
  { to: '/discounts', label: 'Discounts', icon: TicketPercent },
  { to: '/reviews', label: 'Reviews', icon: Star },
  { to: '/messages', label: 'Messages', icon: Mail },
  { to: '/content', label: 'Content', icon: PanelsTopLeft },
  { to: '/settings', label: 'Settings', icon: Settings, ownerOnly: true },
];
