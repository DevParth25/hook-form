import type { Metadata } from "next";
import { Geist, Geist_Mono, Orbitron, Poppins } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
  weight: ["400", "700"],
});

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Form Builder with Custom Hooks",
  description: "A dynamic form builder with score and checkbox questions",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`
          ${geistSans.variable} 
          ${geistMono.variable} 
          ${orbitron.variable} 
          ${poppins.variable} 
          antialiased 
          bg-gradient-to-b 
          font-poppins 
          text-white 
          min-h-screen
        `}
      >
        {children}
      </body>
    </html>
  );
}
