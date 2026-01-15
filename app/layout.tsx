import Navbar from "@/components/Navbar";
import { ThemeProvider } from "@/context/ThemeContext";
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body 
        className="bg-background text-foreground antialiased min-h-screen selection:bg-primary-btn/30 selection:text-primary-btn transition-colors duration-300" 
        suppressHydrationWarning
      >
        <ThemeProvider>
          {/* The Navbar is placed inside a wrapper to ensure it stays 
              at the top and maintains the glass effect against the body background 
          */}
          <div className="relative flex min-h-screen flex-col">
            <Navbar />
            
            <main className="relative flex-1 mx-auto w-full px-4 md:px-6 lg:px-8 py-10">
              {/* Adding a subtle fade-in animation for children 
                  makes the theme transition feel smoother
              */}
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-700">
                {children}
              </div>
            </main>

            {/* Optional: Add a subtle glow/blob in the background for extra "pop" */}
            <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
              <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-primary-btn/5 blur-[120px]" />
              <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] rounded-full bg-primary-btn/5 blur-[120px]" />
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}