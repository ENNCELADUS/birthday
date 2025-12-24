// @ts-ignore
import { Metadata } from 'next'
import "./globals.css";

export const metadata: Metadata = {
  title: "Project M.O.M.",
  description: "The Origin Kernel",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
