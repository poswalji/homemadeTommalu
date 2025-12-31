"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface ClearCartDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    isClearing: boolean;
}

export function ClearCartDialog({ isOpen, onClose, onConfirm, isClearing }: ClearCartDialogProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Start a new order?</DialogTitle>
                    <DialogDescription>
                        Your cart contains items from another store. Adding this item will clear existing items from your cart.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" disabled={isClearing} onClick={onClose}>Cancel</Button>
                    <Button
                        onClick={(e) => {
                            e.preventDefault();
                            onConfirm();
                        }}
                        variant="destructive"
                        disabled={isClearing}
                    >
                        {isClearing ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Clearing...
                            </>
                        ) : (
                            "Clear Cart & Add"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
