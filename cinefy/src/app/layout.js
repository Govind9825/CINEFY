import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SessionWrapper from "./components/SessionWrapper";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Cinefy",
  description:
    "Cinefy – A virtual theater where you can connect with friends and family to stream and enjoy content in perfect sync, no matter the distance.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/logo.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionWrapper>{children}</SessionWrapper>

        <Script id="feedlytics-widget-init" strategy="afterInteractive">
          {`
              window.feedlytics_widget = {
                username: "github_153532549"
              };
            `}
        </Script>
        <Script
          src="https://widget.feedlytics.in/feedlytics_widget.js"
          strategy="afterInteractive"

          
        />
      </body>
    </html>
  );
}
