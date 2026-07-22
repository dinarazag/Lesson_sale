import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Loader2, MessageSquare, ArrowLeft } from 'lucide-react';
import ChatListItem from '@/components/chat/ChatListItem';
import BottomNav from '@/components/ui/BottomNav';

export default function Chats() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const userData = await base44.auth.me();
    setUser(userData);
  };

  const { data: chats = [], isLoading, refetch } = useQuery({
    queryKey: ['chats', user?.id, user?.user_type],
    queryFn: async () => {
      if (user.user_type === 'teacher') {
        return base44.entities.Chat.filter({ teacher_id: user.id }, '-last_message_at');
      } else {
        return base44.entities.Chat.filter({ student_id: user.id }, '-last_message_at');
      }
    },
    enabled: !!user,
    refetchInterval: 5000 // Refetch every 5 seconds for new messages
  });

  // Calculate total unread count
  const totalUnread = chats.reduce((sum, chat) => {
    return sum + (user?.user_type === 'teacher' ? chat.unread_count_teacher : chat.unread_count_student);
  }, 0);

  useEffect(() => {
    // Update page title with unread count
    if (totalUnread > 0) {
      document.title = `(${totalUnread}) Сообщения - Lesson Sale`;
    } else {
      document.title = 'Сообщения - Lesson Sale';
    }
  }, [totalUnread]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white sticky top-0 z-40 px-4 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <MessageSquare className="w-5 h-5 text-orange-500" />
          <h1 className="text-lg font-semibold text-gray-900">Сообщения</h1>
          {totalUnread > 0 && (
            <span className="ml-auto bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
              {totalUnread}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-4">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          </div>
        ) : chats.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Нет сообщений</h3>
            <p className="text-gray-500">
              После бронирования урока здесь появится чат
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {chats.map((chat) => (
              <ChatListItem
                key={chat.id}
                chat={chat}
                currentUserId={user.id}
                userType={user.user_type}
              />
            ))}
          </div>
        )}
      </div>

      <BottomNav userType={user?.user_type} />
    </div>
  );
}