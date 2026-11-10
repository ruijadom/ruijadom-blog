import type { Metadata } from "next";
import localFont from "next/font/local";
import { Lexend } from "next/font/google";
import "@/styles/globals.css";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import App from "@/components/app";
import { siteConfig } from "@/config/site";

const lexend = Lexend({ subsets: ["latin"], variable: "--font-lexend" });

const ogImage = {
  url: siteConfig.ogImage,
  width: 1200,
  height: 630,
  alt: "Architecture that scales. Software that endures. Rui Domingues, software engineer.",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    template: "%s | Ruijadom",
    default: "Ruijadom",
  },
  description:
    "Notes on software architecture, design systems, and the contracts that keep growing products stable while they evolve.",
  openGraph: {
    type: "website",
    siteName: "ruijadom",
    url: "/",
    images: [ogImage],
  },
  twitter: {
    card: "summary_large_image",
    images: [ogImage],
  },
};

const fontCode = localFont({
  src: "../assets/fonts/GeistMonoVF.woff2",
  variable: "--font-code",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={cn(
          "min-h-screen antialiased font-lexend bg-background",
          lexend.variable,
          fontCode.variable,
        )}
      >
        <App>{children}</App>
      </body>
    </html>
  );
}
