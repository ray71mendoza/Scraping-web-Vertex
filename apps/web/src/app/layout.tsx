import type { Metadata } from "next";
import { QueryProvider } from "@/components/providers/query-provider";
import { AuthProvider } from "@/lib/auth-context";
import { Sidebar } from "@/components/shared/sidebar";
import "./globals.css";

export const metadata: Metadata = {
  title: "VERTEX Prospect — B2B Lead Enrichment & AI Scoring Platform",
  description:
    "Plataforma inteligente de prospección local, scoring de madurez digital y generación de propuestas comerciales automatizadas mediante IA.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark">
      <body className="min-h-screen bg-[#06060b] text-gray-100 antialiased flex">
        <AuthProvider>
          <QueryProvider>
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
              {children}
            </div>
          </QueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
