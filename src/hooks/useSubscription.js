import { useSelector } from 'react-redux';
import { selectProducts, selectUserSubscription } from '../store/slices/subscriptionSlice';
import { PRODUCT_ID_TO_CODE } from '../utils/productAccess';

export const useSubscription = () => {
    const products = useSelector(selectProducts);
    const subscriptionDetails = useSelector(selectUserSubscription);

    const getProductStatus = (productId) => {
        if (!productId) return null;
        const productCode = PRODUCT_ID_TO_CODE[productId.toLowerCase()];
        if (!productCode) return null;

        const product = products.find(p => p.product_code === productCode);
        return product || null;
    };

    const isProductActive = (productId) => {
        const product = getProductStatus(productId);
        if (!product) return false;

        const currentDate = new Date();
        const endDate = new Date(product.subscription_end_date);
        return product.status === 'active' && currentDate <= endDate;
    };

    const isProductInTrial = (productId) => {
        const product = getProductStatus(productId);
        return product && product.subscription_type === 'trial' && isProductActive(productId);
    };

    const getProductDaysRemaining = (productId) => {
        const product = getProductStatus(productId);
        if (!product || !isProductActive(productId)) return 0;

        const currentDate = new Date();
        const endDate = new Date(product.subscription_end_date);
        const diffTime = endDate - currentDate;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 0;
    };

    return {
        isProductActive,
        isProductInTrial,
        getProductDaysRemaining,
        products,
        subscriptionDetails
    };
};
