import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface AdminPauseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (date: string, reason: string) => Promise<void>;
}

export function AdminPauseModal({
    isOpen,
    onClose,
    onSave
}: AdminPauseModalProps) {
    const [date, setDate] = useState<string>("");
    const [reason, setReason] = useState<string>("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setDate("");
            setReason("");
        }
    }, [isOpen]);

    const handleSave = async () => {
        if (!date) return;
        try {
            setLoading(true);
            await onSave(date, reason);
            onClose();
        } catch (error) {
            console.error("Failed to add pause", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add Manual Pause Day</DialogTitle>
                    <DialogDescription>
                        Manually pause the subscription for a specific date. This will automatically extend the subscription end date by 1 day.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="pause-date">Pause Date <span className="text-red-500">*</span></Label>
                        <Input
                            id="pause-date"
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="pause-reason">Reason (Optional)</Label>
                        <Textarea
                            id="pause-reason"
                            placeholder="e.g., Customer requested on call"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            rows={3}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="secondary" onClick={onClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={loading || !date}>
                        {loading ? "Adding..." : "Add Pause"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
