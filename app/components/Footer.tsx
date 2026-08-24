import Image from "next/image";
import Link from "next/link";

const quickLinks = [
  { label: "About Us", href: "#" },
  { label: "Our Story", href: "#" },
  { label: "Join Us", href: "/register" },
  { label: "News", href: "#" },
  { label: "Contact", href: "#" },
];

const products = [
  { label: "YucaChain App", href: "#" },
  { label: "YucaVault", href: "#" },
  { label: "YucaHub", href: "#" },
  { label: "Marketplace", href: "/login" },
  { label: "Supply Chain", href: "#" },
];

export default function Footer() {
  return (
    <footer
      className="text-white"
      style={{ background: "linear-gradient(to bottom, #226049 0%, #46C697 100%)" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-8">

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 sm:gap-12 pb-8 sm:pb-12 border-b border-white/20">


          <div className="flex flex-col gap-4 sm:gap-5 sm:col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 w-fit">
              <Image
                src="/images/Logo.png"
                alt="YucaChain Logo"
                width={40}
                height={40}
                className="object-contain"
              />
              <span className="text-white font-bold text-xl tracking-tight">
                YucaChain
              </span>
            </Link>

            <p className="text-white/80 leading-relaxed text-xs sm:text-sm max-w-xs">
              Building an integrated digital ecosystem that transforms cassava farming,
              processing, trade and export through technology.
            </p>

            <div className="flex items-center gap-1 mt-1">
              <Image
                src="/images/social-icons.png"
                alt="Social Media Icons"
                width={160}
                height={36}
                className="h-8 sm:h-9 w-auto"
              />
            </div>
          </div>


          <div>
            <h3 className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-white/70 mb-4 sm:mb-5">
              Quick Links
            </h3>
            <ul className="space-y-2.5 sm:space-y-3">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="group flex items-center gap-2 text-white/85 hover:text-white text-xs sm:text-sm cursor-pointer transition-all duration-200"
                  >
                    <span className="w-0 group-hover:w-3 h-px bg-white transition-all duration-300 rounded-full" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>


          <div>
            <h3 className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-white/70 mb-4 sm:mb-5">
              Products
            </h3>
            <ul className="space-y-2.5 sm:space-y-3">
              {products.map((product) => (
                <li key={product.label}>
                  <Link
                    href={product.href}
                    className="group flex items-center gap-2 text-white/85 hover:text-white text-xs sm:text-sm cursor-pointer transition-all duration-200"
                  >
                    <span className="w-0 group-hover:w-3 h-px bg-white transition-all duration-300 rounded-full" />
                    {product.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        <div className="pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-center sm:text-left text-xs sm:text-sm text-white/60">
          <p>© 2026 YucaChain Limited. All rights reserved.</p>

          <div className="flex items-center gap-4 sm:gap-6">
            <Link href="#" className="hover:text-white transition-colors duration-200">
              Privacy Policy
            </Link>
            <span className="w-px h-4 bg-white/30" />
            <Link href="#" className="hover:text-white transition-colors duration-200">
              Terms of Use
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}