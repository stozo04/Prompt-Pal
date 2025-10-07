// src/app/layout.tsx
import './globals.css'; // Ensure globals.css is imported
import Script from 'next/script';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-gray-50">
      <body className="h-full">
        {children}
        {/* THIS SCRIPT IS ESSENTIAL FOR THE BUTTON TO RENDER */}
        <Script src="https://accounts.google.com/gsi/client" strategy="beforeInteractive" />
      </body>
    </html>
  );
}