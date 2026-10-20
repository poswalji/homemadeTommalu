import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { Figtree } from 'next/font/google';
import './globals.css';
import { AppProvider } from '@/context/app-context';
import { appConfig } from '@/config/app.config';
import { QueryProvider } from '@/providers/query-provider';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/providers/auth-provider';
import { GoogleAuthProvider } from '@/providers/google-auth-provider';
import { SocketProvider } from '@/context/socket-context';
import { HomemadeProvider } from '@/context/homemade-context';
import { Suspense } from 'react';
import { DeliveryFloatingButton } from '@/components/layout/delivery-floating-button';
import { TokenRewardAnimation } from '@/components/global/token-reward-animation';

const figtree = Figtree({
   subsets: ['latin'],
   weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
   metadataBase: new URL(appConfig.url),
   title: {
      default: appConfig.name,
      template: `%s | ${appConfig.name}`,
   },
   description: appConfig.description,
   keywords: appConfig.keywords,
   applicationName: appConfig.name,
   authors: [{ name: appConfig.name }],
   alternates: {
      canonical: appConfig.url,
   },
   manifest: '/manifest.json',
   appleWebApp: {
      capable: true,
      statusBarStyle: 'default',
      title: 'Tommalu',
   },
   icons: {
      icon: '/icons/icon-192x192.png',
      shortcut: '/logo.png',
      apple: '/icons/apple-touch-icon.png',
   },
   category: 'Food & Grocery Delivery',
   openGraph: {
      type: 'website',
      locale: 'en_IN',
      url: appConfig.url,
      title: appConfig.name,
      description: appConfig.description,
      siteName: appConfig.name,
      images: [
         {
            url: `${appConfig.url}/logo.png`,
            width: 1200,
            height: 630,
            alt: `${appConfig.name} - ${appConfig.description}`,
         },
      ],
   },
   twitter: {
      card: 'summary_large_image',
      title: appConfig.name,
      description: appConfig.description,
      images: [`${appConfig.url}/logo.png`],
   },
   robots: {
      index: true,
      follow: true,
      googleBot: {
         index: true,
         follow: true,
      },
   },
};

export const viewport: Viewport = {
   themeColor: '#EA580C',
   colorScheme: 'light',
   width: 'device-width',
   initialScale: 1,
   maximumScale: 5,
};

import { PushNotificationManager } from '@/components/global/push-notification-manager';
import { PwaInstallPrompt } from '@/components/pwa/PwaInstallPrompt';

export default function RootLayout({
   children,
}: Readonly<{
   children: React.ReactNode;
}>) {
   return (
      <html lang='en' className="light" style={{ colorScheme: 'light' }} suppressHydrationWarning>
         <head suppressHydrationWarning>
            <meta name="color-scheme" content="only light" />
            <meta name="supported-color-schemes" content="light" />
            <meta name="theme-color" content="#EA580C" />
            <link rel="manifest" href="/manifest.json" />
            <meta name="mobile-web-app-capable" content="yes" />
            <meta name="apple-mobile-web-app-capable" content="yes" />
            <meta name="apple-mobile-web-app-status-bar-style" content="default" />
            <meta name="apple-mobile-web-app-title" content="Tommalu" />
            <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
            <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />
            {/* Organization JSON-LD */}
            <script
               type='application/ld+json'
               suppressHydrationWarning
               dangerouslySetInnerHTML={{
                  __html: JSON.stringify({
                     '@context': 'https://schema.org',
                     '@type': 'Organization',
                     'name': appConfig.name,
                     'url': appConfig.url,
                     'logo': `${appConfig.url}/logo.png`,
                     'contactPoint': {
                        '@type': 'ContactPoint',
                        'telephone': appConfig.contact.phone,
                        'contactType': 'customer service',
                        'areaServed': 'IN',
                        'availableLanguage': ['en'],
                     },
                     'sameAs': [
                        appConfig.social.facebook,
                        appConfig.social.instagram,
                        appConfig.social.twitter,
                     ],
                  }),
               }}
            />
            {/* WebSite JSON-LD */}
            <script
               type='application/ld+json'
               suppressHydrationWarning
               dangerouslySetInnerHTML={{
                  __html: JSON.stringify({
                     '@context': 'https://schema.org',
                     '@type': 'WebSite',
                     'name': appConfig.name,
                     'url': appConfig.url,
                     'potentialAction': {
                        '@type': 'SearchAction',
                        'target': `${appConfig.url}/search?q={search_term_string}`,
                        'query-input': 'required name=search_term_string',
                     },
                  }),
               }}
            />
            {/* Google Analytics */}
            {process.env.NEXT_PUBLIC_GA_ID ? (
               <>
                  <Script
                     src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
                     strategy='afterInteractive'
                  />
                  <Script
                     id='ga-init'
                     strategy='afterInteractive'>
                     {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', {
                  page_path: window.location.pathname,
                });
              `}
                  </Script>
               </>
            ) : null}
            <Script
               src="https://checkout.razorpay.com/v1/checkout.js"
               strategy="lazyOnload"
            />
         </head>
         <body className={`${figtree.className} antialiased bg-white text-stone-900`} style={{ colorScheme: 'light' }} suppressHydrationWarning>
            <QueryProvider>
               <AppProvider>
                  <AuthProvider>
                     <GoogleAuthProvider>
                        <HomemadeProvider>
                           <SocketProvider>
                              <Suspense>{children}</Suspense>
                              <DeliveryFloatingButton />
                              <TokenRewardAnimation />
                              <PushNotificationManager />
                              <PwaInstallPrompt />
                           </SocketProvider>
                        </HomemadeProvider>
                     </GoogleAuthProvider>
                  </AuthProvider>
               </AppProvider>
               <Toaster
                  position='top-right'
                  richColors
               />
            </QueryProvider>
         </body>
      </html>
   );
}
