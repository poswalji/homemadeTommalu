"use client";

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { HomemadeSection } from "@/components/sections/homemade-section";

import { Suspense } from "react";

export default function HomemadePage() {
    return (
        <div className="min-h-screen bg-stone-50 flex flex-col font-sans w-full overflow-x-hidden">
            <Header />
            <main className="flex-grow pt-24 pb-12 px-3 sm:px-4 md:px-8 w-full overflow-x-hidden box-border">
                <Suspense fallback={<div className="p-8 text-center">Loading menu...</div>}>
                    <HomemadeSection />
                </Suspense>
            </main>
            <Footer />
        </div>
    );
}
