import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  QrCode,
  CalendarCheck,
  UtensilsCrossed,
  ScrollText,
  Settings,
  Users,
  X,
} from 'lucide-react';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, hasRole } = useAuth();

  const navItems = [
    {
      to: '/dashboard',
      label: 'Admin Dashboard',
      icon: LayoutDashboard,
      roles: ['SUPER_ADMIN'] as const,
      color: 'text-violet-400',
    },
    {
      to: '/reception',
      label: 'Reception Desk',
      icon: QrCode,
      roles: ['SUPER_ADMIN', 'RECEPTION'] as const,
      color: 'text-cyan-400',
    },
    {
      to: '/events',
      label: 'Event Desks (15)',
      icon: CalendarCheck,
      roles: ['SUPER_ADMIN', 'EVENT_COORDINATOR'] as const,
      color: 'text-amber-400',
    },
    {
      to: '/food',
      label: 'Food Counter',
      icon: UtensilsCrossed,
      roles: ['SUPER_ADMIN', 'FOOD_COUNTER'] as const,
      color: 'text-emerald-400',
    },
    {
      to: '/audit',
      label: 'Live Audit Log',
      icon: ScrollText,
      roles: ['SUPER_ADMIN'] as const,
      color: 'text-indigo-400',
    },
    {
      to: '/admin/qr-generator',
      label: 'QR Inventory Generator',
      icon: QrCode,
      roles: ['SUPER_ADMIN'] as const,
      color: 'text-pink-400',
    },
    {
      to: '/settings',
      label: 'Station Settings',
      icon: Settings,
      roles: ['SUPER_ADMIN', 'RECEPTION', 'EVENT_COORDINATOR', 'FOOD_COUNTER'] as const,
      color: 'text-slate-400',
    },
  ];

  const visibleItems = navItems.filter((item) => hasRole([...item.roles]));

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden animate-in fade-in"
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 border-r border-slate-800 bg-[#090D16] flex flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header on mobile */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between lg:hidden">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-cyan-500 flex items-center justify-center font-bold text-white text-sm">
              E
            </div>
            <span className="font-bold text-slate-100">Operations Menu</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto p-4 space-y-1.5">
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-500 px-3 py-1 font-semibold">
            Workstations
          </div>

          {visibleItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all ${
                    isActive
                      ? 'bg-slate-800/90 text-white border border-slate-700 shadow-md'
                      : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                  }`
                }
              >
                <Icon className={`w-4 h-4 ${item.color}`} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>

        {/* User Card at bottom */}
        {user && (
          <div className="p-4 border-t border-slate-800 bg-slate-900/40">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-bold">
                {user.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-slate-200 truncate">{user.name}</div>
                <div className="text-[10px] font-mono text-cyan-400 truncate uppercase">{user.role.replace('_', ' ')}</div>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};
