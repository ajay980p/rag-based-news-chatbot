import { useState } from 'react';

/**
 * Custom hook for managing sidebar state
 */
export const useSidebar = () => {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarCollapsed(!isSidebarCollapsed);
    };

    return {
        isSidebarCollapsed,
        toggleSidebar
    };
};