import { Analytics } from "@vercel/analytics/next"
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Earth Live Data – Real Time Global Statistics Dashboard",
    description:
        "Explore earth live data in real time. Watch global statistics including population, births, deaths, earthquakes and flights updated live.",
    keywords: [
        "earth live data",
        "real time world statistics",
        "live population counter",
        "global stats live",
        "earth dashboard",
        "live world data",
        "real time earth data",
        "world data live",
        "global live statistics",
        "earth statistics live"
    ],
    icons: {
        icon: "/favicon.png",
        shortcut: "/favicon.png",
        apple: "/favicon.png",
    },
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
        <Analytics />
        </body>
        </html>
    );
}