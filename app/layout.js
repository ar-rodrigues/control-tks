import { Inter } from "next/font/google";
import "./globals.css";
import { metadata as siteMetadata } from "./metadata";
import { Providers } from "./providers";
import { Box } from "@chakra-ui/react";
import Sidebar from "./components/Sidebar/Sidebar";
import { headers } from "next/headers";
import TabMenu from "./components/TabMenu/TabMenu";
const inter = Inter({ subsets: ["latin"] });

function isMobileDevice(userAgent) {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    userAgent
  );
}

export default async function RootLayout({ children }) {
  // Check side of the screen
  const headersList = headers();
  const userAgent = headersList.get("user-agent");
  const isMobile = isMobileDevice(userAgent);

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
          <Box display="flex" minH="100vh" overflowX="auto">
            {!isMobile && <Sidebar />}
            <Box flex="1" p="4" mb={10}>
              {children}
            </Box>
            {isMobile && <TabMenu />}
          </Box>
        </Providers>
      </body>
    </html>
  );
}
