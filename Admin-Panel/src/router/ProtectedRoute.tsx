import React, { useEffect } from 'react';
import { Route, Navigate, useLocation, Routes } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
interface ProtectedRouteProps {
    element: React.ReactElement;
    path: string;
}

const isTokenExpired = (token: string): boolean => {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ element, path }) => {
    const location = useLocation();
    const token = localStorage.getItem('token');
    const isExpired = token ? isTokenExpired(token) : true;
    useEffect(() => {
        
    },[]);
    return (
        <Routes>
            <Route
                path={path}
                element={
                    token && !isExpired ? (
                        element
                    ) : (
                        <Navigate
                            to="/auth/boxed-signin"
                            replace
                            state={{ from: location }}
                        />
                    )
                }
            />
        </Routes>
    );
};

export default ProtectedRoute;
