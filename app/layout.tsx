import type { Metadata, Viewport } from "next";
import { notoSansJP, plexMono, shipporiMincho } from "./fonts";
import "./globals.css";

const SITE_TITLE = "無駄遣い許可証 | 若者無駄遣い審査委員会";
const SITE_DESCRIPTION =
  "老後のあなた、ちょっと金持ちすぎません？ あなたが今、罪悪感なく無駄遣いしていい金額を勝手に審査します。";

export const metadata: Metadata = {
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    type: "website",
    locale: "ja_JP",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
};

export const viewport: Viewport = {
  themeColor: "#111111",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${notoSansJP.variable} ${shipporiMincho.variable} ${plexMono.variable}`}
    >
      <body className="antialiased">{children}</body>
    </html>
  );
}
