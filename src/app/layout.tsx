import type { Metadata } from "next";
import { Titillium_Web } from "next/font/google";
import "./globals.css";
 

const titilliumweb = Titillium_Web({ subsets: ["latin"], weight: ['300'] });

export const metadata: Metadata = {
  title: "Get Meaning within seconds",
  description: "A cool API Based app where you can get meanings from pagraphs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={titilliumweb.className}>
  
        {children}</body>
    </html>
  );
}
