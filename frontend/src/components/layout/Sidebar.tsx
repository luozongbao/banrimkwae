import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '../../lib/utils'
import { useAuth } from '../../hooks/useAuth'
import {
  HomeIcon,
  UsersIcon,
  ShieldCheckIcon,
  Cog6ToothIcon,
  BuildingOfficeIcon,
  CalendarDaysIcon,
  PlayIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

interface NavItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  permission?: string
  badge?: string
  children?: NavItem[]
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { 
    name: 'User Management', 
    href: '/users', 
    icon: UsersIcon, 
    permission: 'users.view',
    children: [
      { name: 'Users', href: '/users', icon: UsersIcon, permission: 'users.view' },
      { name: 'Roles', href: '/roles', icon: ShieldCheckIcon, permission: 'roles.view' },
    ]
  },
  { 
    name: 'Accommodations', 
    href: '/accommodations', 
    icon: BuildingOfficeIcon,
    badge: 'Phase 2'
  },
  { 
    name: 'Bookings', 
    href: '/bookings', 
    icon: CalendarDaysIcon,
    badge: 'Phase 2'
  },
  { 
    name: 'Activities', 
    href: '/activities', 
    icon: PlayIcon,
    badge: 'Phase 2'
  },
  { 
    name: 'Restaurant', 
    href: '/restaurant', 
    icon: ChartBarIcon,
    badge: 'Phase 3'
  },
  { 
    name: 'Settings', 
    href: '/settings', 
    icon: Cog6ToothIcon, 
    permission: 'settings.view'
  },
]

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation()
  const { user } = useAuth()

  const hasPermission = (permission?: string) => {
    if (!permission) return true
    return user?.permissions?.includes(permission)
  }

  const filteredNavigation = navigation.filter(item => hasPermission(item.permission))

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-full w-64 bg-off-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out z-50',
          'lg:relative lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo section */}
          <div className="flex items-center h-16 px-6 border-b border-gray-200">
            <Link to="/dashboard" className="flex items-center" onClick={onClose}>
              <img
                src="/logo.png"
                alt="Banrimkwae Resort"
                className="h-8 w-auto"
                onError={(e) => {
                  e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iNCIgZmlsbD0iIzJFODZBQiIvPgo8dGV4dCB4PSIxNiIgeT0iMjAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5CUjwvdGV4dD4KPHN2Zz4K'
                }}
              />
              <span className="ml-2 text-lg font-semibold text-dark-charcoal">
                Banrimkwae
              </span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {filteredNavigation.map((item) => {
              const isActive = location.pathname.startsWith(item.href)
              
              return (
                <div key={item.name}>
                  <Link
                    to={item.href}
                    onClick={onClose}
                    className={cn(
                      'flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-resort-blue-100 text-resort-blue-700'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    )}
                  >
                    <div className="flex items-center">
                      <item.icon className="w-5 h-5 mr-3" />
                      {item.name}
                    </div>
                    {item.badge && (
                      <span className="px-2 py-1 text-xs font-medium bg-warm-orange-100 text-warm-orange-700 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                  
                  {/* Subnav items */}
                  {item.children && isActive && (
                    <div className="ml-8 mt-2 space-y-1">
                      {item.children
                        .filter(child => hasPermission(child.permission))
                        .map((child) => (
                          <Link
                            key={child.name}
                            to={child.href}
                            onClick={onClose}
                            className={cn(
                              'flex items-center px-3 py-2 rounded-md text-sm transition-colors',
                              location.pathname === child.href
                                ? 'bg-resort-blue-50 text-resort-blue-600'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            )}
                          >
                            <child.icon className="w-4 h-4 mr-2" />
                            {child.name}
                          </Link>
                        ))}
                    </div>
                  )}
                </div>
              )
            })}
          </nav>

          {/* User info */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center">
              <img
                src={user?.avatar_url}
                alt={user?.name}
                className="w-10 h-10 rounded-full"
              />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.roles?.[0]}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
