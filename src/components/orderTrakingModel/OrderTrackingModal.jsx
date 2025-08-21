import React from "react";
 const OrderTrackingModal = ({ isOpen, order, onClose }) => {
            if (!isOpen || !order) return null;

            const trackingSteps = [
                {
                    status: 'confirmed',
                    title: 'Order Confirmed',
                    description: 'Your order has been received',
                    time: order.confirmedTime || '2:15 PM',
                    completed: true
                },
                {
                    status: 'preparing',
                    title: 'Preparing Food',
                    description: 'Restaurant is preparing your order',
                    time: order.preparingTime || '2:25 PM',
                    completed: order.status === 'preparing' || order.status === 'on-way' || order.status === 'delivered'
                },
                {
                    status: 'on-way',
                    title: 'On the Way',
                    description: 'Your order is being delivered',
                    time: order.onWayTime || (order.status === 'on-way' ? '2:45 PM' : ''),
                    completed: order.status === 'on-way' || order.status === 'delivered'
                },
                {
                    status: 'delivered',
                    title: 'Delivered',
                    description: 'Order delivered successfully',
                    time: order.deliveredTime || '',
                    completed: order.status === 'delivered'
                }
            ];

            return (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-hidden">
                        <div className="flex items-center justify-between p-6 border-b">
                            <div>
                                <h3 className="text-xl font-bold text-gray-800">Track Order</h3>
                                <p className="text-gray-600">#{order.id}</p>
                            </div>
                            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                                <i className="fas fa-times text-xl"></i>
                            </button>
                        </div>

                        <div className="p-6">
                            {/* Delivery Info */}
                            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-6">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-600">Estimated Delivery</span>
                                    <span className="text-lg font-bold text-purple-600">
                                        {order.status === 'preparing' ? '15-20 min' :
                                            order.status === 'on-way' ? '5-10 min' : 'Delivered'}
                                    </span>
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                    <i className="fas fa-map-marker-alt mr-2"></i>
                                    <span>123 Main Street, Apartment 4B</span>
                                </div>
                            </div>

                            {/* Tracking Steps */}
                            <div className="space-y-4">
                                {trackingSteps.map((step, index) => (
                                    <div key={index} className="flex items-start space-x-4">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step.completed
                                                ? 'bg-green-500 text-white'
                                                : 'bg-gray-200 text-gray-400'
                                            }`}>
                                            {step.completed ? (
                                                <i className="fas fa-check text-sm"></i>
                                            ) : (
                                                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <h4 className={`font-medium ${step.completed ? 'text-gray-800' : 'text-gray-400'
                                                    }`}>
                                                    {step.title}
                                                </h4>
                                                {step.time && (
                                                    <span className="text-sm text-gray-500">{step.time}</span>
                                                )}
                                            </div>
                                            <p className={`text-sm ${step.completed ? 'text-gray-600' : 'text-gray-400'
                                                }`}>
                                                {step.description}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Contact Options */}
                            <div className="mt-6 pt-6 border-t">
                                <div className="grid grid-cols-2 gap-3">
                                    <button className="flex items-center justify-center space-x-2 bg-green-100 text-green-700 py-3 rounded-lg hover:bg-green-200 transition-colors">
                                        <i className="fas fa-phone"></i>
                                        <span className="font-medium">Call Restaurant</span>
                                    </button>
                                    <button className="flex items-center justify-center space-x-2 bg-blue-100 text-blue-700 py-3 rounded-lg hover:bg-blue-200 transition-colors">
                                        <i className="fas fa-comment"></i>
                                        <span className="font-medium">Chat Support</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        };
        export default OrderTrackingModal