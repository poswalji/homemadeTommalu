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
        export default Payment;