import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Deshi Basket | দেশি বাস্কেট",
  description: "দেশি ঐতিহ্য, আধুনিকতার ছোঁয়া। বাংলাদেশের বিশ্বস্ত অনলাইন শপ।"
};
export default function RootLayout({children}:{children:React.ReactNode}) {
  return <html lang="bn"><body>{children}</body></html>;
}
