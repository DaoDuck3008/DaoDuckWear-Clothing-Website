import type { Metadata } from "next";
import {
  Inter,
  Cormorant_Garamond,
} from "next/font/google";
import "@/styles/global.css";
import { ToastContainer } from "react-toastify";
import AuthHydrator from "@/components/providers/authHydrator";
import ScrollToTop from "@/components/ui/ScrollToTop";
import GoogleAuthProvider from "@/components/providers/gooleAuthProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "vietnamese"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "DaoDuck Wear",
  description: "DaoDuck Wear - Clothing Shop",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${cormorant.variable} antialiased`}
      >
        <AuthHydrator>
          <GoogleAuthProvider>
            <div className="min-h-screen">{children}</div>
            <ToastContainer />
            <ScrollToTop />
          </GoogleAuthProvider>
        </AuthHydrator>
      </body>
    </html>
  );
}
