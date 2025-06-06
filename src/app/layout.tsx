import "./globals.css";
import { Inter } from "next/font/google";
import { UserProvider } from "@/context/UserContext";

import Header from "@/components/Header";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Buy Nothing Store",
  description: "We sell literally nothing",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        suppressHydrationWarning={true}
        className={`${inter.className} bg-black text-white`}
      >
        <UserProvider>
          <Header />
          <main>{children}</main>
        </UserProvider>
      </body>
    </html>
  );
}
