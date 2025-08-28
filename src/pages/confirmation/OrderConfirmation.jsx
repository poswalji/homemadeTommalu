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
        export default OrderConfirmation;