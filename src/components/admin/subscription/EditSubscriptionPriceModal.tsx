import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EditSubscriptionPriceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (newPrice: number) => Promise<void>;
    currentPrice: number;
}

export function EditSubscriptionPriceModal({
    isOpen,
    onClose,
    onSave,
    currentPrice
}: EditSubscriptionPriceModalProps) {
    const [price, setPrice] = useState<number | string>("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setPrice(currentPrice);
        }
    }, [isOpen, currentPrice]);

    const handleSave = async () => {
        try {
            setLoading(true);
            await onSave(Number(price));
            onClose();
        } catch (error) {
            console.error("Failed to save price", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Update Subscription Price</DialogTitle>
                    <DialogDescription>
                        Update the subscription price. This change will be logged.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="price" className="text-right">
                            Price (₹)
                        </Label>
                        <Input
                            id="price"
                            type="number"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            className="col-span-3"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="secondary" onClick={onClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={loading}>
                        {loading ? "Saving..." : "Update Price"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
