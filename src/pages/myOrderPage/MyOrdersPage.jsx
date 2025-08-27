 import React from "react";
 import { useState } from "react";

 const MyOrdersPage = ({ orders, onReorder, onTrackOrder }) => {
            const [activeTab, setActiveTab] = useState('current');

            const currentOrders = orders.filter(order =>
                order.status === 'preparing' || order.status === 'on-way'
            );

            const pastOrders = orders.filter(order =>
                order.status === 'delivered' || order.status === 'cancelled'
            );

            const getStatusColor = (status) => {
                switch (status) {
                    case 'preparing': return 'order-status-preparing';
                    case 'on-way': return 'order-status-on-way';
                    case 'delivered': return 'order-status-delivered';
                    case 'cancelled': return 'order-status-cancelled';
                    default: return 'bg-gray-500';
                }
            };

            const getStatusText = (status) => {
                switch (status) {
                    case 'preparing': return 'Preparing';
                    case 'on-way': return 'On the Way';
                    case 'delivered': return 'Delivered';
                    case 'cancelled': return 'Cancelled';
                    default: return status;
                }
            };

            const getStatusIcon = (status) => {
                switch (status) {
                    case 'preparing': return 'fas fa-utensils';
                    case 'on-way': return 'fas fa-truck';
                    case 'delivered': return 'fas fa-check-circle';
                    case 'cancelled': return 'fas fa-times-circle';
                    default: return 'fas fa-clock';
                }
            };

            const OrderCard = ({ order }) => (
                <div className="bg-white rounded-xl shadow-md p-6 mb-4 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                                <h3 className="text-lg font-semibold text-gray-800">{order.restaurant}</h3>
                                <span className={`px-3 py-1 rounded-full text-white text-sm font-medium ${getStatusColor(order.status)}`}>
                                    <i className={`${getStatusIcon(order.status)} mr-1`}></i>
                                    {getStatusText(order.status)}
                                </span>
                            </div>
                            <p className="text-gray-600 text-sm mb-1">Order #{order.id}</p>
                            <p className="text-gray-500 text-sm">{order.date} • {order.time}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xl font-bold text-gray-800">₹{order.total}</p>
                            <p className="text-sm text-gray-500">{order.items.length} items</p>
                        </div>
                    </div>

                    {/* Order Items */}
                    <div className="border-t pt-4 mb-4">
                        <div className="space-y-2">
                            {order.items.slice(0, 2).map((item, index) => (
                                <div key={index} className="flex items-center justify-between text-sm">
                                    <span className="text-gray-700">{item.quantity}x {item.name}</span>
                                    <span className="text-gray-600">${item.price}</span>
                                </div>
                            ))}
                            {order.items.length > 2 && (
                                <p className="text-sm text-gray-500">+{order.items.length - 2} more items</p>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-3">
                        {(order.status === 'preparing' || order.status === 'on-way') && (
                            <button
                                onClick={() => onTrackOrder(order)}
                                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white py-2 px-4 rounded-lg font-medium hover:from-blue-600 hover:to-purple-600 transition-colors"
                            >
                                <i className="fas fa-map-marker-alt mr-2"></i>Track Order
                            </button>
                        )}
                        {order.status === 'delivered' && (
                            <>
                                <button
                                    onClick={() => onReorder(order)}
                                    className="flex-1 bg-gradient-to-r from-green-500 to-teal-500 text-white py-2 px-4 rounded-lg font-medium hover:from-green-600 hover:to-teal-600 transition-colors"
                                >
                                    <i className="fas fa-redo mr-2"></i>Reorder
                                </button>
                                <button className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                                    <i className="fas fa-star mr-2"></i>Rate & Review
                                </button>
                            </>
                        )}
                        <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                            <i className="fas fa-receipt"></i>
                        </button>
                    </div>
                </div>
            );

            return (
                <>
                <div className="container mx-auto px-4 py-8">
                    <div className="max-w-4xl mx-auto">
                        {/* Page Header */}
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-gray-800 mb-2">My Orders</h1>
                            <p className="text-gray-600">Track your current orders and view order history</p>
                        </div>

                        {/* Order Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                            <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                                <div className="text-2xl font-bold text-blue-600">{currentOrders.length}</div>
                                <div className="text-sm text-gray-600">Active Orders</div>
                            </div>
                            <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                                <div className="text-2xl font-bold text-green-600">{pastOrders.filter(o => o.status === 'delivered').length}</div>
                                <div className="text-sm text-gray-600">Delivered</div>
                            </div>
                            <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                                <div className="text-2xl font-bold text-purple-600">{orders.length}</div>
                                <div className="text-sm text-gray-600">Total Orders</div>
                            </div>
                            <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                                <div className="text-2xl font-bold text-orange-600">₹0</div>
                                <div className="text-sm text-gray-600">Total Spent</div>
                            </div>
                        </div>

                        {/* Tab Navigation */}
                        <div className="flex space-x-1 mb-6 bg-gray-100 rounded-lg p-1">
                            <button
                                onClick={() => setActiveTab('current')}
                                className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${activeTab === 'current'
                                        ? 'bg-white text-purple-600 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-800'
                                    }`}
                            >
                                Current Orders ({currentOrders.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('past')}
                                className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${activeTab === 'past'
                                        ? 'bg-white text-purple-600 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-800'
                                    }`}
                            >
                                Past Orders ({pastOrders.length})
                            </button>
                        </div>

                        {/* Orders List */}
                        <div>
                            {activeTab === 'current' ? (
                                currentOrders.length > 0 ? (
                                    currentOrders.map(order => (
                                        <OrderCard key={order.id} order={order} />
                                    ))
                                ) : (
                                    <div className="text-center py-12 bg-white rounded-xl">
                                        <i className="fas fa-shopping-bag text-6xl text-gray-300 mb-4"></i>
                                        <h3 className="text-xl font-semibold text-gray-600 mb-2">No Active Orders</h3>
                                        <p className="text-gray-500 mb-6">You don't have any orders in progress right now</p>
                                        <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-colors">
                                            Start Ordering
                                        </button>
                                    </div>
                                )
                            ) : (
                                pastOrders.length > 0 ? (
                                    pastOrders.map(order => (
                                        <OrderCard key={order.id} order={order} />
                                    ))
                                ) : (
                                    <div className="text-center py-12 bg-white rounded-xl">
                                        <i className="fas fa-history text-6xl text-gray-300 mb-4"></i>
                                        <h3 className="text-xl font-semibold text-gray-600 mb-2">No Order History</h3>
                                        <p className="text-gray-500">Your completed orders will appear here</p>
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                </div>
                
                </>
            );
        };
export default MyOrdersPage