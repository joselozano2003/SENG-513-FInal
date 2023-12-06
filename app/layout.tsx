import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import AuthButton from "@/components/AuthButton";

import {Toaster} from 'react-hot-toast'

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Party Fun Medley",
    description: "Generated by create next app",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html>
            <body className="bg-background text-foreground">
                <main className="min-h-screen flex flex-col items-center">
                    <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
                        <div className="w-full max-w-4xl flex justify-between items-center p-3 text-sm">
                            <div>
                                <Link href="/">
                                    Home
                                </Link>
                            </div>
                            <AuthButton />
                        </div>
                    </nav>
                    {children}
                    <Toaster />
                </main>
            </body>
        </html>
    );
}
