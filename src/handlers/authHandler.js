import store from '../store/store';
import Cookies from 'js-cookie';
import { loginUser, logoutUser } from '../store/slices/userSlice';
import { fetchProducts, clearSubscriptionData } from '../store/slices/subscriptionSlice';
import { resetNavigation } from '../store/slices/navigationSlice';
import * as authService from '../api/services/authService';

/**
 * Helper to set SSO cookie on the shared parent domain
 * @param {string} token 
 */
const setSSOCookie = (token) => {
    try {
        const domain = window.location.hostname.includes('wealthai1.in') ? '.wealthai1.in' : window.location.hostname;
        Cookies.set('sso_token', token, {
            domain: domain,
            path: '/',
            expires: 7, // 7 days
            secure: true,
            sameSite: 'lax'
        });

    } catch (e) {
        console.error('Error setting SSO cookie:', e);
    }
};

/**
 * Helper to clear SSO cookie
 */
const clearSSOCookie = () => {
    try {
        const domain = window.location.hostname.includes('wealthai1.in') ? '.wealthai1.in' : window.location.hostname;
        Cookies.remove('sso_token', { domain: domain, path: '/' });

    } catch (e) {
        console.error('Error clearing SSO cookie:', e);
    }
};

/**
 * Handle successful Google OAuth login
 * @param {object} credentialResponse - Google OAuth response
 */
export const handleGoogleLoginSuccess = async (credentialResponse) => {
    try {


        // Get the Google token
        const googleToken = credentialResponse.credential;

        if (!googleToken) {
            throw new Error('No credential received from Google');
        }



        // Call backend API to exchange Google token for JWT
        const response = await authService.googleLogin(googleToken);



        const { token, user } = response;

        if (!token) {
            console.error('No token in response:', response);
            throw new Error('No authentication token received from server');
        }

        if (!user) {
            console.error('No user data in response:', response);
            throw new Error('No user data received from server');
        }

        // Decode Google JWT to get user info (for display purposes)
        const base64Url = googleToken.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        const googleUserInfo = JSON.parse(jsonPayload);



        // Dispatch login action with user data and token
        store.dispatch(loginUser({
            googleId: googleUserInfo.sub,
            email: googleUserInfo.email,
            name: googleUserInfo.name,
            picture: googleUserInfo.picture,
            givenName: googleUserInfo.given_name,
            familyName: googleUserInfo.family_name,
            familyName: googleUserInfo.family_name,
            token: token, // JWT token from backend
            role: user.role, // Role from backend response
        }));

        // Set SSO cookie for other applications (TradeAI)
        setSSOCookie(token);



        // Fetch user's subscription products
        try {

            const resultAction = await store.dispatch(fetchProducts(googleUserInfo.email));

            // Check if products fetch was successful
            if (fetchProducts.fulfilled.match(resultAction)) {
                const products = resultAction.payload;


                // Trial popup will be shown automatically by subscriptionSlice
                // if products array is empty
            } else {
                console.error('Failed to fetch products:', resultAction.error);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
        }

    } catch (error) {
        console.error('Login error:', error);
        console.error('Error details:', {
            message: error.message,
            status: error.status,
            data: error.data
        });

        // Show user-friendly error message
        let errorMessage = 'Login failed. Please try again.';

        if (error.message) {
            errorMessage = error.message;
        } else if (error.status === 0) {
            errorMessage = 'Cannot connect to server. Please check if the backend is running.';
        } else if (error.status === 401) {
            errorMessage = 'Authentication failed. Please try again.';
        } else if (error.status === 500) {
            errorMessage = 'Server error. Please try again later.';
        }

        alert(errorMessage);
    }
};

/**
 * Handle Google OAuth login error
 * @param {object} error - Error object
 */
export const handleGoogleLoginError = (error) => {
    console.error('Google Login Error:', error);
    alert('Google login failed. Please try again.');
};

/**
 * Handle user logout
 */
export const handleLogout = () => {
    try {
        // Clear subscription data
        store.dispatch(clearSubscriptionData());

        // Logout user
        store.dispatch(logoutUser());

        // Reset navigation to home page
        store.dispatch(resetNavigation());

        // Clear SSO cookie
        clearSSOCookie();


    } catch (error) {
        console.error('Logout error:', error);
    }
};

export default {
    handleGoogleLoginSuccess,
    handleGoogleLoginError,
    handleLogout,
};
