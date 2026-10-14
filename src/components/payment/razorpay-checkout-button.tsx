"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { paymentApi, VerifyPaymentResponse } from "@/services/api/payments.api";
import { loadRazorpayScript, RazorpaySuccessResponse } from "@/utils/razorpay";

interface RazorpayCheckoutButtonProps {
  amountInRupees: number;
  name?: string;
  description?: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  orderId?: string; // Optional MongoDB order ID
  onSuccess?: (result: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
    verificationResult: VerifyPaymentResponse;
  }) => void;
  onError?: (error: any) => void;
  onDismiss?: () => void;
  buttonText?: string;
  className?: string;
  disabled?: boolean;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  children?: React.ReactNode;
}

export function RazorpayCheckoutButton({
  amountInRupees,
  name = "Tommalu",
  description = "Food Order Payment",
  prefill,
  orderId,
  onSuccess,
  onError,
  onDismiss,
  buttonText,
  className,
  disabled = false,
  variant = "default",
  children,
}: RazorpayCheckoutButtonProps) {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    // Validate amount (minimum ₹1 = 100 paise)
    const amountInPaise = Math.round(amountInRupees * 100);
    if (amountInPaise < 100) {
      toast.error("Payment amount must be at least ₹1.00");
      return;
    }

    const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    if (!razorpayKey) {
      toast.error("Razorpay Key is not configured. Please check your environment variables.");
      return;
    }

    setLoading(true);

    try {
      // 1. Ensure checkout script is loaded
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded || typeof (window as any).Razorpay === "undefined") {
        toast.error("Failed to load Razorpay payment SDK. Please check your internet connection.");
        setLoading(false);
        return;
      }

      // 2. STEP 1: Backend - Create Order
      const rzpOrder = await paymentApi.createRazorpayOrder({
        amount: amountInPaise,
        currency: "INR",
        receipt: `rcpt_${Date.now()}`,
      });

      if (!rzpOrder || !rzpOrder.order_id) {
        throw new Error(rzpOrder?.message || "Failed to initiate payment order");
      }

      // 3. STEP 2: Configure Razorpay modal
      const options = {
        key: razorpayKey,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency || "INR",
        name: name,
        description: description,
        image: "/logo.png",
        order_id: rzpOrder.order_id,
        prefill: {
          name: prefill?.name || "",
          email: prefill?.email || "",
          contact: prefill?.contact || "",
        },
        theme: {
          color: "#ea580c", // Tommalu primary orange
        },
        config: {
          display: {
            blocks: {
              upi: {
                name: "Pay via UPI (GPay / PhonePe / Paytm / QR)",
                instruments: [
                  {
                    method: "upi",
                  },
                ],
              },
              other: {
                name: "Cards, NetBanking & Wallets",
                instruments: [
                  {
                    method: "card",
                  },
                  {
                    method: "netbanking",
                  },
                  {
                    method: "wallet",
                  },
                ],
              },
            },
            sequence: ["block.upi", "block.other"],
            preferences: {
              show_default_blocks: true,
            },
          },
        },
        handler: async function (response: RazorpaySuccessResponse) {
          const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = response;
          toast.loading("Verifying payment...", { id: "razorpay-verification" });

          try {
            // 4. STEP 3: Backend - Verify Signature
            const verifyResult = await paymentApi.verifyRazorpayPayment({
              razorpay_order_id,
              razorpay_payment_id,
              razorpay_signature,
              orderId,
            });

            if (verifyResult.success) {
              toast.success("Payment successful and verified!", { id: "razorpay-verification" });
              if (onSuccess) {
                onSuccess({
                  razorpay_payment_id,
                  razorpay_order_id,
                  razorpay_signature,
                  verificationResult: verifyResult,
                });
              }
            } else {
              toast.error(verifyResult.message || "Payment verification failed", { id: "razorpay-verification" });
              if (onError) onError(verifyResult);
            }
          } catch (err: any) {
            console.error("Signature verification failed:", err);
            const msg = err.response?.data?.message || "Payment verification failed. Please contact support.";
            toast.error(msg, { id: "razorpay-verification" });
            if (onError) onError(err);
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: function () {
            toast.info("Payment cancelled");
            setLoading(false);
            if (onDismiss) onDismiss();
          },
        },
      };

      const razorpayInstance = new (window as any).Razorpay(options);

      // Handle payment.failed event
      razorpayInstance.on("payment.failed", function (failResponse: any) {
        console.error("Payment failed event:", failResponse.error);
        const errMsg =
          failResponse.error?.description ||
          failResponse.error?.reason ||
          "Payment processing failed";
        toast.error(`Payment failed: ${errMsg}`);
        setLoading(false);
        if (onError) onError(failResponse.error);
      });

      razorpayInstance.open();
    } catch (err: any) {
      console.error("Checkout initiation error:", err);
      const errMsg =
        err.response?.data?.message || err.message || "Could not open Razorpay checkout";
      toast.error(errMsg);
      setLoading(false);
      if (onError) onError(err);
    }
  };

  return (
    <Button
      onClick={handlePayment}
      disabled={disabled || loading}
      variant={variant}
      className={className}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Processing...
        </>
      ) : children ? (
        children
      ) : (
        <>
          <CreditCard className="w-4 h-4 mr-2" />
          {buttonText || `Pay ₹${amountInRupees.toFixed(2)} with Razorpay`}
        </>
      )}
    </Button>
  );
}
