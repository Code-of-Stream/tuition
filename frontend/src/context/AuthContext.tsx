import React, { createContext, useContext, useEffect, useMemo, ReactNode } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { jwtDecode } from 'jwt-decode';
import { useGetMeQuery } from '@/services/api';
import { logout, selectCurrentUser, selectIsAuthenticated, setCredentials } from '@/store/slices/authSlice';
import { ROLES, ROUTES } from '@/constants';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userData: User, token: string) => void;
  logout: () => void;
  hasRole: (roles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  
  const user = useSelector(selectCurrentUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const token = localStorage.getItem('token');
  
  // Fetch user data if token exists but user data is not in store
  const { data: meResponse, isLoading, isFetching, isError } = useGetMeQuery(undefined, {
    skip: !token || isAuthenticated,
    refetchOnMountOrArgChange: true,
  });

  // Check if token is expired
  useEffect(() => {
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        
        if (decodedToken.exp < currentTime) {
          handleLogout();
        } else if (!isAuthenticated && !isFetching && !isError) {
          // Token is valid; when /auth/me resolves, hydrate user into the store
          const userFromApi = (meResponse as any)?.data;
          if (userFromApi) {
            dispatch(setCredentials({ user: userFromApi, token }));
          }
        }
      } catch (error) {
        console.error('Error decoding token:', error);
        handleLogout();
      }
    }
  }, [token, isAuthenticated, isFetching, isError, meResponse, dispatch]);

  const login = (userData: User, token: string) => {
    dispatch(setCredentials({ user: userData, token }));
    const from = location.state?.from?.pathname || ROUTES.HOME;
    navigate(from, { replace: true });
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate(ROUTES.LOGIN, { replace: true });
  };

  const hasRole = (roles: string[]): boolean => {
    if (!user?.role) return false;
    return roles.includes(user.role);
  };

  const value = useMemo(
    () => ({
      user,
      isAuthenticated,
      isLoading: isLoading || isFetching,
      login,
      logout: handleLogout,
      hasRole,
    }),
    [user, isAuthenticated, isLoading, isFetching]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles = [],
  redirectTo = ROUTES.UNAUTHORIZED,
}) => {
  const { isAuthenticated, isLoading, hasRole } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div>Loading...</div>; // Or a loading spinner
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !hasRole(allowedRoles)) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default AuthContext;
