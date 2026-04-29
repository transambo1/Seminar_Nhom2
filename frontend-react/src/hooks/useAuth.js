import { useState, useEffect } from 'react';

export const useAuth = () => {
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || 'null'));
    return { user, isAuthenticated: !!user };
};
