"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { RouteGuard } from "@/components/RouteGuard";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark"> 
      <body className={`${inter.className} min-h-screen bg-transparent antialiased relative`}>
        
       {/* --- THE SCI-FI BACKGROUND LAYER --- */}
{/* We use z-[-1] to put it behind everything, and bg-background to set the base color */}
<div className="fixed inset-0 z-[-1] bg-background">
    <div className="absolute inset-0 bg-sci-fi-grid" />
    <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-primary/10 to-transparent" />
</div>

        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow container mx-auto px-4 py-8">
            {/* Removed the 'Card' wrapper here to let the dashboard breathe more */}
            <div className="w-full max-w-4xl mx-auto">
               <RouteGuard>{children}</RouteGuard>
            </div>
          </main>
          <Footer />
        </div>
        <Toaster />
      </body>
    </html>
  );
}