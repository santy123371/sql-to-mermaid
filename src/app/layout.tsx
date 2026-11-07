import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://sqlschemer.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'SQL Schemer — Generador de Diagramas UML desde SQL',
    template: '%s | SQL Schemer',
  },
  description:
    'Convierte esquemas SQL (DDL, init.sql) en diagramas de clases UML completos y compatibles con Mermaid.js (.mmd) al instante. 100% gratis, open source y ejecutado localmente.',
  applicationName: 'SQL Schemer',
  keywords: [
    'SQL to Mermaid',
    'SQL a UML',
    'SQL Schemer',
    'diagrama de clases sql',
    'generador mermaid',
    'ingenieria inversa sql',
    'database to class diagram',
    'erd to uml',
    'export mmd',
    'mermaid.js',
    'nextjs',
  ],
  authors: [{ name: 'Santiago Diaz', url: 'https://github.com/santy123371' }],
  creator: 'Santiago Diaz',
  publisher: 'SQL Schemer',
  category: 'developer tools',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'SQL Schemer — Generador de Diagramas UML desde SQL',
    description:
      'Transforma esquemas SQL DDL en diagramas de clases Mermaid UML listos para documentar con atributos tipados, relaciones de claves foráneas y métodos CRUD.',
    url: siteUrl,
    siteName: 'SQL Schemer',
    locale: 'es_ES',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SQL Schemer — Generador de Diagramas UML desde SQL',
    description:
      'Convierte esquemas SQL en diagramas Mermaid UML al instante. 100% gratuito y de código abierto.',
    creator: '@santy123371',
  },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100">{children}</body>
    </html>
  );
}
