import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Flame, Clock, User, Plus, MessageSquare, Bell } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

export default function BottomNav({ userType, unreadMessagesCount = 0 }) {
  const [userId, setUserId] = React.useState(null);

  React.useEffect(() => {
    base44.auth.me().then(user => setUserId(user?.id)).catch(() => {});
  }, []);

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', userId],
    queryFn: () => base44.entities.Notification.filter({ user_id: userId, is_read: false }),
    enabled: !!userId,
    refetchInterval: 5000
  });

  const unreadNotificationsCount = notifications.length;
  const location = useLocation();
  
  const isActive = (path) => {
    const currentPath = location.pathname;
    return currentPath.includes(path);
  };

  let navItems = [];

  if (userType === 'teacher') {
    // Teacher: Feed, Create (FAB), Profile
    navItems = [
      { 
        icon: Flame, 
        label: 'Фид', 
        path: 'Feed',
        active: isActive('/Feed') || location.pathname === '/'
      },
      {
        icon: Plus,
        label: 'Создать',
        path: 'CreateLesson',
        active: isActive('/CreateLesson'),
        accent: true
      },
      { 
        icon: User, 
        label: 'Профиль', 
        path: 'Profile',
        active: isActive('/Profile')
      }
    ];
  } else {
    // Student: Feed, Chats, Notifications, History, Profile
    navItems = [
      { 
        icon: Flame, 
        label: 'Фид', 
        path: 'Feed',
        active: isActive('/Feed') || location.pathname === '/'
      },
      { 
        icon: MessageSquare, 
        label: 'Чаты', 
        path: 'Chats',
        active: isActive('/Chats') || isActive('/Chat'),
        badge: unreadMessagesCount
      },
      { 
        icon: Bell, 
        label: 'Уведомления', 
        path: 'Notifications',
        active: isActive('/Notifications'),
        badge: unreadNotificationsCount
      },
      { 
        icon: Clock, 
        label: 'История', 
        path: 'History',
        active: isActive('/History')
      },
      { 
        icon: User, 
        label: 'Профиль', 
        path: 'Profile',
        active: isActive('/Profile')
      }
    ];
  }

  if (userType === 'teacher') {
    // Teacher layout: Feed - FAB - Profile
    return (
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 pb-safe z-50">
        <div className="grid grid-cols-3 items-center max-w-lg mx-auto h-20 relative">
          {/* Feed */}
          <Link
            to={createPageUrl('Feed')}
            className={`flex flex-col items-center justify-center transition-all ${
              navItems[0].active ? 'text-orange-500' : 'text-gray-400'
            }`}
          >
            <Flame className={`w-6 h-6 ${navItems[0].active ? 'stroke-[2.5]' : ''}`} />
            <span className="text-xs mt-1 font-medium">Фид</span>
          </Link>
          
          {/* FAB Create */}
          <Link
            to={createPageUrl('CreateLesson')}
            className="flex flex-col items-center justify-center -mt-2"
          >
            <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-xl ${
              navItems[1].active 
                ? 'bg-gradient-to-r from-orange-600 to-red-600' 
                : 'bg-gradient-to-r from-orange-500 to-red-500'
            }`}>
              <Plus className="w-8 h-8 text-white" />
            </div>
            <span className="text-xs text-gray-500 mt-1 font-medium">
              Разместить слот
            </span>
          </Link>
          
          {/* Profile */}
          <Link
            to={createPageUrl('Profile')}
            className={`flex flex-col items-center justify-center transition-all ${
              navItems[2].active ? 'text-orange-500' : 'text-gray-400'
            }`}
          >
            <User className={`w-6 h-6 ${navItems[2].active ? 'stroke-[2.5]' : ''}`} />
            <span className="text-xs mt-1 font-medium">Профиль</span>
          </Link>
        </div>
      </nav>
    );
  }

  // Student layout: 5 items
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 pb-safe z-50">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto px-2">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={createPageUrl(item.path)}
            className={`flex flex-col items-center justify-center flex-1 transition-all ${
              item.active ? 'text-orange-500' : 'text-gray-400'
            }`}
          >
            <div className="relative">
              <item.icon className={`w-5 h-5 ${item.active ? 'stroke-[2.5]' : ''}`} />
              {item.badge > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                  {item.badge > 9 ? '9+' : item.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-1 font-medium whitespace-nowrap">
              {item.label}
            </span>
          </Link>
        ))}
      </div>
    </nav>
  );
}