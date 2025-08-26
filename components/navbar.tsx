"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ShoppingBasketIcon as Collection, Building2 } from "lucide-react"
import Image from "next/image"
export function Navbar() {
  const pathname = usePathname()

  return (
    <nav className="navbar-custom">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="flex items-center space-x-4 text-primary font-bold text-xl">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
              <Image src="/logo.png" alt="Logo" width={48} height={48} />
            </div>
            <span className="text-primary">Stock Login Learning</span>
          </Link>

          <div className="hidden md:flex space-x-2">
            <Link
              href="/"
              className={`flex items-center space-x-3 px-6 py-3 rounded-xl transition-all duration-300 font-semibold ${
                pathname === "/"
                  ? /* Removed gradient, using solid primary background */ "bg-primary text-white shadow-lg"
                  : "text-muted-foreground hover:text-primary hover:bg-accent/20 hover:shadow-md"
              }`}
            >
              <Collection className="w-5 h-5" />
              <span>จัดการคอร์ส</span>
            </Link>
            <Link
              href="/center"
              className={`flex items-center space-x-3 px-6 py-3 rounded-xl transition-all duration-300 font-semibold ${
                pathname === "/center"
                  ? /* Removed gradient, using solid primary background */ "bg-primary text-white shadow-lg"
                  : "text-muted-foreground hover:text-primary hover:bg-accent/20 hover:shadow-md"
              }`}
            >
              <Building2 className="w-5 h-5" />
              <span>ศูนย์กระจาย</span>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button className="text-muted-foreground hover:text-primary">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
