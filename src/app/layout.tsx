import type { Metadata } from "next";
import "./globals.css";
import { ThemeSync } from "@/components/ThemeSync";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "ISkool - Módulo Académico Gamificado",
  description: "Plataforma educativa interactiva alineada con la Nueva Escuela Mexicana",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50">
        <ThemeSync />
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}


