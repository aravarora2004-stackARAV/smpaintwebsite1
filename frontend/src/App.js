import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";

import { AuthProvider } from "./lib/auth.jsx";
import { PublicLayout } from "./components/PublicLayout";

import Home from "./pages/Home";
import Brands from "./pages/Brands";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Colors from "./pages/Colors";
import Gallery from "./pages/Gallery";
import Contact from "./pages/Contact";

import AdminLogin from "./pages/admin/AdminLogin";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminColors from "./pages/admin/AdminColors";
import AdminGallery from "./pages/admin/AdminGallery";
import AdminInquiries from "./pages/admin/AdminInquiries";

const withLayout = (el) => <PublicLayout>{el}</PublicLayout>;

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={withLayout(<Home />)} />
          <Route path="/brands" element={withLayout(<Brands />)} />
          <Route path="/products" element={withLayout(<Products />)} />
          <Route path="/products/:id" element={withLayout(<ProductDetail />)} />
          <Route path="/colors" element={withLayout(<Colors />)} />
          <Route path="/gallery" element={withLayout(<Gallery />)} />
          <Route path="/contact" element={withLayout(<Contact />)} />

          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminOverview />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="colors" element={<AdminColors />} />
            <Route path="gallery" element={<AdminGallery />} />
            <Route path="inquiries" element={<AdminInquiries />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" richColors />
    </AuthProvider>
  );
}
