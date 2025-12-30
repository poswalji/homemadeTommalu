
"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthMe } from "@/hooks/api";
import { toast } from "sonner";
import { Calendar, Clock, MapPin, Phone, Loader2 } from "lucide-react";
import { placeHomemadeOrder } from "@/services/homemadeService";

interface ConfirmOrderDialogProps {
    isOpen: boolean;
    onClose: () => void;
    orderDetails: {
        date: string;
        slot: string;
        quantity: number;
        totalPrice: number;
        items: string[];
        isSubscription?: boolean;
        planName?: string;
    };
}

export function ConfirmOrderDialog({ isOpen, onClose, orderDetails }: ConfirmOrderDialogProps) {
    const { data: authData } = useAuthMe();
    const user = authData?.user;

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [step, setStep] = useState(1);
    const [address, setAddress] = useState(user?.addresses?.[0]?.street || "");
    const [phone, setPhone] = useState(user?.phone || "");
    const [area, setArea] = useState("");

    const handleConfirm = async () => {
        if (!address || !phone || !area) {
            toast.error("Please fill in all delivery details");
            return;
        }

        try {
            setIsSubmitting(true);

            const payload = {
                customerName: user?.name || "Guest",
                mobileNumber: phone,
                area: area,
                customAddress: address,
                quantity: orderDetails.quantity,
                slot: orderDetails.slot // "Lunch" or "Dinner"
            };

            const res = await placeHomemadeOrder(payload);

            if (res.success) {
                toast.success("Order placed successfully! Track status in your profile.");
                onClose();
                setStep(1);
            }
        } catch (error: any) {
            console.error("Order failed", error);
            const msg = error.response?.data?.message || "Failed to place order";
            toast.error(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Confirm Your {orderDetails.isSubscription ? "Subscription" : "Order"}</DialogTitle>
                    <DialogDescription>
                        Please review your details before confirming.
                    </DialogDescription>
                </DialogHeader>

                {step === 1 && (
                    <div className="grid gap-4 py-4">
                        <div className="bg-stone-50 p-4 rounded-lg space-y-2 text-sm border">
                            <div className="flex justify-between font-semibold text-stone-700">
                                <span>{orderDetails.isSubscription ? orderDetails.planName : "Homemade Thali"} x {orderDetails.quantity}</span>
                                <span>₹{orderDetails.totalPrice}</span>
                            </div>
                            {!orderDetails.isSubscription && (
                                <>
                                    <div className="flex items-center gap-2 text-stone-500">
                                        <Calendar className="w-4 h-4" /> {orderDetails.date}
                                    </div>
                                    <div className="flex items-center gap-2 text-stone-500">
                                        <Clock className="w-4 h-4" /> {orderDetails.slot}
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Enter phone" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="area">Area / Colony</Label>
                            <Input id="area" value={area} onChange={(e) => setArea(e.target.value)} placeholder="e.g. Malviya Nagar" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="address">Full Address</Label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                <Input
                                    id="address"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    className="pl-9"
                                    placeholder="House No, Street, Landmark"
                                />
                            </div>
                        </div>
                    </div>
                )}

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
                    <Button onClick={handleConfirm} className="bg-orange-600 hover:bg-orange-700 text-white" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing
                            </>
                        ) : (
                            orderDetails.isSubscription ? "Subscribe Now" : "Place Pre-Order"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
