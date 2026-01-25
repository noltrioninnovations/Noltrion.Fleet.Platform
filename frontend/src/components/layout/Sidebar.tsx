import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard, Truck, Users, Settings, Briefcase,
    Calendar, Map, BarChart, ChevronDown, ChevronRight, User,
    ChevronsLeft, ChevronsRight,
    Building, FileText, ClipboardList, LogOut
} from 'lucide-react';
import { menuService, type MenuDto } from '../../services/menuService';
import { useAuth } from '../../contexts/AuthContext';

// Icon Mapper
const IconMap: any = {
    LayoutDashboard,
    Truck,
    Users,
    Settings,
    Briefcase,
    Calendar,
    Map,
    BarChart,
    User,
    Building,
    FileText,
    ClipboardList
};

const MenuItem = ({ item, depth = 0, isCollapsed }: { item: MenuDto, depth?: number, isCollapsed: boolean }) => {
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const hasChildren = item.children && item.children.length > 0;
    const Icon = IconMap[item.icon] || LayoutDashboard;

    const isActive = location.pathname === item.url || (hasChildren && item.children.some(c => location.pathname.startsWith(c.url)));

    useEffect(() => {
        if (isActive) setIsOpen(true);
    }, [isActive]);

    // If collapsed, only show top-level items or provide a different UX.
    // simpler approach for now: if collapsed and depth > 0, don't show (unless we do a popover, which is complex without a lib).
    // BETTER: If collapsed, clicking a parent expands the sidebar? Or just show tooltips.
    // For this refinement, let's say if you collapse, we hide children in the main flow.
    // BUT the requirement says "Grouped parent -> child menus".
    // Let's assume standard behavior: Collapsed = Icons only. If you click a parent, it might just toggle.
    // Actually, for a *dense* operational UI, often the sidebar is just toggled expanded when you need to navigate deep.

    // Styles
    const baseClasses = `flex items-center px-2 py-2 text-sm font-medium transition-all duration-200 group relative`; // Reduced px/py
    const activeClasses = `bg-slate-800 text-white border-l-4 border-red-500`; // Active dark with red accent
    const inactiveClasses = `text-slate-400 hover:bg-slate-800 hover:text-white border-l-4 border-transparent`; // Hover dark

    // Indentation for tree view
    const paddingLeft = isCollapsed ? 8 : (depth * 12 + 8); // Adjusted padding

    if (hasChildren) {
        return (
            <div className='relative'>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`w-full ${baseClasses} ${isActive ? 'text-white bg-slate-800 border-l-4 border-red-500' : 'text-slate-400 hover:text-white hover:bg-slate-800 border-l-4 border-transparent'} justify-between`}
                    style={{ paddingLeft: `${paddingLeft}px` }}
                    title={isCollapsed ? item.title : undefined}
                >
                    <div className="flex items-center">
                        <Icon className={`w-4 h-4 ${isCollapsed ? 'mx-auto' : 'mr-3'}`} />
                        {!isCollapsed && <span>{item.title}</span>}
                    </div>
                    {!isCollapsed && (isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />)}
                </button>

                {/* Children */}
                {!isCollapsed && isOpen && (
                    <div className="bg-slate-950/30">
                        {item.children.sort((a, b) => a.order - b.order).map(child => (
                            <MenuItem key={child.id} item={child} depth={depth + 1} isCollapsed={isCollapsed} />
                        ))}
                    </div>
                )}
            </div>
        );
    }

    return (
        <Link
            to={item.url}
            className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
            style={{ paddingLeft: `${paddingLeft}px` }}
            title={isCollapsed ? item.title : undefined}
        >
            <Icon className={`w-4 h-4 ${isCollapsed ? 'mx-auto' : 'mr-3'} flex-shrink-0`} />
            {!isCollapsed && <span className="truncate">{item.title}</span>}

            {isCollapsed && (
                <div className="absolute left-full top-0 ml-2 px-2 py-1 bg-red-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-lg border border-red-600">
                    {item.title}
                </div>
            )}
        </Link>
    );
};

