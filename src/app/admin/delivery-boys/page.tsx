'use client';

import { useState, useEffect } from 'react';
import apiClient, { handleApiError } from '@/lib/axios';
import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeader,
   TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert } from '@/components/ui/alert';
import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
   DialogTrigger,
} from '@/components/ui/dialog';
import { PlusCircle, Power, PowerOff, Edit } from 'lucide-react';

interface DeliveryBoy {
    _id: string;
    name: string;
    phone: string;
    isActive: boolean;
    createdAt: string;
}

export default function DeliveryBoysPage() {
    const [deliveryBoys, setDeliveryBoys] = useState<DeliveryBoy[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    
    // Form state
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    const fetchDeliveryBoys = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await apiClient.get('/delivery-boys');
            setDeliveryBoys(response.data.data || []);
        } catch (err) {
            setError(handleApiError(err));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDeliveryBoys();
    }, []);

    const resetForm = () => {
        setName('');
        setPhone('');
        setPassword('');
        setFormError(null);
        setEditingId(null);
    };

    const handleAddSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);
        setIsSubmitting(true);
        try {
            await apiClient.post('/delivery-boys', { name, phone, password });
            setIsAddModalOpen(false);
            resetForm();
            fetchDeliveryBoys();
        } catch (err) {
            setFormError(handleApiError(err));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditClick = (boy: DeliveryBoy) => {
        setEditingId(boy._id);
        setName(boy.name);
        setPhone(boy.phone);
        setPassword(''); // Don't populate password
        setFormError(null);
        setIsEditModalOpen(true);
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);
        setIsSubmitting(true);
        try {
            const payload: any = { name, phone };
            if (password) payload.password = password; // Only send if changed
            
            await apiClient.put(`/delivery-boys/${editingId}`, payload);
            setIsEditModalOpen(false);
            resetForm();
            fetchDeliveryBoys();
        } catch (err) {
            setFormError(handleApiError(err));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleToggleStatus = async (id: string, currentStatus: boolean) => {
        try {
            if (currentStatus) {
                await apiClient.delete(`/delivery-boys/${id}`); // Assumes DELETE sets isActive to false
            } else {
                await apiClient.put(`/delivery-boys/${id}`, { isActive: true });
            }
            fetchDeliveryBoys();
        } catch (err) {
            alert(handleApiError(err));
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <div className="space-y-4 md:space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                        Delivery Boys
                    </h1>
                    <p className="text-sm md:text-base text-gray-600 mt-2">
                        Manage delivery personnel
                    </p>
                </div>

                <Dialog open={isAddModalOpen} onOpenChange={(open) => {
                    setIsAddModalOpen(open);
                    if (!open) resetForm();
                }}>
                    <DialogTrigger asChild>
                        <Button className="bg-orange-600 hover:bg-orange-700 text-white">
                            <PlusCircle className="w-4 h-4 mr-2" />
                            Add Delivery Boy
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Delivery Boy</DialogTitle>
                        </DialogHeader>
                        {formError && (
                            <Alert variant="error" className="bg-red-50 text-red-900 border-red-200">
                                {formError}
                            </Alert>
                        )}
                        <form onSubmit={handleAddSubmit} className="space-y-4 mt-4">
                            <div className="space-y-2">
                                <Label htmlFor="add-name">Full Name</Label>
                                <Input
                                    id="add-name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="John Doe"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="add-phone">Phone Number</Label>
                                <Input
                                    id="add-phone"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="10-digit phone number"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="add-password">Password</Label>
                                <Input
                                    id="add-password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter secure password"
                                    required
                                />
                            </div>
                            <Button
                                type="submit"
                                className="w-full bg-orange-600 hover:bg-orange-700"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? <Spinner size="sm" className="mr-2" /> : null}
                                {isSubmitting ? 'Adding...' : 'Add Delivery Boy'}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Edit Modal */}
                <Dialog open={isEditModalOpen} onOpenChange={(open) => {
                    setIsEditModalOpen(open);
                    if (!open) resetForm();
                }}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit Delivery Boy</DialogTitle>
                        </DialogHeader>
                        {formError && (
                            <Alert variant="error" className="bg-red-50 text-red-900 border-red-200">
                                {formError}
                            </Alert>
                        )}
                        <form onSubmit={handleEditSubmit} className="space-y-4 mt-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-name">Full Name</Label>
                                <Input
                                    id="edit-name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="John Doe"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-phone">Phone Number</Label>
                                <Input
                                    id="edit-phone"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="10-digit phone number"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-password">New Password (optional)</Label>
                                <Input
                                    id="edit-password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Leave blank to keep current password"
                                />
                            </div>
                            <Button
                                type="submit"
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? <Spinner size="sm" className="mr-2" /> : null}
                                {isSubmitting ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {error ? (
                <Alert variant="error" className="bg-red-50 text-red-900 border-red-200">
                    {error}
                </Alert>
            ) : (
                <Card className="p-4 md:p-6 overflow-hidden">
                    <div className="overflow-x-auto -mx-4 md:mx-0">
                        <div className="inline-block min-w-full align-middle">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Phone</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {deliveryBoys.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                                                No delivery boys found. Add one to get started.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        deliveryBoys.map((boy) => (
                                            <TableRow key={boy._id}>
                                                <TableCell className="font-medium">{boy.name}</TableCell>
                                                <TableCell>{boy.phone}</TableCell>
                                                <TableCell>
                                                    <span
                                                        className={`px-2 py-1 text-xs rounded-full ${
                                                            boy.isActive !== false
                                                                ? 'bg-green-100 text-green-800'
                                                                : 'bg-red-100 text-red-800'
                                                        }`}
                                                    >
                                                        {boy.isActive !== false ? 'Active' : 'Inactive'}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                                            onClick={() => {
                                                                const baseUrl = window.location.origin;
                                                                const message = `🚚 Delivery Login\nClick to start: ${baseUrl}/delivery/login`;
                                                                window.open(`https://wa.me/91${boy.phone}?text=${encodeURIComponent(message)}`, '_blank');
                                                            }}
                                                            title="Send Login Link"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21"/><path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1Z"/><path d="M14 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1Z"/><path d="M9.5 13.5c1.5 1 3.5 1 5 0"/></svg>
                                                            Share
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-blue-600 hover:text-blue-700"
                                                            onClick={() => handleEditClick(boy)}
                                                        >
                                                            <Edit className="w-4 h-4 mr-1" />
                                                            Edit
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className={boy.isActive !== false ? "text-red-600 hover:text-red-700" : "text-green-600 hover:text-green-700"}
                                                            onClick={() => handleToggleStatus(boy._id, boy.isActive !== false)}
                                                        >
                                                            {boy.isActive !== false ? (
                                                                <>
                                                                    <PowerOff className="w-4 h-4 mr-1" />
                                                                    Disable
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Power className="w-4 h-4 mr-1" />
                                                                    Enable
                                                                </>
                                                            )}
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </Card>
            )}
        </div>
    );
}
