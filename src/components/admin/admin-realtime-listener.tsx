"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getDatabase, ref, onChildAdded, query, orderByChild, limitToLast } from "firebase/database";
import { app } from "@/config/firebase.config";
import { toast } from "sonner";
import { BellRing, VolumeX, Volume2, PhoneCall, ExternalLink, X, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePushNotifications } from "@/hooks/use-push-notifications";
import { useRouter } from "next/navigation";

interface ActiveOrderAlert {
    orderNumber: string;
    customerName: string;
    amount: string | number;
    area?: string;
    mealType?: string;
    orderId?: string;
    isHomemade?: boolean;
    timestamp: string;
}

// Synthesizer ringtone fallback (Web Audio API)
class RingtoneSynthesizer {
    private ctx: AudioContext | null = null;
    private intervalId: any = null;
    private isPlaying = false;

    private getContext(): AudioContext | null {
        if (!this.ctx && typeof window !== "undefined") {
            const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioCtx) this.ctx = new AudioCtx();
        }
        if (this.ctx && this.ctx.state === "suspended") {
            this.ctx.resume().catch(() => {});
        }
        return this.ctx;
    }

    private playTone(freq: number, duration: number, delay = 0) {
        const ctx = this.getContext();
        if (!ctx) return;
        try {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "sine";
            osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);

            gain.gain.setValueAtTime(0, ctx.currentTime + delay);
            gain.gain.linearRampToValueAtTime(0.35, ctx.currentTime + delay + 0.05);
            gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + delay + duration - 0.05);
            gain.gain.linearRampToValueAtTime(0, ctx.currentTime + delay + duration);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(ctx.currentTime + delay);
            osc.stop(ctx.currentTime + delay + duration);
        } catch {
            // Audio context not ready
        }
    }

    // Classic telephone 2-tone ring pulse: "Tring-tring..."
    private playRingPulse() {
        this.playTone(853, 0.4, 0);
        this.playTone(960, 0.4, 0);
        this.playTone(853, 0.4, 0.5);
        this.playTone(960, 0.4, 0.5);
    }

    start() {
        if (this.isPlaying) return;
        this.getContext();
        this.isPlaying = true;
        this.playRingPulse();
        this.intervalId = setInterval(() => {
            if (this.isPlaying) this.playRingPulse();
        }, 2200);
    }

    stop() {
        this.isPlaying = false;
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }
}

const ringSynth = new RingtoneSynthesizer();

