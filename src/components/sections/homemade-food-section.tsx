'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    ChefHat,
    Clock,
    Sparkles,
    Star,
    Utensils,
    MapPin,
    Phone,
    User,
    Mail,
    Package,
    CheckCircle,
    Loader2,
    Minus,
    Plus,
    ArrowRight,
    Heart
} from 'lucide-react';
import { useTodaysSpecial, useSubmitHomemadeFoodOrder } from '@/hooks/api';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

interface OrderFormData {
    customerName: string;
    mobileNumber: string;
    email: string;
    street: string;
    landmark: string;
    city: string;
    state: string;
    pincode: string;
    quantity: number;
    specialInstructions: string;
    preferredDeliverySlot: string;
    paymentMethod: string;
}

export function HomemadeFoodSection() {
    const { data, isLoading } = useTodaysSpecial();
    const submitOrder = useSubmitHomemadeFoodOrder();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false);
    const [orderNumber, setOrderNumber] = useState('');
    const [formData, setFormData] = useState<OrderFormData>({
        customerName: '',
        mobileNumber: '',
        email: '',
        street: '',
        landmark: '',
        city: '',
        state: '',
        pincode: '',
        quantity: 1,
        specialInstructions: '',
        preferredDeliverySlot: 'any',
        paymentMethod: 'cash_on_delivery'
    });

    const todaysSpecial = data?.data;

    const handleInputChange = (field: keyof OrderFormData, value: string | number) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const incrementQuantity = () => {
        if (formData.quantity < 50) {
            handleInputChange('quantity', formData.quantity + 1);
        }
    };

    const decrementQuantity = () => {
        if (formData.quantity > 1) {
            handleInputChange('quantity', formData.quantity - 1);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!todaysSpecial) return;

        // Validate required fields
        if (!formData.customerName || !formData.mobileNumber || !formData.street || !formData.city || !formData.pincode) {
            toast.error('Please fill all required fields');
            return;
        }

        // Validate mobile number
        if (!/^[6-9]\d{9}$/.test(formData.mobileNumber)) {
            toast.error('Please enter a valid 10-digit mobile number');
            return;
        }

        try {
            const result = await submitOrder.mutateAsync({
                ...formData,
                foodItemId: todaysSpecial._id
            });

            setOrderNumber(result.data.orderNumber);
            setOrderSuccess(true);

            // Reset form
            setFormData({
                customerName: '',
                mobileNumber: '',
                email: '',
                street: '',
                landmark: '',
                city: '',
                state: '',
                pincode: '',
                quantity: 1,
                specialInstructions: '',
                preferredDeliverySlot: 'any',
                paymentMethod: 'cash_on_delivery'
            });
        } catch (error: any) {
            toast.error(error.message || 'Failed to place order');
        }
    };

    const closeDialog = () => {
        setIsDialogOpen(false);
        setOrderSuccess(false);
        setOrderNumber('');
    };

    const totalAmount = todaysSpecial ? (todaysSpecial.price * formData.quantity) + 30 : 0; // 30 is delivery charge

    if (isLoading) {
        return (
            <section className="py-16 bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
                <div className="container mx-auto px-4 md:px-8">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <Skeleton className="h-[400px] rounded-3xl" />
                        <div className="space-y-4">
                            <Skeleton className="h-8 w-32" />
                            <Skeleton className="h-12 w-3/4" />
                            <Skeleton className="h-24 w-full" />
                            <Skeleton className="h-12 w-40" />
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    if (!todaysSpecial) {
        return null; // Don't show section if no today's special
    }

    return (
        <>
            <section className="relative container mx-auto px-4 md:px-8 py-20 overflow-hidden">
                {/* Background with gradient and pattern */}
                <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50" />
                <div className="absolute inset-0 opacity-30">
                    <div className="absolute top-10 left-10 w-72 h-72 bg-orange-200 rounded-full blur-3xl" />
                    <div className="absolute bottom-10 right-10 w-96 h-96 bg-yellow-200 rounded-full blur-3xl" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-amber-200 rounded-full blur-3xl" />
                </div>

                <div className="container mx-auto px-4 md:px-8 relative z-10">
                    {/* Section Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="text-center mb-12"
                    >
                        <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-600 px-4 py-2 rounded-full text-sm font-medium mb-4">
                            <ChefHat className="w-4 h-4" />
                            <span>Homemade Goodness</span>
                            <Sparkles className="w-4 h-4" />
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                            Today's <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">Special</span>
                        </h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Freshly prepared with love, using traditional recipes and the finest ingredients
                        </p>
                    </motion.div>

                    <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
                        {/* Food Image */}
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="relative"
                        >
                            <div className="relative group">
                                {/* Decorative rings */}
                                <div className="absolute -inset-4 bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400 rounded-3xl opacity-20 blur-xl group-hover:opacity-30 transition-opacity" />
                                <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 rounded-3xl opacity-75" />

                                {/* Main image container */}
                                <div className="relative bg-white rounded-3xl overflow-hidden shadow-2xl">
                                    <img
                                        src={todaysSpecial.image}
                                        alt={todaysSpecial.name}
                                        className="w-full h-[350px] md:h-[450px] object-cover transform group-hover:scale-105 transition-transform duration-700"
                                    />

                                    {/* Overlay badges */}
                                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                                        <Badge className="bg-orange-500 text-white px-3 py-1 text-sm font-semibold shadow-lg">
                                            🔥 Today's Special
                                        </Badge>
                                        {todaysSpecial.cuisine && (
                                            <Badge className="bg-white/90 text-orange-600 px-3 py-1 text-sm font-medium shadow-lg">
                                                {todaysSpecial.cuisine}
                                            </Badge>
                                        )}
                                    </div>

                                    {/* Price tag */}
                                    <div className="absolute bottom-4 right-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-3 rounded-2xl shadow-lg">
                                        <p className="text-xs font-medium opacity-90">Starting from</p>
                                        <p className="text-2xl font-bold">₹{todaysSpecial.price}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Floating elements */}
                            <motion.div
                                animate={{ y: [0, -10, 0] }}
                                transition={{ duration: 3, repeat: Infinity }}
                                className="absolute -top-6 -right-6 bg-white rounded-2xl shadow-xl p-4 hidden md:block"
                            >
                                <div className="flex items-center gap-2">
                                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                        <Heart className="w-5 h-5 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Made with</p>
                                        <p className="text-sm font-semibold text-gray-900">100% Love</p>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div
                                animate={{ y: [0, 10, 0] }}
                                transition={{ duration: 3.5, repeat: Infinity }}
                                className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-xl p-4 hidden md:block"
                            >
                                <div className="flex items-center gap-2">
                                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                                        <Clock className="w-5 h-5 text-orange-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Prepared in</p>
                                        <p className="text-sm font-semibold text-gray-900">{todaysSpecial.preparationTime || '30-45 mins'}</p>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>

                        {/* Content */}
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="space-y-6"
                        >
                            <div>
                                <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                                    {todaysSpecial.name}
                                </h3>
                                <p className="text-lg text-gray-600 leading-relaxed">
                                    {todaysSpecial.description}
                                </p>
                            </div>

                            {/* Features */}
                            {todaysSpecial.features && todaysSpecial.features.length > 0 && (
                                <div className="space-y-3">
                                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                                        What's Included
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {todaysSpecial.features.map((feature: string, index: number) => (
                                            <motion.div
                                                key={index}
                                                initial={{ opacity: 0, y: 10 }}
                                                whileInView={{ opacity: 1, y: 0 }}
                                                viewport={{ once: true }}
                                                transition={{ duration: 0.3, delay: 0.1 * index }}
                                                className="flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-xl px-4 py-3 shadow-sm border border-orange-100"
                                            >
                                                <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-amber-400 rounded-lg flex items-center justify-center flex-shrink-0">
                                                    <CheckCircle className="w-4 h-4 text-white" />
                                                </div>
                                                <span className="text-sm font-medium text-gray-700">{feature}</span>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Additional Info */}
                            <div className="flex flex-wrap gap-4">
                                <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-sm">
                                    <Utensils className="w-4 h-4 text-orange-500" />
                                    <span className="text-sm text-gray-700">{todaysSpecial.servingSize || '1 Thali'}</span>
                                </div>
                                <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-sm">
                                    <Clock className="w-4 h-4 text-orange-500" />
                                    <span className="text-sm text-gray-700">{todaysSpecial.preparationTime || '30-45 mins'}</span>
                                </div>
                                {todaysSpecial.availableQuantity !== undefined && todaysSpecial.availableQuantity !== -1 && (
                                    <div className="flex items-center gap-2 bg-red-50 rounded-full px-4 py-2 shadow-sm border border-red-200">
                                        <Package className="w-4 h-4 text-red-500" />
                                        <span className="text-sm text-red-600 font-medium">Only {todaysSpecial.availableQuantity} left!</span>
                                    </div>
                                )}
                            </div>

                            {/* CTA Button */}
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Button
                                    size="lg"
                                    onClick={() => setIsDialogOpen(true)}
                                    className="w-full sm:w-auto h-14 px-8 text-lg font-semibold bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg hover:shadow-xl transition-all rounded-xl"
                                >
                                    <span>Order Now</span>
                                    <ArrowRight className="ml-2 w-5 h-5" />
                                </Button>
                            </motion.div>

                            <p className="text-sm text-gray-500">
                                ✨ Free delivery on orders above ₹200 • Cash on delivery available
                            </p>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Order Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={closeDialog}>
                <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
                    <AnimatePresence mode="wait">
                        {orderSuccess ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="text-center py-8"
                            >
                                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <CheckCircle className="w-10 h-10 text-green-600" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h3>
                                <p className="text-gray-600 mb-4">Your order has been received and we will contact you shortly.</p>
                                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                                    <p className="text-sm text-gray-500">Order Number</p>
                                    <p className="text-xl font-bold text-orange-600">{orderNumber}</p>
                                </div>
                                <p className="text-sm text-gray-500 mb-6">
                                    Save this order number to track your order status
                                </p>
                                <Button onClick={closeDialog} className="w-full">
                                    Done
                                </Button>
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                <DialogHeader>
                                    <DialogTitle className="text-2xl">Order {todaysSpecial?.name}</DialogTitle>
                                    <DialogDescription>
                                        Fill in your details to place your order. We'll deliver fresh homemade food to your doorstep.
                                    </DialogDescription>
                                </DialogHeader>

                                <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                                    {/* Quantity Selector */}
                                    <div className="bg-orange-50 rounded-xl p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={todaysSpecial?.image}
                                                    alt={todaysSpecial?.name}
                                                    className="w-16 h-16 rounded-lg object-cover"
                                                />
                                                <div>
                                                    <p className="font-semibold text-gray-900">{todaysSpecial?.name}</p>
                                                    <p className="text-sm text-orange-600 font-medium">₹{todaysSpecial?.price} per thali</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <button
                                                    type="button"
                                                    onClick={decrementQuantity}
                                                    className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50"
                                                >
                                                    <Minus className="w-4 h-4" />
                                                </button>
                                                <span className="text-lg font-semibold w-8 text-center">{formData.quantity}</span>
                                                <button
                                                    type="button"
                                                    onClick={incrementQuantity}
                                                    className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center hover:bg-orange-600"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="mt-3 pt-3 border-t border-orange-200 flex justify-between items-center">
                                            <span className="text-gray-600">Total (incl. ₹30 delivery)</span>
                                            <span className="text-xl font-bold text-orange-600">₹{totalAmount}</span>
                                        </div>
                                    </div>

                                    {/* Personal Details */}
                                    <div className="space-y-4">
                                        <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                                            <User className="w-4 h-4" />
                                            Personal Details
                                        </h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="customerName">Name *</Label>
                                                <Input
                                                    id="customerName"
                                                    placeholder="Your full name"
                                                    value={formData.customerName}
                                                    onChange={(e) => handleInputChange('customerName', e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="mobileNumber">Mobile Number *</Label>
                                                <Input
                                                    id="mobileNumber"
                                                    placeholder="10-digit mobile number"
                                                    value={formData.mobileNumber}
                                                    onChange={(e) => handleInputChange('mobileNumber', e.target.value)}
                                                    maxLength={10}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email (optional)</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                placeholder="your@email.com"
                                                value={formData.email}
                                                onChange={(e) => handleInputChange('email', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    {/* Delivery Address */}
                                    <div className="space-y-4">
                                        <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                                            <MapPin className="w-4 h-4" />
                                            Delivery Address
                                        </h4>
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="street">Street Address *</Label>
                                                <Input
                                                    id="street"
                                                    placeholder="House/Flat No., Street, Area"
                                                    value={formData.street}
                                                    onChange={(e) => handleInputChange('street', e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="landmark">Landmark (optional)</Label>
                                                <Input
                                                    id="landmark"
                                                    placeholder="Near..."
                                                    value={formData.landmark}
                                                    onChange={(e) => handleInputChange('landmark', e.target.value)}
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="city">City *</Label>
                                                    <Input
                                                        id="city"
                                                        placeholder="City"
                                                        value={formData.city}
                                                        onChange={(e) => handleInputChange('city', e.target.value)}
                                                        required
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="pincode">Pincode *</Label>
                                                    <Input
                                                        id="pincode"
                                                        placeholder="6-digit pincode"
                                                        value={formData.pincode}
                                                        onChange={(e) => handleInputChange('pincode', e.target.value)}
                                                        maxLength={6}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Delivery Preferences */}
                                    <div className="space-y-4">
                                        <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                                            <Clock className="w-4 h-4" />
                                            Delivery Preferences
                                        </h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Preferred Time Slot</Label>
                                                <Select
                                                    value={formData.preferredDeliverySlot}
                                                    onValueChange={(value) => handleInputChange('preferredDeliverySlot', value)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select time slot" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="any">Any Time</SelectItem>
                                                        <SelectItem value="morning">Morning (8AM - 12PM)</SelectItem>
                                                        <SelectItem value="afternoon">Afternoon (12PM - 4PM)</SelectItem>
                                                        <SelectItem value="evening">Evening (4PM - 8PM)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                         
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="specialInstructions">Special Instructions (optional)</Label>
                                        <Textarea
                                            id="specialInstructions"
                                            placeholder="Any special requests for your order..."
                                            value={formData.specialInstructions}
                                            onChange={(e) => handleInputChange('specialInstructions', e.target.value)}
                                            rows={3}
                                        />
                                    </div>

                                    <Button
                                        type="submit"
                                        size="lg"
                                        disabled={submitOrder.isPending}
                                        className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
                                    >
                                        {submitOrder.isPending ? (
                                            <>
                                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                                Placing Order...
                                            </>
                                        ) : (
                                            <>
                                                Place Order - ₹{totalAmount}
                                                <ArrowRight className="w-5 h-5 ml-2" />
                                            </>
                                        )}
                                    </Button>
                                </form>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </DialogContent>
            </Dialog>
        </>
    );
}
