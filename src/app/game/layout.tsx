import type { Metadata } from "next";
import { ReactNode } from "react";

const description =
  "Take your product from prototype to production. Fix bugs, invest in automation, and put the development cycle into play.";

const ogImage = {
  url: "/images/og-game.png",
  width: 1200,
  height: 630,
  alt: "Dev Space: A Developer's Odyssey. Good code gets you started. Good systems keep you going.",
};

export const metadata: Metadata = {
  title: "Dev Space",
  description,
  openGraph: {
    type: "website",
    title: "Dev Space: A Developer's Odyssey",
    description,
    url: "/game",
    images: [ogImage],
  },
  twitter: {
    card: "summary_large_image",
    title: "Dev Space: A Developer's Odyssey",
    description,
    images: [ogImage],
  },
};

export default function GameLayout({ children }: { children: ReactNode }) {
  return children;
}
