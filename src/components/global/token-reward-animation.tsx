"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthMe } from "@/hooks/api";
import apiClient from "@/lib/axios";

const COIN_COUNT = 18;

function Coin({ delay, duration, startX }: { delay: number; duration: number; startX: number }) {
    return (
        <motion.div
            className="absolute text-3xl select-none pointer-events-none"
            initial={{ y: -60, x: startX, opacity: 0, scale: 0.5, rotate: -30 }}
            animate={{
                y: ["-60px", "110vh"],
                x: [startX, startX + (Math.random() * 120 - 60)],
                opacity: [0, 1, 1, 0],
                scale: [0.5, 1.2, 1, 0.8],
                rotate: [0, 360, 720],
            }}
            transition={{
                delay,
                duration,
                ease: "easeIn",
                times: [0, 0.1, 0.8, 1],
            }}
        >
            🪙
        </motion.div>
    );
}

export function TokenRewardAnimation() {
    const { data: authData, refetch } = useAuthMe();
    const queryClient = useQueryClient();
    const user = authData?.user;
    const [visible, setVisible] = useState(false);
    const [rewardAmount, setRewardAmount] = useState(0);
    const [coins, setCoins] = useState<{ delay: number; duration: number; startX: number }[]>([]);

    const clearReward = useCallback(async () => {
        try {
            await apiClient.post("/customer/clear-token-rewards");
            await refetch();
            queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
        } catch (e) {
            console.error("Failed to clear token reward:", e);
        }
    }, [refetch, queryClient]);

    useEffect(() => {
        const unseen = user?.unseenTokenRewards ?? 0;
        if (unseen > 0 && !visible) {
            setRewardAmount(unseen);
            setVisible(true);
            // Generate coin positions
            setCoins(
                Array.from({ length: COIN_COUNT }, (_, i) => ({
                    delay: i * 0.08,
                    duration: 1.6 + Math.random() * 0.8,
                    startX: Math.random() * (typeof window !== "undefined" ? window.innerWidth : 400),
                }))
            );
        }
    }, [user?.unseenTokenRewards, visible]);

    const handleDismiss = () => {
        setVisible(false);
        clearReward();
    };

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    key="token-overlay"
                    className="fixed inset-0 z-[9999] flex items-center justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={handleDismiss}
                >
                    {/* Dark overlay */}
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

                    {/* Falling coins */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        {coins.map((c, i) => (
                            <Coin key={i} delay={c.delay} duration={c.duration} startX={c.startX} />
                        ))}
                    </div>

                    {/* Main card */}
                    <motion.div
                        className="relative z-10 flex flex-col items-center gap-5 bg-gradient-to-b from-amber-900 to-yellow-900 border-2 border-yellow-400/60 rounded-3xl p-8 sm:p-12 mx-4 shadow-2xl shadow-yellow-900/50 max-w-sm w-full text-center"
                        initial={{ scale: 0.5, y: 60, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        exit={{ scale: 0.8, y: 40, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Glowing coin icon */}
                        <motion.div
                            className="text-7xl"
                            animate={{
                                scale: [1, 1.15, 1],
                                rotate: [0, 8, -8, 0],
                            }}
                            transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
                        >
                            🏆
                        </motion.div>

                        {/* Title */}
                        <div>
                            <p className="text-yellow-300 text-sm font-bold uppercase tracking-widest mb-1">
                                Order Delivered!
                            </p>
                            <h2 className="text-white text-3xl sm:text-4xl font-black leading-tight">
                                You Earned
                            </h2>
                        </div>

                        {/* Token count */}
                        <motion.div
                            className="flex items-center gap-3 bg-yellow-400/20 border border-yellow-400/40 rounded-2xl px-6 py-3"
                            initial={{ scale: 0.7 }}
                            animate={{ scale: [0.7, 1.1, 1] }}
                            transition={{ delay: 0.4, duration: 0.5 }}
                        >
                            <span className="text-3xl">🪙</span>
                            <span className="text-5xl font-black text-yellow-300">+{rewardAmount}</span>
                            <div className="text-left">
                                <p className="text-yellow-200 font-black text-sm leading-none">Tommalu</p>
                                <p className="text-yellow-300/70 font-bold text-xs leading-none">Tokens</p>
                            </div>
                        </motion.div>

                        {/* Subtitle */}
                        <p className="text-yellow-200/80 text-sm font-medium">
                            10 tokens = ₹1 off on your next order! 🎉
                        </p>

                        {/* Dismiss button */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={handleDismiss}
                            className="mt-2 w-full bg-yellow-400 hover:bg-yellow-300 text-yellow-900 font-black text-base py-3.5 rounded-2xl shadow-lg shadow-yellow-400/30 transition-colors"
                        >
                            Awesome! 🎊
                        </motion.button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
