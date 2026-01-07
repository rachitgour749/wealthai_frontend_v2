import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectIsAuthenticated, selectUser, selectUserEmail } from '../store/slices/userSlice';
import { fetchProducts, selectProducts, selectSubscriptionLoading } from '../store/slices/subscriptionSlice';
import { getProductAccessStatus, getStatusLabel, isProductFaded } from '../utils/productAccess';
import products from '../Data/products';

const Home = ({ onLoginClick, setCurrentPage }) => {
    const dispatch = useDispatch();
    const [hoveredCard, setHoveredCard] = useState(null);
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const user = useSelector(selectUser);
    const userEmail = useSelector(selectUserEmail);
    const subscriptionProducts = useSelector(selectProducts);
    const loading = useSelector(selectSubscriptionLoading);


    // Fetch products on mount if authenticated
    useEffect(() => {
        if (isAuthenticated && user?.email) {
            dispatch(fetchProducts(user.email));
        }
    }, [isAuthenticated, user?.email, dispatch]);

    // Get product access information
    const getProductInfo = (productId) => {
        // If not authenticated, return subscribe status
        if (!isAuthenticated) {
            return { hasAccess: false, status: 'subscribe', subscription: null };
        }

        // If subscriptions haven't loaded yet, return subscribe (will update when loaded)
        if (!subscriptionProducts || !Array.isArray(subscriptionProducts)) {
            console.log('Subscriptions not loaded yet for product:', productId);
            return { hasAccess: false, status: 'subscribe', subscription: null };
        }

        // Get access status with loaded data
        return getProductAccessStatus(productId, subscriptionProducts, userEmail || user?.email);
    };

    // Handle product card click
    const handleProductClick = (product, productInfo) => {
        // Map product IDs to page names
        const pageMap = {
            'marketsai1': 'MarketsAi1',
            'chatai1': 'ChatAi1',
            'investai1': 'InvestAi1',
            'tradeai1': 'TradeAi1'
        };

        // Only navigate if user has access (trial or paid)
        if (productInfo.hasAccess) {
            const pageName = pageMap[product.id];
            if (pageName && setCurrentPage) {
                setCurrentPage(pageName);
            }
        } else {
            // If no access, show appropriate message
            if (productInfo.status === 'coming_soon') {
                alert(`${product.name} is coming soon!`);
            } else if (!isAuthenticated) {
                onLoginClick();
            } else {
                alert(`Please subscribe to ${product.name} to access this feature.`);
            }
        }
    };

    return (
        <div className="pt-[60px] md:pt-[70px] px-4 py-12">
            {/* Header Section */}
            <div className="max-w-7xl mx-auto text-center mb-20 animate-[fadeInDown_0.6s_ease-out]">
                {isAuthenticated && user ? (
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-12 mt-16">
                        <span className="text-wealth-900">Welcome Back, </span>
                        <span className="text-[#b7862c]">{user.name}</span>
                    </h1>
                ) : (
                    <>
                        <h1 className="text-4xl md:text-5xl lg:text-4xl font-bold text-wealth-900 mb-6 mt-12">
                            Welcome to WealthWisers
                        </h1>
                        <button
                            onClick={onLoginClick}
                            className="px-8 py-2 bg-[#2d6a6a] hover:bg-[#245555] text-white font-semibold rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
                        >
                            Sign In
                        </button>
                    </>
                )}
            </div>

            {/* Product Cards Grid */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-7">
                {products.map((product) => {
                    const productInfo = getProductInfo(product.id);
                    const isFaded = isProductFaded(productInfo.status);

                    return (
                        <div
                            key={product.id}
                            onClick={() => handleProductClick(product, productInfo)}
                            className={`
                                relative group
                                bg-gradient-to-br from-[#105953] via-[#0f5550] to-[#0d4a46]
                                rounded-xl
                                p-3
                                h-[150px]
                                flex flex-col justify-between
                                shadow-[0_10px_20px_rgba(0,0,0,0.25),0_6px_6px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.1)]
                                transition-all duration-500
                                before:absolute before:inset-0 before:rounded-xl before:bg-gradient-to-t before:from-black/20 before:to-transparent before:opacity-50
                                after:absolute after:inset-0 after:rounded-xl after:bg-gradient-to-br after:from-white/5 after:to-transparent after:opacity-0 after:transition-opacity after:duration-500
                                ${isFaded
                                    ? 'opacity-60 cursor-not-allowed'
                                    : 'hover:shadow-[0_20px_40px_rgba(0,0,0,0.35),0_10px_10px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.15)] transform hover:-translate-y-1 hover:scale-105 hover:after:opacity-100 cursor-pointer'
                                }
                            `}
                            onMouseEnter={() => !isFaded && setHoveredCard(product.id)}
                            onMouseLeave={() => !isFaded && setHoveredCard(null)}
                        >
                            {/* Card Content */}
                            <div className="relative z-10 transform transition-transform duration-500 group-hover:translate-z-10">
                                <div className="flex justify-between items-start mb-1">
                                    {/* Product Name */}
                                    <h3 className="text-xl font-bold text-[#e6ae5b] drop-shadow-sm group-hover:text-[#dea858] transition-colors">
                                        {product.name}
                                    </h3>

                                    {/* External Link Icon - Only for TradeAi1 */}
                                    {product.id === 'tradeai1' && (
                                        <div
                                            className="text-[#e6ae5b] hover:text-[#dea858] transition-colors cursor-pointer p-1"
                                            title="Open TradeAI"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                window.open('https://trade.wealthai1.in/', '_blank');
                                            }}
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-5 w-5"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                                strokeWidth={2}
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                            </svg>
                                        </div>
                                    )}
                                </div>

                                {/* Description */}
                                <p className="text-[#ede3d1] text-xs leading-relaxed mb-2">
                                    {product.description}
                                </p>
                            </div>

                            {/* Action Button */}
                            <div className="relative z-10">
                                {(() => {
                                    const productInfo = getProductInfo(product.id);
                                    const statusLabel = getStatusLabel(productInfo.status);
                                    const isFaded = isProductFaded(productInfo.status);

                                    // Coming Soon products
                                    if (isFaded) {
                                        return (
                                            <span className="inline-block bg-gray-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-inner">
                                                {statusLabel}
                                            </span>
                                        );
                                    }

                                    // Authenticated users
                                    if (isAuthenticated) {
                                        // Trial Active
                                        if (productInfo.status === 'trial') {
                                            return (
                                                <span className="inline-block bg-[#156c61] text-white text-[10px] font-semibold px-3 py-[3px] rounded-full shadow-md">
                                                    {statusLabel}
                                                </span>
                                            );
                                        }

                                        // Paid
                                        if (productInfo.status === 'paid') {
                                            return (
                                                <span className="inline-block bg-wealth-600 text-white text-[10px] font-semibold px-3 py-[3px] rounded-full bg-[#cb925fc7] shadow-md">
                                                    {statusLabel}
                                                </span>
                                            );
                                        }

                                        // Subscribe (no active subscription)
                                        return (
                                            <button
                                                onClick={() => {
                                                    alert(`Subscribe to ${product.name} - Payment integration coming soon!`);
                                                }}
                                                className="inline-block bg-[#a6824b] hover:bg-[#8f6d3e] text-white text-[10px] font-semibold px-4 py-[3px] rounded-full shadow-md transition-all duration-300 hover:shadow-lg"
                                            >
                                                {statusLabel}
                                            </button>
                                        );
                                    }

                                    // Non-authenticated users - show Sign In
                                    return (
                                        <button
                                            onClick={onLoginClick}
                                            className="inline-block bg-[#a6824b] hover:bg-[#8f6d3e] text-white text-[10px] font-semibold px-4 py-[3px] rounded-full shadow-md transition-all duration-300 hover:shadow-lg"
                                        >
                                            Sign In
                                        </button>
                                    );
                                })()}
                            </div>

                            {/* Animated Background Effect */}
                            <div
                                className={`absolute inset-0 rounded-2xl bg-white/5 transition-opacity duration-300 pointer-events-none
                                ${hoveredCard === product.id ? 'opacity-100' : 'opacity-0'}`}
                            />
                        </div>
                    );
                })}
            </div>

            {/* CSS Animations */}
            <style jsx>{`
                @keyframes fadeInDown {
                    from {
                        opacity: 0;
                        transform: translateY(-30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </div>
    );
};

export default Home;