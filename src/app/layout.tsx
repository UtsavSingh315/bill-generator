import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "Bill Generator - Create Professional Invoices",
  description:
    "Generate and manage invoices with customizable parameters. Client-side bill generation with flexible configuration options.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
