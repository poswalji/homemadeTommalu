import type { Metadata } from "next";
import Script from "next/script";
import { Figtree} from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/context/app-context";
import { appConfig } from "@/config/app.config";
import { WhatsAppButton } from "@/components/ui/whatsapp-button";
import { QueryProvider } from "@/providers/query-provider";
import { Toaster } from "sonner";
import { AuthProvider } from "@/providers/auth-provider";

const figtree = Figtree({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
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
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  category: "Food & Grocery Delivery",
  themeColor: "#FF6B6B",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: appConfig.url,
    title: appConfig.name,
    description: appConfig.description,
    siteName: appConfig.name,
  },
  twitter: {
    card: "summary_large_image",
    title: appConfig.name,
    description: appConfig.description,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Organization JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: appConfig.name,
              url: appConfig.url,
              logo: `${appConfig.url}/logo.png`,
              contactPoint: {
                "@type": "ContactPoint",
                telephone: appConfig.contact.phone,
                contactType: "customer service",
                areaServed: "IN",
                availableLanguage: ["en"],
              },
              sameAs: [
                appConfig.social.facebook,
                appConfig.social.instagram,
                appConfig.social.twitter,
              ],
            }),
          }}
        />
        {/* WebSite JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: appConfig.name,
              url: appConfig.url,
              potentialAction: {
                "@type": "SearchAction",
                target: `${appConfig.url}/search?q={search_term_string}`,
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
        {/* Google Analytics */}
        {process.env.NEXT_PUBLIC_GA_ID ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga-init" strategy="afterInteractive">
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
      </head>
      <body
        className={`${figtree.className} antialiased`}
      >
        <QueryProvider>
          <AppProvider>
            <AuthProvider>{children}</AuthProvider>
          </AppProvider>
          <WhatsAppButton />
          <Toaster position="top-right" richColors />
        </QueryProvider>
      </body>
    </html>
  );
}
