import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { store } from './store/store.js';
import './index.css';
import App from './App.jsx';

const GOOGLE_CLIENT_ID = '503421457549-215abjb62mkqh341rvi04de2b2arqld6.apps.googleusercontent.com';

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <Provider store={store}>
            <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
                <App />
            </GoogleOAuthProvider>
        </Provider>
    </StrictMode>,
);
