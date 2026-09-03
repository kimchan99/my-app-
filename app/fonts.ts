import { IBM_Plex_Mono, Noto_Sans_JP, Shippori_Mincho } from "next/font/google";

export const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  variable: "--font-sans-jp",
  display: "swap",
  preload: true,
});

export const shipporiMincho = Shippori_Mincho({
  subsets: ["latin"],
  weight: ["400", "700", "800"],
  variable: "--font-mincho",
  display: "swap",
  preload: true,
});

export const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
  preload: true,
});
