import type { Metadata } from "next";
import "./globals.css";
import { getCurrentUser } from "@/lib/auth";
import { Navbar } from "@/components/layout/Navbar";
import { DemoModeBanner } from "@/components/common";
import { ThemeProvider } from "@/components/theme";

export const metadata: Metadata = {
  title: "BHMS AI — Clinical & Learning Copilot",
  description: "Unified AI-powered Clinical Copilot for Homoeopathic Doctors and Learning Assistant for BHMS Students.",
};

const themeInitScript = `
(function() {
  try {
    var stored = localStorage.getItem('bhms-theme');
    var isDark = stored === 'dark' || (!stored || stored === 'system') && window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      document.documentElement.style.colorScheme = 'light';
    }
  } catch (e) {}
})();
`;

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-screen bg-slate-50 dark:bg-[#090D16] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-150">
        <ThemeProvider>
          <DemoModeBanner />
          <Navbar user={user} />
          <main className="flex-1 flex flex-col">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
