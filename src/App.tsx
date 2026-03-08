import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import UploadProduct from "./pages/UploadProduct";
import ProductPage from "./pages/ProductPage";
import ProductLanding from "./pages/ProductLanding";
import Analytics from "./pages/Analytics";
import SocialAccounts from "./pages/SocialAccounts";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Marketplace from "./pages/Marketplace";
import Orders from "./pages/Orders";
import Onboarding from "./pages/Onboarding";
import MarketInsights from "./pages/MarketInsights";
import Storefront from "./pages/Storefront";
import ImageStudio from "./pages/ImageStudio";
import VideoScripts from "./pages/VideoScripts";
import CampaignGenerator from "./pages/CampaignGenerator";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/onboarding" element={
                <ProtectedRoute><Onboarding /></ProtectedRoute>
              } />
              <Route path="/dashboard" element={
                <ProtectedRoute><Dashboard /></ProtectedRoute>
              } />
              <Route path="/upload" element={
                <ProtectedRoute><UploadProduct /></ProtectedRoute>
              } />
              <Route path="/product/:id" element={<ProductPage />} />
              <Route path="/p/:slug" element={<ProductLanding />} />
              <Route path="/analytics" element={
                <ProtectedRoute><Analytics /></ProtectedRoute>
              } />
              <Route path="/social-accounts" element={
                <ProtectedRoute><SocialAccounts /></ProtectedRoute>
              } />
              <Route path="/market-insights" element={
                <ProtectedRoute><MarketInsights /></ProtectedRoute>
              } />
              <Route path="/image-studio" element={
                <ProtectedRoute><ImageStudio /></ProtectedRoute>
              } />
              <Route path="/video-scripts" element={
                <ProtectedRoute><VideoScripts /></ProtectedRoute>
              } />
              <Route path="/campaigns" element={
                <ProtectedRoute><CampaignGenerator /></ProtectedRoute>
              } />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/store/:sellerName" element={<Storefront />} />
              <Route path="/orders" element={
                <ProtectedRoute><Orders /></ProtectedRoute>
              } />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
