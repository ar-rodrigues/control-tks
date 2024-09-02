import { Inter } from "next/font/google";
import "./globals.css";
import { metadata as siteMetadata } from "./metadata";
import { Providers } from './providers'


const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }) {
  return (
    <html lang="es-mx" className="scroll-smooth">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="theme-color" content="#000000" />
        <title>{siteMetadata.title.default}</title>
        <meta name="description" content={siteMetadata.description} />
        {/* Add other meta tags from siteMetadata as needed */}
      </head>
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
