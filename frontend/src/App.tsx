import { BrowserRouter, Route, Routes } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";

import Home from "./pages/Home";
import About from "./pages/About";
import Services from "./pages/Services";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Contact from "./pages/Contact";
import HealthResources from "./pages/HealthResources";
import Diagnostics from "./pages/Diagnostics";
import Reviews from "./pages/Reviews";
import FAQ from "./pages/FAQ";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Account from "./pages/Account";
import Login from "./pages/Login";
import Register from "./pages/Register";

import HealthArticles from "./pages/health/HealthArticles";
import HealthArticleDetails from "./pages/health/HealthArticleDetails";

import AdminDashboard from "./admin/pages/AdminDashboard";
import AdminProducts from "./admin/pages/AdminProducts";
import AdminCategories from "./admin/pages/AdminCategories";
import AdminInventory from "./admin/pages/AdminInventory";
import AdminOrders from "./admin/pages/AdminOrders";
import AdminCustomers from "./admin/pages/AdminCustomers";
import AdminPrescriptions from "./admin/pages/AdminPrescriptions";
import AdminBlog from "./admin/pages/AdminBlog";
import AdminReviews from "./admin/pages/AdminReviews";
import AdminMessages from "./admin/pages/AdminMessages";
import AdminSettings from "./admin/pages/AdminSettings";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public website */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />

          <Route path="/about" element={<About />} />

          <Route path="/services" element={<Services />} />

          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetails />} />

          <Route path="/contact" element={<Contact />} />

          <Route path="/health" element={<HealthResources />} />
          <Route path="/diagnostics" element={<Diagnostics />} />

          <Route path="/reviews" element={<Reviews />} />
          <Route path="/faq" element={<FAQ />} />

          <Route path="/health/articles" element={<HealthArticles />} />

          <Route
            path="/health/articles/:slug"
            element={<HealthArticleDetails />}
          />

          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />

          <Route path="/account" element={<Account />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Admin */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/products" element={<AdminProducts />} />
          <Route path="/admin/categories" element={<AdminCategories />} />
          <Route path="/admin/inventory" element={<AdminInventory />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route path="/admin/customers" element={<AdminCustomers />} />
          <Route path="/admin/prescriptions" element={<AdminPrescriptions />} />
          <Route path="/admin/blog" element={<AdminBlog />} />
          <Route path="/admin/reviews" element={<AdminReviews />} />
          <Route path="/admin/messages" element={<AdminMessages />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
