import { useSelector } from 'react-redux';
import { selectUser, selectIsAuthenticated } from '../store/slices/userSlice';

export const useAuth = () => {
    const user = useSelector(selectUser);
    const isAuthenticated = useSelector(selectIsAuthenticated);

    return {
        user,
        isAuthenticated
    };
};
