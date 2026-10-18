import { lazy } from 'react';
import { Route, Routes } from 'react-router-dom';

const ProductList = lazy(() => import('./products/ProductList'));
const ProductEditor = lazy(() => import('./products/ProductEditor'));

export default function ProductsPage() {
  return (
    <Routes>
      <Route index element={<ProductList />} />
      <Route path="new" element={<ProductEditor />} />
      <Route path=":id" element={<ProductEditor />} />
    </Routes>
  );
}
