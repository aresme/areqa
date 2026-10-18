import { lazy } from 'react';
import { Route, Routes } from 'react-router-dom';

const OrderList = lazy(() => import('./orders/OrderList'));
const OrderDetail = lazy(() => import('./orders/OrderDetail'));

export default function OrdersPage() {
  return (
    <Routes>
      <Route index element={<OrderList />} />
      <Route path=":id" element={<OrderDetail />} />
    </Routes>
  );
}
