import { Toaster } from "@/components/ui/sonner";
import "../styles.css";
import React from "react";

export const metadata = {
    title: "TradeBot — Export Intelligence",
    description: "AI-powered export documentation, compliance, and delay resolution for Indian exporters.",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    rel="stylesheet"
                    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
                />
            </head>
            <body>
                {children}
                <Toaster />
            </body>
        </html>
    );
}
