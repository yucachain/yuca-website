// Marketplace layout — wraps all marketplace pages with CartProvider for shared cart state
import { CartProvider } from "./context/CartContext";

export default function MarketplaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CartProvider>{children}</CartProvider>;
}