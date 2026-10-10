"use client";
import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getDatabase, ref, onChildAdded, query, orderByChild, limitToLast } from "firebase/database";
import { app } from "@/config/firebase.config"; // Ensure this uses initializeApp
import { toast } from "sonner";
import { BellRing, VolumeX, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePushNotifications } from "@/hooks/use-push-notifications";

export function AdminRealtimeListener() {
    const queryClient = useQueryClient();
    const [soundEnabled, setSoundEnabled] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const listenerReady = useRef(false);

    useEffect(() => {
        // Initialize audio
        audioRef.current = new Audio("/sounds/new-order.mp3");
        
        // Wait 3 seconds before starting to listen so we don't trigger old orders
        const timer = setTimeout(() => {
            listenerReady.current = true;
        }, 3000);

        const db = getDatabase(app);
        // Listen to only the latest 1 to prevent getting old history initially
        const recentOrdersRef = query(ref(db, "notifications/role:admin"), orderByChild("timestamp"), limitToLast(1));

        let pollingInterval: NodeJS.Timeout;

        const unsubscribe = onChildAdded(recentOrdersRef, (snapshot) => {
            const data = snapshot.val();
            
            if (data && data.event === "NEW_ORDER" && listenerReady.current) {
                // We got a genuinely new order!
                console.log("Real-time New Order:", data.data);
                
                // 1. Play sound
                if (soundEnabled && audioRef.current) {
                    audioRef.current.play().catch(e => console.log("Audio play blocked:", e));
                }

                // 2. Show Toast
                toast.success(
                    <div className="flex flex-col gap-1">
                        <span className="font-bold text-lg text-orange-600">🔴 NEW ORDER: {data.data.orderNumber}</span>
                        <span>{data.data.customerName} • {data.data.area}</span>
                        <span className="text-sm font-medium">₹{data.data.amount} • {data.data.mealType}</span>
                    </div>,
                    { duration: 8000, position: "top-center" }
                );

                // 3. Invalidate React Query to fetch the new data
                queryClient.invalidateQueries({ queryKey: ['adminHomemadeFoodOrders'] });
                queryClient.invalidateQueries({ queryKey: ['homemadeFoodDashboard'] });
            }
        }, (error) => {
            // If Firebase blocks us, fallback to Polling!
            if (error.message.includes('permission_denied')) {
                console.log("Firebase RTDB permission denied. Falling back to HTTP polling.");
                // Poll every 15 seconds as a fallback
                pollingInterval = setInterval(() => {
                    queryClient.invalidateQueries({ queryKey: ['adminHomemadeFoodOrders'] });
                    queryClient.invalidateQueries({ queryKey: ['homemadeFoodDashboard'] });
                }, 15000);
            }
        });

        return () => {
            clearTimeout(timer);
            if (pollingInterval) clearInterval(pollingInterval);
            unsubscribe();
        };
    }, [queryClient, soundEnabled]);

    const { requestPermission } = usePushNotifications();

    const requestSoundPermission = async () => {
        setSoundEnabled(true);
        if (audioRef.current) {
            audioRef.current.play().catch(() => {});
            audioRef.current.pause(); // Just play/pause to unlock audio context
            audioRef.current.currentTime = 0;
            toast.success("Order sounds enabled!");
        }
        
        // Also request Push Notification permissions for offline alerts
        await requestPermission();
    };

    if (soundEnabled) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50 bg-white p-4 rounded-lg shadow-xl border border-orange-200 animate-bounce">
            <div className="flex flex-col items-center gap-2">
                <BellRing className="w-6 h-6 text-orange-600" />
                <p className="text-sm font-medium">Enable New Order Sounds?</p>
                <div className="flex gap-2">
                    <Button size="sm" onClick={requestSoundPermission} className="bg-orange-600">
                        <Volume2 className="w-4 h-4 mr-2" /> Yes
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setSoundEnabled(true)}>
                        <VolumeX className="w-4 h-4 mr-2" /> No
                    </Button>
                </div>
            </div>
        </div>
    );
}
