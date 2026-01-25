import { Outlet, useLocation } from 'react-router-dom';
import { Bell, Menu } from 'lucide-react';
import { Sidebar } from './Sidebar';

export const MainLayout = () => {
    const location = useLocation();
    // const { user } = useAuth(); // Not used directly here anymore if Sidebar handles it? Header uses it? No, Sidebar has user profile. Header only has Bell/Title.

    // Header title logic
    const getPageTitle = (pathname: string) => {
        if (pathname === '/') return 'Dashboard';
        const segments = pathname.split('/').filter(Boolean);
        return segments.length > 0
            ? segments[0].charAt(0).toUpperCase() + segments[0].slice(1)
            : 'Dashboard';
    };

    return (
        <div className="flex h-screen bg-background">
            {/* Sidebar - Dynamic */}
            <Sidebar />

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header */}
                <header className="h-12 bg-white border-b border-slate-200 flex items-center justify-between px-4 shadow-sm z-10">
                    <div className="flex items-center">
                        <button className="p-1 mr-3 rounded-md text-slate-500 hover:bg-slate-100 lg:hidden">
                            <Menu size={18} />
                        </button>
                        <nav className="flex items-center text-sm font-medium text-slate-500">
                            <span>FleetX</span>
                            <span className="mx-2 text-slate-300">/</span>
                            <span className="text-slate-800 font-semibold">{getPageTitle(location.pathname)}</span>
                        </nav>
                    </div>
                    <div className="flex items-center space-x-3">
                        <button className="p-1.5 text-slate-400 hover:text-slate-600 relative rounded-full hover:bg-slate-50">
                            <Bell size={18} />
                            <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full ring-2 ring-white"></span>
                        </button>
                    </div>
                </header>

                {/* Scrollable Content */}
                <main className="flex-1 overflow-auto bg-slate-50 p-4">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};
