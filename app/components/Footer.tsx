import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-[#14B8C4] text-white">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">

          {/* Left Section */}
          <div>
            <h2 className="text-3xl font-bold mb-6">
              Yuca<span className="font-light">Chain</span>
            </h2>

            <p className="text-white/90 leading-8 mb-8">
              We are building an integrated digital ecosystem
              transforming cassava farming, processing,
              trade and export through technology.
            </p>

            {/* Social Icons Image */}
            <Image
              src="/images/social-icons.png"
              alt="Social Media Icons"
              width={180}
              height={40}
              className="h-10 w-auto"
            />
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-2xl font-semibold mb-6">
              Quick Links
            </h3>

            <ul className="space-y-4 text-white/90">
              <li>About Us</li>
              <li>Our Story</li>
              <li>Join Us</li>
              <li>News</li>
              <li>Contact</li>
            </ul>
          </div>

          {/* Products */}
          <div>
            <h3 className="text-2xl font-semibold mb-6">
              Products
            </h3>

            <ul className="space-y-4 text-white/90">
              <li>YucaChain App</li>
              <li>YucaVault</li>
              <li>YucaHub</li>
              <li>Marketplace</li>
              <li>Supply Chain</li>
            </ul>
          </div>

        </div>

        {/* Bottom Section */}
        <div className="border-t border-white/30 mt-12 pt-6 flex flex-col md:flex-row justify-between items-center">

          <p className="text-sm text-white/80">
            © 2026 YucaChain Limited. All rights reserved.
          </p>

          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="hover:underline">
              Privacy Policy
            </a>

            <a href="#" className="hover:underline">
              Terms of Use
            </a>
          </div>

        </div>
      </div>
    </footer>
  );
}