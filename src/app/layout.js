import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "AI Study Assistant",
  description: "A modern AI study assistant built with Next.js and Tailwind CSS.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-slate-50">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
