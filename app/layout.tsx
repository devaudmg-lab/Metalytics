import Navbar from "@/components/Navbar";
import { ThemeProvider } from "@/context/ThemeContext";
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-background text-foreground antialiased min-h-screen transition-colors duration-300">
        <ThemeProvider>
          <Navbar />
          <main className="mx-auto lg:px-8 py-6">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}