export const Sidebar = () => {
    const { user, logout } = useAuth();
    const [menus, setMenus] = useState<MenuDto[]>([]);
    const [isCollapsed, setIsCollapsed] = useState(false);

    useEffect(() => {
        const loadMenus = async () => {
            // Demo Logic: Override menu service for Customer Portal extension
            const isCustomer = user?.roles?.some(r => r.toLowerCase() === 'customer');

            if (isCustomer) {
                setMenus([
                    { id: '1', title: 'Dashboard', url: '/dashboard', icon: 'LayoutDashboard', order: 1, code: 'DASH', children: [] },
                    { id: '2', title: 'My Requests', url: '/portal/requests', icon: 'ClipboardList', order: 2, code: 'REQ', children: [] },
                    { id: '3', title: 'My Manifests', url: '/portal/manifests', icon: 'Truck', order: 3, code: 'MAN', children: [] },
                    { id: '4', title: 'Invoices', url: '/invoices', icon: 'FileText', order: 4, code: 'INV', children: [] },
                ]);
            } else {
                // Internal Users
                try {
                    const data = await menuService.getMyMenus();

                    setMenus(data);
                } catch (err) {
                    console.error("Failed to load menus", err);
                }
            }
        };
        if (user) loadMenus(); // Only load if user exists to avoid race conditions or null checks failing later

        // Load persist state
        const savedState = localStorage.getItem('sidebar-collapsed');
        if (savedState) setIsCollapsed(savedState === 'true');
    }, []);

    const toggleCollapse = () => {
        const newState = !isCollapsed;
        setIsCollapsed(newState);
        localStorage.setItem('sidebar-collapsed', String(newState));
    };

    return (
        <aside
            className={`${isCollapsed ? 'w-14' : 'w-52'} bg-slate-950 flex-shrink-0 flex flex-col border-r border-slate-800 transition-all duration-300 ease-in-out relative z-20 shadow-xl`}
        >
            {/* Branding */}
            <div className={`h-14 flex items-center ${isCollapsed ? 'justify-center px-0' : 'px-4'} border-b border-slate-800 bg-slate-950 transition-all`}>
                <div className="flex items-center justify-center">
                    <img src="/logo.png" alt="FleetX" className="h-6 w-6" />
                    {!isCollapsed && <span className="ml-2 text-md font-bold text-white tracking-tight animate-fade-in">FleetX</span>}
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-3 space-y-0.5 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-slate-700">
                {menus.length === 0 && !isCollapsed && (
                    <div className="px-4 text-xs text-slate-500">Loading...</div>
                )}
                {menus.sort((a, b) => a.order - b.order).map(menu => (
                    <div key={menu.id}>
                        <MenuItem item={menu} isCollapsed={isCollapsed} />
                    </div>
                ))}
            </nav>

            {/* Footer Actions */}
            <div className="border-t border-slate-800 bg-slate-950">
                <button
                    onClick={toggleCollapse}
                    className="w-full h-10 flex items-center justify-center text-slate-500 hover:text-white hover:bg-slate-800 transition-colors"
                >
                    {isCollapsed ? <ChevronsRight size={18} /> : <ChevronsLeft size={18} />}
                </button>

                {/* User Profile */}
                <div className={`p-4 ${isCollapsed ? 'flex flex-col items-center' : ''}`}>
                    <div className={`flex items-center ${isCollapsed ? 'justify-center mb-2' : 'mb-3'}`}>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-lg flex-shrink-0">
                            {(user?.firstName || user?.username || 'U').charAt(0).toUpperCase()}
                        </div>
                        {!isCollapsed && (
                            <div className="ml-3 overflow-hidden">
                                <p className="text-sm font-medium text-white truncate">
                                    {user?.firstName ? `${user.firstName} ${user.lastName || ''}` : user?.username}
                                </p>
                                <p className="text-[10px] text-slate-400 truncate uppercase tracking-wider">
                                    {user?.roles && user.roles.length > 0 ? user.roles[0] : 'User'}
                                </p>
                            </div>
                        )}
                    </div>

                    {!isCollapsed ? (
                        <button
                            onClick={logout}
                            className="w-full flex items-center justify-center px-4 py-1.5 border border-slate-700 rounded text-xs font-medium text-slate-300 bg-slate-900 hover:bg-red-900/20 hover:text-red-400 hover:border-red-900/50 transition-all"
                        >
                            Sign Out
                        </button>
                    ) : (
                        <button onClick={logout} title="Sign Out" className="text-slate-400 hover:text-red-400">
                            <LogOut size={20} />
                        </button>
                    )}
                </div>
            </div>
        </aside>
    );
};
