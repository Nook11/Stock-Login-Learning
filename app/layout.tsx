import type React from "react"
import type { Metadata } from "next"
import { IBM_Plex_Sans_Thai, Sarabun } from "next/font/google"
import { DM_Sans } from "next/font/google"
import "./globals.css"

const ibmPlexSansThai = IBM_Plex_Sans_Thai({
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600"],
  variable: "--font-ibm-plex-sans-thai",
  display: "swap",
})

const sarabun = Sarabun({
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sarabun",
  display: "swap",
})

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-dm-sans",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Store Login Learning - ระบบจัดการคลังสินค้า",
  description: "ระบบจัดการคลังสินค้าและศูนย์กระจาย",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="th" className={`${ibmPlexSansThai.variable} ${sarabun.variable} ${dmSans.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
