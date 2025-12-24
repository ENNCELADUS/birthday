// @ts-ignore
import { Metadata } from 'next'
import { Share_Tech_Mono } from 'next/font/google'
import "./globals.css";

const shareTechMono = Share_Tech_Mono({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-share-tech-mono',
})

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
      <body className={`${shareTechMono.variable} antialiased font-sans`}>
        {children}
      </body>
    </html>
  );
}
