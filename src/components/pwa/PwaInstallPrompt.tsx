"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Download, X, Share2, Sparkles, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export function PwaInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [isInstallable, setIsInstallable] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);
    const [isIos, setIsIos] = useState(false);
    const [showIosGuide, setShowIosGuide] = useState(false);
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        // 1. Register service worker for PWA
        if (typeof window !== "undefined" && "serviceWorker" in navigator) {
            navigator.serviceWorker
                .register("/sw.js")
                .then((reg) => {
                    console.log("[PWA] Service Worker registered with scope:", reg.scope);
                })
                .catch((err) => {
                    console.log("[PWA] Service Worker registration failed:", err);
                });
        }

        // 2. Check if already installed / running as standalone app
        const isStandalone =
            window.matchMedia("(display-mode: standalone)").matches ||
            (window.navigator as any).standalone === true ||
            document.referrer.includes("android-app://");

        if (isStandalone) {
            setIsInstalled(true);
            return;
        }

        // 3. Check if user already dismissed in this session
        const sessionDismiss = sessionStorage.getItem("pwa_install_dismissed");
        if (sessionDismiss === "true") {
            setDismissed(true);
        }

        // 4. Detect iOS Safari
        const userAgent = window.navigator.userAgent.toLowerCase();
        const isIosDevice = /iphone|ipad|ipod/.test(userAgent) && !(window as any).MSStream;
        const isSafari = /safari/.test(userAgent) && !/chrome|crios|fxios/.test(userAgent);
        if (isIosDevice && isSafari && !isStandalone) {
            setIsIos(true);
        }

        // 5. Android / Chrome beforeinstallprompt listener
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            setIsInstallable(true);
        };

        const handleAppInstalled = () => {
            setIsInstalled(true);
            setIsInstallable(false);
            setDeferredPrompt(null);
            console.log("[PWA] Tommalu App successfully installed!");
        };

        const handleCustomOpen = () => {
            setDismissed(false);
            if (isIos) {
                setShowIosGuide(true);
            } else if (deferredPrompt) {
                handleInstallClick();
            }
        };

        window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
        window.addEventListener("appinstalled", handleAppInstalled);
        window.addEventListener("open-pwa-install", handleCustomOpen);

        return () => {
            window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
            window.removeEventListener("appinstalled", handleAppInstalled);
            window.removeEventListener("open-pwa-install", handleCustomOpen);
        };
    }, [deferredPrompt, isIos]);

    const handleInstallClick = async () => {
        if (!deferredPrompt) {
            if (isIos) {
                setShowIosGuide(true);
            }
            return;
        }

        try {
            await deferredPrompt.prompt();
            const choiceResult = await deferredPrompt.userChoice;
            if (choiceResult.outcome === "accepted") {
                console.log("[PWA] User accepted the install prompt");
                setIsInstalled(true);
                setIsInstallable(false);
            } else {
                console.log("[PWA] User dismissed the install prompt");
            }
            setDeferredPrompt(null);
        } catch (err) {
            console.error("[PWA] Install prompt error:", err);
        }
    };

    const handleDismiss = () => {
        setDismissed(true);
        sessionStorage.setItem("pwa_install_dismissed", "true");
    };

    // If already installed or dismissed, do not render banner
    if (isInstalled || dismissed) return null;
    if (!isInstallable && !isIos) return null;

    return (
        <>
            {/* Floating Bottom PWA Install Banner - Safely contained inside viewport */}
            <div className="fixed bottom-4 left-3 right-3 sm:left-auto sm:right-4 sm:max-w-sm max-w-[calc(100vw-1.5rem)] z-50 overflow-hidden box-border animate-in fade-in slide-in-from-bottom-3 duration-300">
                <div className="bg-white/95 backdrop-blur-md rounded-2xl p-3.5 sm:p-4 shadow-2xl border-2 border-orange-500/20 ring-1 ring-black/5 flex items-center justify-between gap-2.5 sm:gap-3 box-border overflow-hidden">
                    {/* App Icon */}
                    <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-xl overflow-hidden shadow-md shrink-0 border border-orange-100 bg-orange-50 flex items-center justify-center">
                        <Image
                            src="/icons/icon-192x192.png"
                            alt="Tommalu Homemade"
                            width={48}
                            height={48}
                            className="object-cover"
                        />
                    </div>

                    {/* App Info */}
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                            <span className="font-black text-xs sm:text-sm text-stone-900 truncate">
                                Tommalu Homemade
                            </span>
                            <span className="text-[9px] font-extrabold bg-orange-100 text-orange-700 px-1.5 py-0.2 rounded-full uppercase tracking-wider shrink-0">
                                App
                            </span>
                        </div>
                        <p className="text-[10px] sm:text-[11px] text-stone-500 leading-tight truncate mt-0.5">
                            {isIos
                                ? "Add to Home Screen for fast ordering"
                                : "Install app for 1-tap ordering & live tracking"}
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-1.5 shrink-0">
                        {isIos ? (
                            <Button
                                size="sm"
                                onClick={() => setShowIosGuide(true)}
                                className="bg-orange-600 hover:bg-orange-700 text-white font-black text-xs h-9 px-3.5 rounded-xl shadow-md cursor-pointer flex items-center gap-1"
                            >
                                <Share2 className="w-3.5 h-3.5" />
                                Install
                            </Button>
                        ) : (
                            <Button
                                size="sm"
                                onClick={handleInstallClick}
                                className="bg-orange-600 hover:bg-orange-700 text-white font-black text-xs h-9 px-3.5 rounded-xl shadow-md cursor-pointer flex items-center gap-1"
                            >
                                <Download className="w-3.5 h-3.5" />
                                Install App
                            </Button>
                        )}

                        <button
                            type="button"
                            onClick={handleDismiss}
                            className="w-8 h-8 flex items-center justify-center rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
                            aria-label="Close"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* iOS Step-by-Step Instructions Modal */}
            {showIosGuide && (
                <div
                    className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-4 animate-in fade-in"
                    onClick={() => setShowIosGuide(false)}
                >
                    <div
                        className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl border border-stone-200 animate-in slide-in-from-bottom-10"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-10 h-10 rounded-xl overflow-hidden shadow-xs border bg-orange-50">
                                    <Image
                                        src="/icons/icon-192x192.png"
                                        alt="Tommalu"
                                        width={40}
                                        height={40}
                                        className="object-cover"
                                    />
                                </div>
                                <div>
                                    <h4 className="font-black text-stone-900 text-sm">Install on iPhone / iPad</h4>
                                    <p className="text-[11px] text-stone-400">2 simple steps to add Tommalu</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowIosGuide(false)}
                                className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 hover:text-stone-800"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="space-y-3 pt-2 text-xs text-stone-700">
                            <div className="flex items-start gap-3 p-2.5 rounded-xl bg-orange-50 border border-orange-100">
                                <span className="w-6 h-6 rounded-full bg-orange-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                                    1
                                </span>
                                <div>
                                    <p className="font-bold text-stone-900">Tap the Share Button</p>
                                    <p className="text-[11px] text-stone-500 mt-0.5">
                                        Safari browser ke bottom bar me <strong>Share (⎋)</strong> icon par tap karein.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 p-2.5 rounded-xl bg-orange-50 border border-orange-100">
                                <span className="w-6 h-6 rounded-full bg-orange-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                                    2
                                </span>
                                <div>
                                    <p className="font-bold text-stone-900">Select &quot;Add to Home Screen&quot;</p>
                                    <p className="text-[11px] text-stone-500 mt-0.5">
                                        Thoda niche scroll karke <strong>&apos;Add to Home Screen (⊞)&apos;</strong> par tap karein aur &apos;Add&apos; karein.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <Button
                            type="button"
                            onClick={() => setShowIosGuide(false)}
                            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs h-10 rounded-xl"
                        >
                            Got It!
                        </Button>
                    </div>
                </div>
            )}
        </>
    );
}
