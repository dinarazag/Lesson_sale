import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Badge } from '@/components/ui/badge';
import { User, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

export default function ChatListItem({ chat, currentUserId, userType }) {
  const isTeacher = userType === 'teacher';
  const otherUserName = isTeacher ? chat.student_name : chat.teacher_name;
  const otherUserAvatar = isTeacher ? chat.student_avatar : chat.teacher_avatar;
  const unreadCount = isTeacher ? chat.unread_count_teacher : chat.unread_count_student;
  
  const lessonDate = chat.lesson_date ? new Date(chat.lesson_date) : null;

  return (
    <Link
      to={createPageUrl(`Chat?id=${chat.id}`)}
      className="bg-white border border-gray-100 rounded-2xl p-4 flex items-start gap-3 hover:shadow-md transition-shadow"
    >
      {/* Avatar */}
      {otherUserAvatar ? (
        <img
          src={otherUserAvatar}
          alt={otherUserName}
          className="w-12 h-12 rounded-full object-cover flex-shrink-0"
        />
      ) : (
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
          <User className="w-6 h-6 text-gray-400" />
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between mb-1">
          <h3 className="font-semibold text-gray-900 truncate">{otherUserName}</h3>
          {unreadCount > 0 && (
            <Badge className="bg-orange-500 text-white ml-2 flex-shrink-0">
              {unreadCount}
            </Badge>
          )}
        </div>

        <p className="text-sm text-gray-500 mb-2 line-clamp-1">
          {chat.lesson_subject}
        </p>

        {lessonDate && (
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
            <Calendar className="w-3 h-3" />
            <span>{format(lessonDate, 'd MMM, HH:mm', { locale: ru })}</span>
          </div>
        )}

        {chat.last_message && (
          <p className="text-sm text-gray-600 line-clamp-2">
            {chat.last_message}
          </p>
        )}

        {chat.last_message_at && (
          <p className="text-xs text-gray-400 mt-1">
            {format(new Date(chat.last_message_at), 'HH:mm', { locale: ru })}
          </p>
        )}
      </div>
    </Link>
  );
}