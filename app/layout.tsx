import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { WalletProvider } from "@/components/wallet/WalletProvider";
import { ThemeProvider } from "@/components/theme/ThemeProvider";

import { AppBackground } from "@/components/layout/AppBackground";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  metadataBase: new URL("https://www.chainvolio.xyz/"),
  title: {
    default: "ChainVolio - Verifiable Identity for Web3",
    template: "%s | ChainVolio"
  },
  description: "Build a work history that cannot be faked. Backed by on-chain proof and attestations.",
  applicationName: "ChainVolio",
  generator: "ChainVolio",
  keywords: ["Web3", "Solana", "Professional Identity", "On-chain Resume", "Verifiable Credentials", "Trust Infrastructure", "Career", "Blockchain"],
  authors: [{ name: "ChainVolio" }],
  creator: "ChainVolio",
  publisher: "ChainVolio",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon.png", sizes: "192x192", type: "image/png" },
    ],
    shortcut: "/favicon.png",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/manifest.json",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "ChainVolio - Verifiable Identity for Web3",
    description: "Build a work history that cannot be faked. Backed by on-chain proof and attestations.",
    url: "https://www.chainvolio.xyz/",
    siteName: "ChainVolio",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ChainVolio: Verifiable Identity for Web3",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ChainVolio - Verifiable Identity for Web3",
    description: "Build a work history that cannot be faked. Backed by on-chain proof and attestations.",
    images: ["/og-image.png"],
    creator: "@chainvolio",
    site: "@chainvolio",
  },
  verification: {
    google: "Crb2ONV_uh-J55SnH6dCcCzSrbNDVlEISKSq51FkKpg",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  width: 1280,
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Restore saved theme before React hydrates — prevents flash of wrong theme */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem('cv-theme');if(t==='light')document.documentElement.setAttribute('data-theme','light');}catch(e){}})();` }} />
        {/* Anti-FOUC and Bulletproof viewport scaler */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function(){
            // Inject anti-FOUC style dynamically so React hydration doesn't complain
            var style = document.createElement('style');
            style.id = 'cv-viewport-fouc';
            style.innerHTML = 'body { visibility: hidden !important; }';
            document.head.appendChild(style);

            var targetWidth = 1280;
            function getScale() {
              var sw = window.screen.width;
              return (sw > 0 && sw < targetWidth) ? (sw / targetWidth) : 1;
            }
            function getContent() {
              var scale = getScale();
              if (scale === 1) return 'width=device-width, initial-scale=1';
              return 'width=' + targetWidth + ', initial-scale=' + scale + ', minimum-scale=' + scale + ', maximum-scale=' + scale + ', user-scalable=no';
            }
            
            function updateMeta() {
              var expected = getContent();
              var meta = document.querySelector('meta[name="viewport"]');
              if (meta && meta.content !== expected) {
                meta.content = expected;
              } else if (!meta) {
                meta = document.createElement('meta');
                meta.name = 'viewport';
                meta.content = expected;
                document.head.appendChild(meta);
              }
            }

            // Run immediately
            updateMeta();

            // Observe for Next.js overriding it
            var observer = new MutationObserver(function(mutations) {
              mutations.forEach(function(mutation) {
                if (mutation.type === 'attributes' && mutation.target.name === 'viewport') {
                  if (mutation.target.content !== getContent()) updateMeta();
                }
                mutation.addedNodes.forEach(function(node) {
                  if (node.tagName === 'META' && node.name === 'viewport') {
                    if (node.content !== getContent()) updateMeta();
                  }
                });
              });
            });
            observer.observe(document.head || document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['content'] });

            // Reveal body safely after browser applies the scale
            function reveal() {
              var fouc = document.getElementById('cv-viewport-fouc');
              if (fouc) fouc.remove();
            }
            
            if (document.readyState === 'complete' || document.readyState === 'interactive') {
              setTimeout(reveal, 50); // slight delay to ensure browser layout recalc
            } else {
              document.addEventListener('DOMContentLoaded', function() {
                setTimeout(reveal, 50);
              });
            }

            // Update on resize
            window.addEventListener('resize', updateMeta);
            window.addEventListener('orientationchange', updateMeta);
          })();
        ` }} />
      </head>
      <body className={`${inter.variable} font-sans min-h-screen text-white relative`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "ChainVolio",
              "url": "https://www.chainvolio.xyz/",
              "logo": "https://www.chainvolio.xyz/logo.png",
              "description": "Build a work history that cannot be faked. Backed by on-chain proof and attestations.",
              "sameAs": [
                "https://x.com/chainvolio",
                "https://github.com/sandhywarhol/chainvolio"
              ]
            })
          }}
        />
        <AppBackground />
        <div className="relative z-[60]">
          <ThemeProvider>
            <WalletProvider>{children}</WalletProvider>
          </ThemeProvider>
        </div>
      </body>
    </html>
  );
}
