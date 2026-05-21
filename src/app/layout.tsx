import type { Metadata } from "next";
import {
  Manrope,
  JetBrains_Mono,
  Fraunces,
  Instrument_Serif,
  Anton,
  DM_Sans,
} from "next/font/google";
import "./globals.css";
import { AgentConversationProvider } from "@/components/dashboard/AgentConversationProvider";

const manrope = Manrope({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const fraunces = Fraunces({
  variable: "--font-display-editorial",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-display-noir",
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
});

const anton = Anton({
  variable: "--font-display-poster",
  subsets: ["latin"],
  weight: ["400"],
});

const dmSans = DM_Sans({
  variable: "--font-sans-poster",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Paradise Beach",
  description: "Beach venue management — events, artists & tickets",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${jetbrainsMono.variable} ${fraunces.variable} ${instrumentSerif.variable} ${anton.variable} ${dmSans.variable}`}
    >
      <body>
        <AgentConversationProvider>{children}</AgentConversationProvider>
      </body>
    </html>
  );
}
