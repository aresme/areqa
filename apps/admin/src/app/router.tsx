import { lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { AdminLayout } from '@/layouts/AdminLayout';

const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const ProductsPage = lazy(() => import('@/pages/ProductsPage'));
const CategoriesPage = lazy(() => import('@/pages/CategoriesPage'));
const OrdersPage = lazy(() => import('@/pages/OrdersPage'));
const InventoryPage = lazy(() => import('@/pages/InventoryPage'));
const CustomersPage = lazy(() => import('@/pages/CustomersPage'));
const DiscountsPage = lazy(() => import('@/pages/DiscountsPage'));
const ReviewsPage = lazy(() => import('@/pages/ReviewsPage'));
const MessagesPage = lazy(() => import('@/pages/MessagesPage'));
const ContentPage = lazy(() => import('@/pages/ContentPage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    element: <AdminLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'orders/*', element: <OrdersPage /> },
      { path: 'products/*', element: <ProductsPage /> },
      { path: 'categories', element: <CategoriesPage /> },
      { path: 'inventory', element: <InventoryPage /> },
      { path: 'customers/*', element: <CustomersPage /> },
      { path: 'discounts', element: <DiscountsPage /> },
      { path: 'reviews', element: <ReviewsPage /> },
      { path: 'messages', element: <MessagesPage /> },
      { path: 'content/*', element: <ContentPage /> },
      { path: 'settings/*', element: <SettingsPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
