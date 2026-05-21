import type { Metadata } from "next";
import {
  Manrope,
  JetBrains_Mono,
  Anton,
  DM_Sans,
  Plus_Jakarta_Sans,
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

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-sans-sunset",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
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
      className={`${manrope.variable} ${jetbrainsMono.variable} ${anton.variable} ${dmSans.variable} ${plusJakarta.variable}`}
    >
      <body>
        <AgentConversationProvider>{children}</AgentConversationProvider>
      </body>
    </html>
  );
}
