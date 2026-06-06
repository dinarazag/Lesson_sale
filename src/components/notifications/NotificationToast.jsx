import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageSquare, Calendar, Bell } from 'lucide-react';

export default function NotificationToast({ userId }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [visibleNotifications, setVisibleNotifications] = useState([]);

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', userId],
    queryFn: () => base44.entities.Notification.filter(
      { user_id: userId, is_read: false }, 
      '-created_date'
    ),
    enabled: !!userId,
    refetchInterval: 5000
  });

  useEffect(() => {
    const newNotifications = notifications.filter(
      n => !visibleNotifications.find(v => v.id === n.id)
    );
    
    if (newNotifications.length > 0) {
      setVisibleNotifications(prev => [...newNotifications, ...prev].slice(0, 3));
    }
  }, [notifications]);

  const handleDismiss = async (notification) => {
    setVisibleNotifications(prev => prev.filter(n => n.id !== notification.id));
    await base44.entities.Notification.update(notification.id, { is_read: true });
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
  };

  const handleClick = async (notification) => {
    if (notification.link) {
      navigate(notification.link);
    }
    await handleDismiss(notification);
  };

  const getIcon = (type) => {
    switch (type) {
      case 'new_message':
        return <MessageSquare className="w-5 h-5 text-blue-500" />;
      case 'new_booking':
      case 'booking_confirmed':
        return <Calendar className="w-5 h-5 text-green-500" />;
      default:
        return <Bell className="w-5 h-5 text-orange-500" />;
    }
  };

  return (
    <div className="fixed top-4 right-4 z-[100] space-y-2 max-w-sm">
      <AnimatePresence>
        {visibleNotifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.8 }}
            className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 cursor-pointer hover:shadow-2xl transition-shadow"
            onClick={() => handleClick(notification)}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center">
                {getIcon(notification.type)}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 text-sm mb-1">
                  {notification.title}
                </h4>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {notification.message}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDismiss(notification);
                }}
                className="flex-shrink-0 p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}