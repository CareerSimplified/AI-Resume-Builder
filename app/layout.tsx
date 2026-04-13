import { Inter, Outfit } from "next/font/google"
import type { Metadata } from "next"
import "./globals.css"
import { ThemeProvider } from "@/hooks/useTheme"
import { AuthProvider } from "@/context/AuthContext"
import { Toaster } from 'react-hot-toast'

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
})


export const metadata: Metadata = {
  title: "AI Resume Builder - Intelligent Resume Analysis & Matching",
  description: "Transform your resume with AI-powered insights. Get matched with ideal job opportunities, receive actionable feedback, and stand out to recruiters.",
  keywords: "resume analysis, AI scoring, job matching, career optimization, resume improvement",
  authors: [{ name: "AI Resume Builder" }],
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
    shortcut: "/icon.svg",
  },
  openGraph: {
    title: "AI Resume Builder - Intelligent Resume Analysis",
    description: "AI-powered resume analysis and job matching platform",
    type: "website",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head suppressHydrationWarning>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/icon.svg" />
      </head>
      <body suppressHydrationWarning className={`${inter.variable} ${outfit.variable} antialiased font-sans`}>

        <AuthProvider>
          <ThemeProvider>
            <div className="min-h-screen flex flex-col">
              {children}
            </div>
            <Toaster 
              position="top-right"
              toastOptions={{
                className: 'dark:bg-gray-800 dark:text-white',
              }}
            />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
