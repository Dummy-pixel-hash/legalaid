import type { Metadata } from "next";
import {
  IBM_Plex_Sans,
  IBM_Plex_Sans_Devanagari,
  Source_Serif_4,
  Noto_Serif_Devanagari,
} from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/lib/i18n/provider";
import { CaseProvider } from "@/lib/store/case-store";
import { AppHeader } from "@/components/shell/AppHeader";
import { AppFooter } from "@/components/shell/AppFooter";

const plexSans = IBM_Plex_Sans({
  variable: "--font-ui",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const plexDevanagari = IBM_Plex_Sans_Devanagari({
  variable: "--font-ui-hi",
  subsets: ["devanagari"],
  weight: ["400", "500", "600"],
});

const sourceSerif = Source_Serif_4({
  variable: "--font-doc",
  subsets: ["latin"],
  weight: ["400", "600"],
});

const notoSerifDevanagari = Noto_Serif_Devanagari({
  variable: "--font-doc-hi",
  subsets: ["devanagari"],
  weight: ["400", "600"],
});

export const metadata: Metadata = {
  title: "LegalAId — Understand your rights. Know what to do next.",
  description:
    "LegalAId helps you understand a legal problem in plain language — your rights, the applicable law, the evidence to keep, the next steps, and a document you can use. General legal information, not legal advice.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${plexSans.variable} ${plexDevanagari.variable} ${sourceSerif.variable} ${notoSerifDevanagari.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <LanguageProvider>
          <CaseProvider>
            <AppHeader />
            <main className="flex-1">{children}</main>
            <AppFooter />
          </CaseProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
