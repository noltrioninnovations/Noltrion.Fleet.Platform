import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, LoginRequest } from '../types/auth';
import { authService } from '../services/authService';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (credentials: LoginRequest) => Promise<string | null>; // Returns error message or null if success
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    // const navigate = useNavigate(); // Can't use inside generic provider if not inside Router. App structure matters.

    useEffect(() => {
        const storedUser = authService.getCurrentUser();
        if (storedUser) {
            setUser(storedUser);
        }
        setIsLoading(false);
    }, []);

    const login = async (credentials: LoginRequest): Promise<string | null> => {
        setIsLoading(true);
        try {
            const result = await authService.login(credentials);
            if (result.success && result.data) {
                const { token, ...userData } = result.data;
                // Store minimal user info
                const userObj: User = {
                    username: userData.username,
                    email: userData.email,
                    roles: (userData as any).roles || []
                };

                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(userObj));
                setUser(userObj);
                return null;
            } else {
                return result.errors ? result.errors[0] : 'Login failed';
            }
        } catch (error) {
            return 'An error occurred during login';
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        authService.logout();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