export function AdminRealtimeListener() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [isRinging, setIsRinging] = useState(false);
    const [activeOrder, setActiveOrder] = useState<ActiveOrderAlert | null>(null);
    const [hasInteracted, setHasInteracted] = useState(false);

    const audioRef = useRef<HTMLAudioElement | null>(null);
    const listenerReady = useRef(false);
    const ringTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Stop ringtone function
    const stopRing = useCallback(() => {
        setIsRinging(false);
        setActiveOrder(null);
        if (ringTimeoutRef.current) {
            clearTimeout(ringTimeoutRef.current);
            ringTimeoutRef.current = null;
        }
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
        ringSynth.stop();
    }, []);

    // Start ringtone function (plays in loop like a phone call)
    const startRing = useCallback((orderData: ActiveOrderAlert) => {
        setActiveOrder(orderData);
        setIsRinging(true);

        // Auto-stop ring after 60 seconds if no one answers
        if (ringTimeoutRef.current) clearTimeout(ringTimeoutRef.current);
        ringTimeoutRef.current = setTimeout(() => {
            stopRing();
        }, 60000);

        if (soundEnabled) {
            let audioPlayed = false;
            if (audioRef.current) {
                audioRef.current.currentTime = 0;
                audioRef.current.loop = true;
                const p = audioRef.current.play();
                if (p !== undefined) {
                    p.then(() => {
                        audioPlayed = true;
                    }).catch((err) => {
                        console.warn("HTMLAudio blocked, falling back to Web Audio synth:", err.message);
                        ringSynth.start();
                    });
                }
            } else {
                ringSynth.start();
            }
        }
    }, [soundEnabled, stopRing]);

    useEffect(() => {
        // Load sound preference from localStorage
        const savedPref = localStorage.getItem("tommalu_admin_order_sound");
        if (savedPref !== null) {
            setSoundEnabled(savedPref === "true");
        }

        // Initialize primary audio
        try {
            const audio = new Audio("/notification-ring.wav");
            audio.loop = true;
            audio.volume = 0.9;
            audioRef.current = audio;
        } catch {
            // Fallback handled by ringSynth
        }

        // Unlock audio on first user click anywhere on page
        const unlockAudio = () => {
            setHasInteracted(true);
            if (audioRef.current) {
                audioRef.current.play().then(() => {
                    audioRef.current?.pause();
                    if (audioRef.current) audioRef.current.currentTime = 0;
                }).catch(() => {});
            }
        };

        window.addEventListener("click", unlockAudio, { once: true });
        window.addEventListener("keydown", unlockAudio, { once: true });

        // Wait 2.5s before starting listener to prevent old database records on page load
        const timer = setTimeout(() => {
            listenerReady.current = true;
        }, 2500);

        const db = getDatabase(app);
        const recentOrdersRef = query(ref(db, "notifications/role:admin"), orderByChild("timestamp"), limitToLast(1));

        let pollingInterval: NodeJS.Timeout;

        const unsubscribe = onChildAdded(recentOrdersRef, (snapshot) => {
            const data = snapshot.val();
            if (!data) return;

            const isOrderEvent =
                data.event === "NEW_ORDER" ||
                data.event === "new_order" ||
                data.event === "order_created";

            if (isOrderEvent && listenerReady.current) {
                const payload = data.data || {};
                console.log("🔔 Real-time New Order received for Admin:", payload);

                const orderNumber = payload.orderNumber || payload.orderId?.toString().slice(-6).toUpperCase() || "NEW";
                const customerName = payload.customerName || "Customer";
                const amount = payload.amount || payload.finalPrice || "0";
                const area = payload.area || payload.deliveryAddress?.city || "Jaipur";
                const mealType = payload.mealType || (payload.isHomemade ? "Homemade" : "Restaurant");
                const orderId = payload.orderId ? payload.orderId.toString() : "";

                const alertData: ActiveOrderAlert = {
                    orderNumber,
                    customerName,
                    amount,
                    area,
                    mealType,
                    orderId,
                    isHomemade: !!payload.isHomemade || !!payload.mealType,
                    timestamp: new Date().toLocaleTimeString(),
                };

                // 1. Ring the phone-like sound
                startRing(alertData);

                // 2. Show prominent toast
                toast.success(
                    <div className="flex flex-col gap-1.5 p-1">
                        <div className="flex items-center gap-2">
                            <span className="inline-block w-3 h-3 rounded-full bg-red-600 animate-ping" />
                            <span className="font-extrabold text-base text-orange-600">
                                🔔 NAYA ORDER: #{orderNumber}
                            </span>
                        </div>
                        <span className="font-semibold text-gray-900">{customerName} • {area}</span>
                        <span className="text-sm font-bold text-green-700">₹{amount} • {mealType}</span>
                    </div>,
                    {
                        duration: 15000,
                        position: "top-center",
                    }
                );

                // 3. Invalidate React Query caches
                queryClient.invalidateQueries({ queryKey: ["adminHomemadeFoodOrders"] });
                queryClient.invalidateQueries({ queryKey: ["homemadeFoodDashboard"] });
                queryClient.invalidateQueries({ queryKey: ["adminOrders"] });
                queryClient.invalidateQueries({ queryKey: ["adminAnalytics"] });
            }
        }, (error) => {
            if (error.message.includes("permission_denied")) {
                console.log("Firebase RTDB permission denied. Falling back to HTTP polling.");
                pollingInterval = setInterval(() => {
                    queryClient.invalidateQueries({ queryKey: ["adminHomemadeFoodOrders"] });
                    queryClient.invalidateQueries({ queryKey: ["homemadeFoodDashboard"] });
                }, 15000);
            }
        });

        return () => {
            clearTimeout(timer);
            if (pollingInterval) clearInterval(pollingInterval);
            window.removeEventListener("click", unlockAudio);
            window.removeEventListener("keydown", unlockAudio);
            unsubscribe();
            stopRing();
        };
    }, [queryClient, startRing, stopRing]);

    const { requestPermission } = usePushNotifications();

    const toggleSound = async () => {
        const nextState = !soundEnabled;
        setSoundEnabled(nextState);
        localStorage.setItem("tommalu_admin_order_sound", String(nextState));

        if (nextState) {
            // Test chime to unlock audio context
            if (audioRef.current) {
                audioRef.current.currentTime = 0;
                audioRef.current.play().then(() => {
                    setTimeout(() => {
                        audioRef.current?.pause();
                        if (audioRef.current) audioRef.current.currentTime = 0;
                    }, 500);
                }).catch(() => {});
            }
            toast.success("Order notification ringtone enabled!");
            await requestPermission();
        } else {
            stopRing();
            toast.info("Order sound muted.");
        }
    };

    const handleViewOrder = () => {
        const isHomemade = activeOrder?.isHomemade;
        stopRing();
        if (isHomemade) {
            router.push("/admin/homemade-food");
        } else {
            router.push("/admin/orders");
        }
    };

    return (
        <>
            {/* 🚨 Full Incoming Order Ringing Banner / Modal (Phone Call Style Ring) */}
            {isRinging && activeOrder && (
                <div className="fixed inset-x-4 top-4 z-[9999] mx-auto max-w-lg animate-in fade-in slide-in-from-top-6 duration-300">
                    <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-orange-600 via-amber-600 to-red-600 p-1 shadow-2xl shadow-orange-500/40 ring-4 ring-orange-400/50">
                        <div className="rounded-[14px] bg-white p-5">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                                        <BellRing className="h-7 w-7 animate-bounce text-orange-600" />
                                        <span className="absolute -top-1 -right-1 flex h-4 w-4">
                                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
                                            <span className="relative inline-flex h-4 w-4 rounded-full bg-red-600" />
                                        </span>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-black tracking-wider uppercase px-2 py-0.5 rounded-full bg-red-100 text-red-700 animate-pulse">
                                                🚨 INCOMING ORDER
                                            </span>
                                            <span className="text-xs text-gray-500 font-medium">
                                                {activeOrder.timestamp}
                                            </span>
                                        </div>
                                        <h3 className="text-xl font-extrabold text-gray-900 mt-0.5">
                                            Order #{activeOrder.orderNumber}
                                        </h3>
                                    </div>
                                </div>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={stopRing}
                                    className="h-8 w-8 text-gray-400 hover:text-gray-700"
                                >
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>

                            <div className="mt-4 rounded-xl bg-orange-50/70 p-3 border border-orange-100 flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-gray-900">
                                        👤 {activeOrder.customerName}
                                    </p>
                                    <p className="text-xs text-gray-600 mt-0.5">
                                        📍 {activeOrder.area} {activeOrder.mealType ? `• ${activeOrder.mealType}` : ""}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-gray-500 font-medium">Total Amount</p>
                                    <p className="text-2xl font-black text-orange-600">
                                        ₹{activeOrder.amount}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-4 flex gap-3">
                                <Button
                                    variant="outline"
                                    onClick={stopRing}
                                    className="flex-1 border-gray-300 font-bold hover:bg-gray-100 text-gray-700"
                                >
                                    <VolumeX className="h-4 w-4 mr-2 text-red-500" />
                                    Ring Band Karein (Stop Ring)
                                </Button>
                                <Button
                                    onClick={handleViewOrder}
                                    className="flex-1 bg-gradient-to-r from-orange-600 to-amber-600 font-bold text-white shadow-md hover:from-orange-700 hover:to-amber-700"
                                >
                                    <ExternalLink className="h-4 w-4 mr-2" />
                                    Order Dekhein
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Quick Sound Control Pill in Admin Corner */}
            <div className="fixed bottom-4 right-4 z-40">
                <Button
                    size="sm"
                    variant={soundEnabled ? "default" : "secondary"}
                    onClick={toggleSound}
                    className={`shadow-lg transition-all rounded-full px-3.5 py-1.5 font-medium text-xs flex items-center gap-2 ${
                        soundEnabled
                            ? "bg-orange-600 hover:bg-orange-700 text-white shadow-orange-500/20"
                            : "bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700"
                    }`}
                    title={soundEnabled ? "Click to Mute Order Ring" : "Click to Enable Order Ring"}
                >
                    {soundEnabled ? (
                        <>
                            <Volume2 className="h-4 w-4 text-white animate-pulse" />
                            <span>Order Ring: ON</span>
                        </>
                    ) : (
                        <>
                            <VolumeX className="h-4 w-4 text-red-400" />
                            <span>Order Ring: MUTED</span>
                        </>
                    )}
                </Button>
            </div>
        </>
    );
}
