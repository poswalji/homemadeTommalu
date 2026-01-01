
"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuthMe } from "@/hooks/api";
import { toast } from "sonner";
import { Calendar, Clock, MapPin, Phone, Loader2, User } from "lucide-react";
import { placeHomemadeOrder } from "@/services/homemadeService";
import { useRouter } from "next/navigation";

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

const AREAS = ["Nims", "Achrol", "Talamod"];

export function ConfirmOrderDialog({ isOpen, onClose, orderDetails }: ConfirmOrderDialogProps) {
    const router = useRouter();
    const { data: authData } = useAuthMe();
    const user = authData?.user;

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [step, setStep] = useState(1); // Keep step for potential future expansion
    const [name, setName] = useState(user?.name || "");
    const [address, setAddress] = useState(user?.addresses?.[0]?.street || "");
    const [phone, setPhone] = useState(user?.phone || "");
    const [area, setArea] = useState("");

    const handleConfirm = async () => {
        if (!name || !address || !phone || !area) {
            toast.error("Please fill in all delivery details");
            return;
        }

        try {
            setIsSubmitting(true);

            const payload = {
                customerName: name,
                mobileNumber: phone,
                area: area,
                customAddress: address,
                quantity: orderDetails.quantity,
                slot: orderDetails.slot // "Lunch" or "Dinner"
            };

            const res = await placeHomemadeOrder(payload);

            if (res.success) {
                toast.success("Order placed successfully!");
                onClose();
                // Redirect user to their orders page to check details as requested
                router.push("/customer/orders");
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
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Confirm Your {orderDetails.isSubscription ? "Subscription" : "Order"}</DialogTitle>
                    <DialogDescription>
                        Please review your details before confirming.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-2">
                    {/* Order Summary */}
                    <div className="bg-stone-50 p-4 rounded-lg space-y-2 text-sm border border-stone-100">
                        <div className="flex justify-between font-bold text-stone-800 text-base">
                            <span>{orderDetails.isSubscription ? orderDetails.planName : "Homemade Thali"} x {orderDetails.quantity}</span>
                            <span>₹{orderDetails.totalPrice}</span>
                        </div>
                        {!orderDetails.isSubscription && (
                            <div className="flex flex-wrap gap-4 pt-1">
                                <div className="flex items-center gap-1.5 text-stone-600 bg-white px-2 py-1 rounded border border-stone-200">
                                    <Calendar className="w-3.5 h-3.5" /> {orderDetails.date}
                                </div>
                                <div className="flex items-center gap-1.5 text-stone-600 bg-white px-2 py-1 rounded border border-stone-200">
                                    <Clock className="w-3.5 h-3.5" /> {orderDetails.slot}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                    <Input
                                        id="name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="pl-9"
                                        placeholder="Your Name"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                    <Input
                                        id="phone"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="pl-9"
                                        placeholder="Enter phone"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="area">Area / Campus</Label>
                            <Select value={area} onValueChange={setArea}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Area" />
                                </SelectTrigger>
                                <SelectContent>
                                    {AREAS.map((a) => (
                                        <SelectItem key={a} value={a}>{a}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="address">Full Address / Hostel Room</Label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                <Textarea
                                    id="address"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    className="pl-9 min-h-[80px]"
                                    placeholder="Room No, Hostel Name, or Street Address"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
                    <Button onClick={handleConfirm} className="bg-orange-600 hover:bg-orange-700 text-white" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing
                            </>
                        ) : (
                            orderDetails.isSubscription ? "Subscribe Now" : "Place Order"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
