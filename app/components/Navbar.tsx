import Image from "next/image"

export default function Navbar() {
  return (
    <header className="navbar">

      {/* LOGO SECTION */}
      <div className="logo-container">

        <Image
          src="/images/logo.png"
          alt="YucaChain Logo"
          width={40}
          height={40}
        />

        <h2 className="logo-text">
          YucaChain
        </h2>

      </div>

      <nav>
        <ul className="nav-links">
          <li><a href="#">Marketplace</a></li>
          <li><a href="#">Our Story</a></li>
          <li><a href="#">Products</a></li>
          <li><a href="#">FAQ</a></li>
        </ul>
      </nav>

      <div className="nav-buttons">
        <button className="login-btn">
          Log In
        </button>

        <button className="join-btn">
          Join the Network
        </button>
      </div>

    </header>
  )
}