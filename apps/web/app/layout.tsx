import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: 'ClínicaPsi — Gestão de Clínica de Psicologia',
  description: 'Sistema de gestão para clínica de psicologia. Agenda inteligente, prontuário eletrônico criptografado, financeiro e teleconsulta.',
  keywords: ['psicologia', 'clínica', 'prontuário', 'agenda', 'gestão', 'LGPD'],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="scroll-smooth">
      <body className="min-h-screen bg-background font-sans antialiased">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:p-4 focus:bg-primary focus:text-white">
          Pular para o conteúdo principal
        </a>
        <div id="main-content">
          {children}
        </div>
        <Toaster richColors position="top-right" closeButton />
      </body>
    </html>
  );
}
