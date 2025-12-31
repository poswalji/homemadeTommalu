import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export default function LegalLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Header />
            <main className="flex-1 container mx-auto px-4 py-8 md:py-12 max-w-4xl">
                <div className="bg-white p-6 md:p-10 rounded-2xl shadow-sm border border-gray-100">
                    {children}
                </div>
            </main>
            <Footer />
        </div>
    );
}
