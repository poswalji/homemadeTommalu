import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";

interface EditSubscriptionPeriodModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (startDate: string, endDate: string) => Promise<void>;
    currentStartDate: string | Date;
    currentEndDate: string | Date;
}

export function EditSubscriptionPeriodModal({
    isOpen,
    onClose,
    onSave,
    currentStartDate,
    currentEndDate
}: EditSubscriptionPeriodModalProps) {
    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setStartDate(currentStartDate ? format(new Date(currentStartDate), "yyyy-MM-dd") : "");
            setEndDate(currentEndDate ? format(new Date(currentEndDate), "yyyy-MM-dd") : "");
        }
    }, [isOpen, currentStartDate, currentEndDate]);

    const handleSave = async () => {
        try {
            setLoading(true);
            await onSave(startDate, endDate);
            onClose();
        } catch (error) {
            console.error("Failed to save period", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Update Subscription Validity</DialogTitle>
                    <DialogDescription>
                        Extend or reduce the subscription duration. Changes apply to future deliveries.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="start-date" className="text-right">
                            Start Date
                        </Label>
                        <Input
                            id="start-date"
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="end-date" className="text-right">
                            End Date
                        </Label>
                        <Input
                            id="end-date"
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="col-span-3"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="secondary" onClick={onClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={loading}>
                        {loading ? "Saving..." : "Save Changes"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
