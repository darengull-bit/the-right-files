import type {Metadata} from 'next';
import './globals.css';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { Toaster } from '@/components/ui/toaster';
import { ChatAssistant } from '@/components/dashboard/chat-assistant';

export const metadata: Metadata = {
  title: 'AgentPro | Official Master Build',
  description: 'Enterprise-grade SEO and visibility monitoring platform.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans antialiased">
        <FirebaseClientProvider>
          {children}
          <ChatAssistant />
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
