import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";


export const metadata: Metadata = {
  title: "Routine - Academic Scheduler",
  description: "Intelligent class routine generation system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Epilogue:wght@400;700;900&amp;family=Space+Grotesk:wght@300;500;700&amp;family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,700;1,6..72,400&amp;family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap"
          rel="stylesheet" />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap"
          rel="stylesheet" />
      </head>
      <body className="bg-surface font-body text-on-surface">
        <Sidebar />
        <main>
          {children}
        </main>
      </body>
    </html >
  );
}
