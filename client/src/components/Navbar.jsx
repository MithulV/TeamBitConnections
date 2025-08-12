import React, { useState, useMemo } from 'react';
import { ChevronRight, ChevronLeft, House, LogOut, CheckSquare, Shield, NotebookText } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/AuthStore';

function Navbar() {
    const { pathname } = useLocation();
    const [collapsed, setCollapsed] = useState(false);
    const navigate = useNavigate();
    const { role, clearAuth } = useAuthStore(); // Get role and clearAuth from the store

    // Define menu items for each role
    const menuItemsByRole = {
        user: [
            { name: "Home", icon: <House size={20} />, path: "/" },
        ],
        cata: [
            { name: "Home", icon: <House size={20} />, path: "/" },
            { name: "Verify Records", icon: <CheckSquare size={20} />, path: "/verify-records" },
        ],
        catb: [
            { name: "Home", icon: <House size={20} />, path: "/" },
            { name: "Verify Records", icon: <CheckSquare size={20} />, path: "/verify-records" },
        ],
        catc: [
            { name: "Home", icon: <House size={20} />, path: "/" },
            { name: "Verify Records", icon: <CheckSquare size={20} />, path: "/verify-records" },
        ],
        admin: [
            { name: "Admin Panel", icon: <Shield size={20} />, path: "/" },
        ],
    };

    // Get the menu items for the current role
    const currentMenuItems = menuItemsByRole[role] || [];

    const handleLogout = () => {
        clearAuth();
        localStorage.removeItem('token');
        navigate('/login');
    };
    const menuTopItems = [
        { name: "Home", icon: <House size={20} />, path: "/" },
        { name: "entries", icon: <NotebookText size={20} />, path: "/entries"},
    ]

    const menuBottomItems = [
        { name: "Logout", icon: <LogOut size={20} />, action: handleLogout },
    ];

    const isActive = (path) => pathname === path;

    // Don't render the navbar if there's no role (i.e., user is not logged in)
    if (!role) {
        return null;
    }

    return (
        <div className={`h-screen bg-white border-r border-gray-200 transition-all duration-300 flex flex-col ${collapsed ? 'w-20' : 'w-58'}`}>
            {/* Header with toggle */}
            <div className="flex items-center justify-between p-4 ml-1.5">
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className={`p-2 rounded-full hover:bg-gray-100 transition-colors `}
                    aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                    {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                </button>
            </div>
            <hr className="border-0 border-t border-gray-300 mx-4 opacity-60" />

            {/* Top Menu Items */}
            <div className="p-4 flex-1">
                <div className="space-y-2">
                    {currentMenuItems.map((menuItem, index) => {
                        const active = isActive(menuItem.path)
                        return (
                            <div key={index}>
                                <button
                                    className={`w-full flex items-center gap-3 p-3 rounded-sm text-left transition-all duration-200 group
                                        ${active
                                            ? 'bg-[#4071f4]'
                                            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                                        }`}
                                    title={collapsed ? menuItem.name : undefined}
                                    onClick={() => navigate(menuItem.path)}
                                >
                                    <span className={`flex-shrink-0 transition-all duration-200 ${collapsed ? 'pl-0.5' : 'pl-2'} ${active ? 'text-white' : 'text-gray-500 group-hover:text-gray-700'}`}>
                                        {menuItem.icon}
                                    </span>
                                    <span className={`font-medium pl-1 transition-all duration-200 ${collapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100 '} ${active ? 'text-white' : 'text-gray-500 group-hover:text-gray-700'} `}>
                                        {menuItem.name}
                                    </span>
                                </button>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Divider */}
            <hr className="border-0 border-t border-gray-300 mx-4 opacity-60" />

            {/* Bottom Menu Items */}
            <div className="p-4 mt-auto">
                <div className="space-y-2">
                    {menuBottomItems.map((menuItem, index) => {
                        const active = isActive(menuItem.path)
                        return (
                            <div key={index}>
                                <button
                                    className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all duration-200 group
                                        ${active
                                            ? 'bg-red-50 text-red-700 border border-red-200'
                                            : 'hover:bg-gray-50 hover:text-gray-900'
                                        }`}
                                    title={collapsed ? menuItem.name : undefined}
                                    onClick={menuItem.action}
                                >
                                    <span className={`flex-shrink-0 transition-all duration-200 ${collapsed ? 'pl-0.5' : 'pl-2'} text-[#787878] ${active ? 'text-red-700' : 'text-gray-500'}`}>
                                        {menuItem.icon}
                                    </span>
                                    <span className={`font-medium pl-1 transition-all duration-200 text-[#787878] ${collapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>
                                        {menuItem.name}
                                    </span>
                                </button>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    );
}

export default Navbar;
