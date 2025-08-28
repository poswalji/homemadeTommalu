 import React, { useState,useEffect} from 'react';

        // Sample Cart Data (this would come from your cart page)
        const SAMPLE_CART = [
            {
                id: 1,
                name: "Fresh Bananas",
                price: 60,
                quantity: 2,
                unit: "kg",
                image: "🍌",
                businessName: "Fresh Mart Grocery",
                businessType: "grocery"
            },
            {
                id: 2,
                name: "Basmati Rice",
                price: 120,
                quantity: 1,
                unit: "kg",
                image: "🍚",
                businessName: "Fresh Mart Grocery",
                businessType: "grocery",
                discount: 10
            },
            {
                id: 3,
                name: "Butter Chicken",
                price: 280,
                quantity: 2,
                unit: "plate",
                image: "🍛",
                businessName: "Spice Garden Restaurant",
                businessType: "restaurant"
            }
        ];

        // Sample Addresses
        const SAMPLE_ADDRESSES = [
            {
                id: 1,
                type: "Home",
                name: "Rajesh Kumar",
                phone: "+91 98765 43210",
                address: "123 MG Road, Koramangala, Bangalore - 560034",
                landmark: "Near Koramangala Metro Station",
                isDefault: true
            },
            {
                id: 2,
                type: "Office",
                name: "Rajesh Kumar",
                phone: "+91 98765 43210",
                address: "456 Brigade Road, Commercial Street, Bangalore - 560025",
                landmark: "Above Cafe Coffee Day",
                isDefault: false
            }
        ];

        // Header Component
        const CheckoutHeader = ({ currentStep, onBackToCart }) => {
            const steps = [
                { id: 1, name: "Delivery", icon: "fa-map-marker-alt" },
                { id: 2, name: "Payment", icon: "fa-credit-card" },
                { id: 3, name: "Confirmation", icon: "fa-check-circle" }
            ];

            return (
                <header className="gradient-bg text-white shadow-lg">
                    <div className="container mx-auto px-4 py-4">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-4">
                                <button
                                    onClick={onBackToCart}
                                    className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center hover:bg-opacity-30 transition-colors"
                                >
                                    <i className="fas fa-arrow-left"></i>
                                </button>
                                <div>
                                    <h1 className="text-2xl font-bold">Checkout</h1>
                                    <p className="text-blue-100">Complete your order</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm text-blue-100">Secure Checkout</div>
                                <div className="flex items-center text-green-200">
                                    <i className="fas fa-shield-alt mr-1"></i>
                                    SSL Protected
                                </div>
                            </div>
                        </div>

                        {/* Progress Steps */}
                        <div className="flex items-center justify-center space-x-12">
                            {steps.map((step, index) => (
                                <div key={step.id} className={`step-indicator flex items-center space-x-3 ${
                                    currentStep >= step.id ? 'active' : ''
                                }`}>
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-medium ${
                                        currentStep >= step.id 
                                            ? 'bg-white text-purple-600' 
                                            : 'bg-white bg-opacity-20 text-white'
                                    }`}>
                                        <i className={`fas ${step.icon}`}></i>
                                    </div>
                                    <span className={`font-medium ${
                                        currentStep >= step.id ? 'text-white' : 'text-blue-200'
                                    }`}>
                                        {step.name}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </header>
            );
        };

        // Delivery Address Step
        const DeliveryAddress = ({ selectedAddress, setSelectedAddress, deliveryTime, setDeliveryTime, instructions, setInstructions, onNext, onBack, cart }) => {
            const [addresses, setAddresses] = useState(SAMPLE_ADDRESSES);
            const [showAddForm, setShowAddForm] = useState(false);

            const subtotal = cart.reduce((sum, item) => {
                const itemPrice = item.discount ? item.price * (1 - item.discount / 100) : item.price;
                return sum + (itemPrice * item.quantity);
            }, 0);

            const deliveryFee = deliveryTime === 'express' ? 25 : 40;
            const tax = Math.round(subtotal * 0.05);
            const total = subtotal + deliveryFee + tax;

            const AddAddressForm = ({ onClose, onSave }) => {
                const [formData, setFormData] = useState({
                    type: 'Home',
                    name: '',
                    phone: '',
                    address: '',
                    landmark: '',
                    isDefault: false
                });

                const handleSubmit = (e) => {
                    e.preventDefault();
                    const newAddress = {
                        ...formData,
                        id: Date.now()
                    };
                    onSave(newAddress);
                    onClose();
                };

                return (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-bold text-gray-800">Add New Address</h2>
                                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                                        <i className="fas fa-times text-xl"></i>
                                    </button>
                                </div>
                            </div>
                            
                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Address Type</label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({...formData, type: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    >
                                        <option value="Home">🏠 Home</option>
                                        <option value="Office">🏢 Office</option>
                                        <option value="Other">📍 Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Complete Address</label>
                                    <textarea
                                        value={formData.address}
                                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        rows="3"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Landmark (Optional)</label>
                                    <input
                                        type="text"
                                        value={formData.landmark}
                                        onChange={(e) => setFormData({...formData, landmark: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        placeholder="Nearby landmark"
                                    />
                                </div>

                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="isDefault"
                                        checked={formData.isDefault}
                                        onChange={(e) => setFormData({...formData, isDefault: e.target.checked})}
                                        className="mr-2"
                                    />
                                    <label htmlFor="isDefault" className="text-sm text-gray-700">
                                        Set as default address
                                    </label>
                                </div>
                                
                                <div className="flex space-x-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                                    >
                                        Save Address
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                );
            };

            return (
                <div className="container mx-auto px-4 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">
                            {/* Delivery Address */}
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-bold text-gray-800">
                                        <i className="fas fa-map-marker-alt mr-2 text-purple-600"></i>
                                        Delivery Address
                                    </h2>
                                    <button
                                        onClick={() => setShowAddForm(true)}
                                        className="text-purple-600 hover:text-purple-800 font-medium"
                                    >
                                        <i className="fas fa-plus mr-1"></i>Add New Address
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {addresses.map(address => (
                                        <div
                                            key={address.id}
                                            onClick={() => setSelectedAddress(address)}
                                            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                                selectedAddress?.id === address.id
                                                    ? 'border-purple-500 bg-purple-50'
                                                    : 'border-gray-200 hover:border-purple-300'
                                            }`}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-2 mb-2">
                                                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                            address.type === 'Home' ? 'bg-green-100 text-green-800' :
                                                            address.type === 'Office' ? 'bg-blue-100 text-blue-800' :
                                                            'bg-gray-100 text-gray-800'
                                                        }`}>
                                                            {address.type === 'Home' ? '🏠' : address.type === 'Office' ? '🏢' : '📍'} {address.type}
                                                        </span>
                                                        {address.isDefault && (
                                                            <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-medium">
                                                                Default
                                                            </span>
                                                        )}
                                                    </div>
                                                    <h3 className="font-semibold text-gray-800">{address.name}</h3>
                                                    <p className="text-gray-600 text-sm">{address.phone}</p>
                                                    <p className="text-gray-700 mt-1">{address.address}</p>
                                                    {address.landmark && (
                                                        <p className="text-gray-500 text-sm mt-1">
                                                            <i className="fas fa-map-pin mr-1"></i>
                                                            {address.landmark}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                                    selectedAddress?.id === address.id
                                                        ? 'border-purple-500 bg-purple-500'
                                                        : 'border-gray-300'
                                                }`}>
                                                    {selectedAddress?.id === address.id && (
                                                        <i className="fas fa-check text-white text-xs"></i>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Delivery Time */}
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <h3 className="text-lg font-bold text-gray-800 mb-4">
                                    <i className="fas fa-clock mr-2 text-purple-600"></i>
                                    Delivery Time
                                </h3>
                                
                                <div className="space-y-3">
                                    <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                                        <input
                                            type="radio"
                                            name="deliveryTime"
                                            value="standard"
                                            checked={deliveryTime === 'standard'}
                                            onChange={(e) => setDeliveryTime(e.target.value)}
                                            className="mr-3"
                                        />
                                        <div className="flex-1">
                                            <div className="font-medium text-gray-800">Standard Delivery</div>
                                            <div className="text-sm text-gray-600">45-60 minutes</div>
                                        </div>
                                        <div className="text-green-600 font-medium">₹40</div>
                                    </label>
                                    
                                    <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                                        <input
                                            type="radio"
                                            name="deliveryTime"
                                            value="express"
                                            checked={deliveryTime === 'express'}
                                            onChange={(e) => setDeliveryTime(e.target.value)}
                                            className="mr-3"
                                        />
                                        <div className="flex-1">
                                            <div className="font-medium text-gray-800">Express Delivery</div>
                                            <div className="text-sm text-gray-600">20-30 minutes</div>
                                        </div>
                                        <div className="text-purple-600 font-medium">₹25</div>
                                    </label>
                                </div>
                            </div>

                            {/* Delivery Instructions */}
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <h3 className="text-lg font-bold text-gray-800 mb-4">
                                    <i className="fas fa-sticky-note mr-2 text-purple-600"></i>
                                    Delivery Instructions (Optional)
                                </h3>
                                <textarea
                                    value={instructions}
                                    onChange={(e) => setInstructions(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    rows="3"
                                    placeholder="Any specific instructions for delivery..."
                                />
                            </div>
                        </div>

                        {/* Order Summary Sidebar */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-4">
                                <h3 className="text-lg font-bold text-gray-800 mb-4">Order Summary</h3>
                                
                                {/* Cart Items Preview */}
                                <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
                                    {cart.map(item => (
                                        <div key={item.id} className="flex items-center space-x-3 text-sm">
                                            <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-500 rounded flex items-center justify-center text-lg">
                                                {item.image}
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-medium text-gray-800">{item.name}</div>
                                                <div className="text-gray-600">Qty: {item.quantity}</div>
                                            </div>
                                            <div className="font-semibold text-gray-800">
                                                ₹{Math.round((item.discount ? item.price * (1 - item.discount / 100) : item.price) * item.quantity)}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <hr className="border-gray-200 mb-4" />

                                <div className="space-y-2 mb-4">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Subtotal</span>
                                        <span className="font-semibold">₹{Math.round(subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Delivery Fee</span>
                                        <span className="font-semibold">₹{deliveryFee}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Tax (5%)</span>
                                        <span className="font-semibold">₹{tax}</span>
                                    </div>
                                    <hr className="border-gray-200" />
                                    <div className="flex justify-between text-lg">
                                        <span className="font-bold text-gray-800">Total</span>
                                        <span className="font-bold text-purple-600">₹{Math.round(total)}</span>
                                    </div>
                                </div>

                                {selectedAddress && (
                                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                                        <div className="text-sm text-gray-600 mb-1">Delivering to:</div>
                                        <div className="font-medium text-gray-800">{selectedAddress.name}</div>
                                        <div className="text-sm text-gray-600">{selectedAddress.address}</div>
                                    </div>
                                )}

                                <div className="flex space-x-3">
                                    <button
                                        onClick={onBack}
                                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        <i className="fas fa-arrow-left mr-2"></i>Back to Cart
                                    </button>
                                    <button
                                        onClick={onNext}
                                        disabled={!selectedAddress}
                                        className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Continue
                                        <i className="fas fa-arrow-right ml-2"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Add Address Modal */}
                    {showAddForm && (
                        <AddAddressForm
                            onClose={() => setShowAddForm(false)}
                            onSave={(newAddress) => {
                                setAddresses([...addresses, newAddress]);
                                if (newAddress.isDefault) {
                                    setSelectedAddress(newAddress);
                                }
                            }}
                        />
                    )}
                </div>
            );
        };

        // Payment Step
        const Payment = ({ cart, selectedAddress, deliveryTime, paymentMethod, setPaymentMethod, onNext, onBack }) => {
            const [cardDetails, setCardDetails] = useState({
                number: '',
                expiry: '',
                cvv: '',
                name: ''
            });

            const subtotal = cart.reduce((sum, item) => {
                const itemPrice = item.discount ? item.price * (1 - item.discount / 100) : item.price;
                return sum + (itemPrice * item.quantity);
            }, 0);

            const deliveryFee = deliveryTime === 'express' ? 25 : 40;
            const tax = Math.round(subtotal * 0.05);
            const total = subtotal + deliveryFee + tax;

            const paymentOptions = [
                {
                    id: 'cod',
                    name: 'Cash on Delivery',
                    icon: 'fa-money-bill-wave',
                    description: 'Pay when your order arrives',
                    color: 'green'
                },
                {
                    id: 'upi',
                    name: 'UPI Payment',
                    icon: 'fa-mobile-alt',
                    description: 'Pay using UPI apps like GPay, PhonePe',
                    color: 'blue'
                },
                {
                    id: 'card',
                    name: 'Credit/Debit Card',
                    icon: 'fa-credit-card',
                    description: 'Visa, Mastercard, RuPay accepted',
                    color: 'purple'
                },
                {
                    id: 'wallet',
                    name: 'Digital Wallet',
                    icon: 'fa-wallet',
                    description: 'Paytm, Amazon Pay, etc.',
                    color: 'orange'
                }
            ];

            return (
                <div className="container mx-auto px-4 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">
                            {/* Payment Methods */}
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <h2 className="text-xl font-bold text-gray-800 mb-6">
                                    <i className="fas fa-credit-card mr-2 text-purple-600"></i>
                                    Choose Payment Method
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {paymentOptions.map(option => (
                                        <div
                                            key={option.id}
                                            onClick={() => setPaymentMethod(option.id)}
                                            className={`payment-option p-4 border-2 rounded-lg cursor-pointer ${
                                                paymentMethod === option.id ? 'selected' : ''
                                            }`}
                                        >
                                            <div className="flex items-center space-x-3">
                                                <div className={`w-12 h-12 bg-${option.color}-100 text-${option.color}-600 rounded-lg flex items-center justify-center`}>
                                                    <i className={`fas ${option.icon} text-xl`}></i>
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-gray-800">{option.name}</h3>
                                                    <p className="text-sm text-gray-600">{option.description}</p>
                                                </div>
                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                                    paymentMethod === option.id
                                                        ? 'border-purple-500 bg-purple-500'
                                                        : 'border-gray-300'
                                                }`}>
                                                    {paymentMethod === option.id && (
                                                        <i className="fas fa-check text-white text-xs"></i>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Card Details Form (if card payment selected) */}
                            {paymentMethod === 'card' && (
                                <div className="bg-white rounded-xl shadow-lg p-6">
                                    <h3 className="text-lg font-bold text-gray-800 mb-4">Card Details</h3>
                                    
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                                            <input
                                                type="text"
                                                value={cardDetails.number}
                                                onChange={(e) => setCardDetails({...cardDetails, number: e.target.value})}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                placeholder="1234 5678 9012 3456"
                                                maxLength="19"
                                            />
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Cardholder Name</label>
                                            <input
                                                type="text"
                                                value={cardDetails.name}
                                                onChange={(e) => setCardDetails({...cardDetails, name: e.target.value})}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                placeholder="Name on card"
                                            />
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                                                <input
                                                    type="text"
                                                    value={cardDetails.expiry}
                                                    onChange={(e) => setCardDetails({...cardDetails, expiry: e.target.value})}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                    placeholder="MM/YY"
                                                    maxLength="5"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                                                <input
                                                    type="text"
                                                    value={cardDetails.cvv}
                                                    onChange={(e) => setCardDetails({...cardDetails, cvv: e.target.value})}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                    placeholder="123"
                                                    maxLength="4"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Security Info */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex items-center text-blue-700">
                                    <i className="fas fa-shield-alt mr-2"></i>
                                    <span className="font-medium">Your payment information is secure and encrypted</span>
                                </div>
                            </div>
                        </div>

                        {/* Payment Summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-4">
                                <h3 className="text-lg font-bold text-gray-800 mb-4">Payment Summary</h3>
                                
                                <div className="space-y-3 mb-4">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Subtotal</span>
                                        <span className="font-semibold">₹{Math.round(subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Delivery Fee</span>
                                        <span className="font-semibold">₹{deliveryFee}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Tax</span>
                                        <span className="font-semibold">₹{tax}</span>
                                    </div>
                                    <hr className="border-gray-200" />
                                    <div className="flex justify-between text-lg">
                                        <span className="font-bold text-gray-800">Total Amount</span>
                                        <span className="font-bold text-purple-600">₹{Math.round(total)}</span>
                                    </div>
                                </div>

                                {selectedAddress && (
                                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                                        <div className="text-sm text-gray-600 mb-1">Delivering to:</div>
                                        <div className="font-medium text-gray-800">{selectedAddress.name}</div>
                                        <div className="text-sm text-gray-600">{selectedAddress.address}</div>
                                    </div>
                                )}

                                <div className="flex space-x-3">
                                    <button
                                        onClick={onBack}
                                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        <i className="fas fa-arrow-left mr-2"></i>Back
                                    </button>
                                    <button
                                        onClick={onNext}
                                        disabled={!paymentMethod}
                                        className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Place Order
                                        <i className="fas fa-check ml-2"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        };

        // Order Confirmation Step
        const OrderConfirmation = ({ orderDetails, onBackToHome }) => {
            const [isProcessing, setIsProcessing] = useState(true);

            useEffect(() => {
                const timer = setTimeout(() => {
                    setIsProcessing(false);
                }, 2000);
                return () => clearTimeout(timer);
            }, []);

            if (isProcessing) {
                return (
                    <div className="container mx-auto px-4 py-16">
                        <div className="max-w-md mx-auto text-center">
                            <div className="loading-spinner mx-auto mb-4"></div>
                            <h2 className="text-xl font-bold text-gray-800 mb-2">Processing Your Order...</h2>
                            <p className="text-gray-600">Please wait while we confirm your order</p>
                        </div>
                    </div>
                );
            }

            return (
                <div className="container mx-auto px-4 py-8">
                    <div className="max-w-2xl mx-auto">
                        <div className="bg-white rounded-xl shadow-lg p-8 text-center order-success">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <i className="fas fa-check-circle text-green-500 text-3xl"></i>
                            </div>
                            
                            <h1 className="text-2xl font-bold text-gray-800 mb-2">Order Placed Successfully!</h1>
                            <p className="text-gray-600 mb-6">Thank you for your order. We'll start preparing it right away.</p>
                            
                            <div className="bg-gray-50 rounded-lg p-6 mb-6">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-600">Order ID:</span>
                                        <div className="font-bold text-gray-800">#TOM{Date.now().toString().slice(-6)}</div>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Total Amount:</span>
                                        <div className="font-bold text-purple-600">₹{orderDetails.total}</div>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Payment Method:</span>
                                        <div className="font-medium text-gray-800 capitalize">{orderDetails.paymentMethod}</div>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Estimated Delivery:</span>
                                        <div className="font-medium text-gray-800">
                                            {orderDetails.deliveryTime === 'express' ? '20-30 minutes' : '45-60 minutes'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="space-y-4">
                                <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
                                    <div className="flex items-center">
                                        <i className="fas fa-clock mr-2 text-yellow-500"></i>
                                        Order Confirmed
                                    </div>
                                    <div className="w-8 h-px bg-gray-300"></div>
                                    <div className="flex items-center">
                                        <i className="fas fa-utensils mr-2 text-blue-500"></i>
                                        Preparing
                                    </div>
                                    <div className="w-8 h-px bg-gray-300"></div>
                                    <div className="flex items-center">
                                        <i className="fas fa-truck mr-2 text-green-500"></i>
                                        On the way
                                    </div>
                                </div>
                                
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <p className="text-blue-700 text-sm">
                                        <i className="fas fa-info-circle mr-2"></i>
                                        You'll receive SMS updates about your order status. Track your order in the app.
                                    </p>
                                </div>
                                
                                <div className="flex space-x-4 pt-4">
                                    <button
                                        onClick={onBackToHome}
                                        className="flex-1 px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-medium"
                                    >
                                        <i className="fas fa-home mr-2"></i>
                                        Back to Home
                                    </button>
                                    <button className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                                        <i className="fas fa-eye mr-2"></i>
                                        Track Order
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        };

        // Main Checkout Component
        const TommaluCheckout = () => {
            const [currentStep, setCurrentStep] = useState(1);
            const [cart, setCart] = useState(SAMPLE_CART);
            const [selectedAddress, setSelectedAddress] = useState(SAMPLE_ADDRESSES[0]);
            const [deliveryTime, setDeliveryTime] = useState('standard');
            const [instructions, setInstructions] = useState('');
            const [paymentMethod, setPaymentMethod] = useState('');
            const [orderDetails, setOrderDetails] = useState(null);

            const handleNext = () => {
                if (currentStep < 3) {
                    setCurrentStep(currentStep + 1);
                    if (currentStep === 2) {
                        // Place order
                        const subtotal = cart.reduce((sum, item) => {
                            const itemPrice = item.discount ? item.price * (1 - item.discount / 100) : item.price;
                            return sum + (itemPrice * item.quantity);
                        }, 0);
                        const deliveryFee = deliveryTime === 'express' ? 25 : 40;
                        const total = subtotal + deliveryFee + Math.round(subtotal * 0.05);
                        
                        setOrderDetails({
                            total: Math.round(total),
                            paymentMethod,
                            deliveryTime,
                            address: selectedAddress,
                            items: cart,
                            instructions
                        });
                    }
                }
            };

            const handleBack = () => {
                if (currentStep > 1) {
                    setCurrentStep(currentStep - 1);
                }
            };

            const handleBackToCart = () => {
                // This would navigate back to your cart page
                alert('Navigating back to cart page...');
            };

            const handleBackToHome = () => {
                // This would navigate back to your home page
                alert('Navigating back to home page...');
            };

            const renderStep = () => {
                switch (currentStep) {
                    case 1:
                        return (
                            <DeliveryAddress
                                selectedAddress={selectedAddress}
                                setSelectedAddress={setSelectedAddress}
                                deliveryTime={deliveryTime}
                                setDeliveryTime={setDeliveryTime}
                                instructions={instructions}
                                setInstructions={setInstructions}
                                onNext={handleNext}
                                onBack={handleBackToCart}
                                cart={cart}
                            />
                        );
                    case 2:
                        return (
                            <Payment
                                cart={cart}
                                selectedAddress={selectedAddress}
                                deliveryTime={deliveryTime}
                                paymentMethod={paymentMethod}
                                setPaymentMethod={setPaymentMethod}
                                onNext={handleNext}
                                onBack={handleBack}
                            />
                        );
                    case 3:
                        return <OrderConfirmation orderDetails={orderDetails} onBackToHome={handleBackToHome} />;
                    default:
                        return null;
                }
            };

            return (
                <div className="min-h-screen bg-gray-50">
                    <CheckoutHeader currentStep={currentStep} onBackToCart={handleBackToCart} />
                    {renderStep()}
                </div>
            );
        };
export  {TommaluCheckout, DeliveryAddress, Payment, OrderConfirmation, CheckoutHeader, SAMPLE_ADDRESSES, SAMPLE_CART};