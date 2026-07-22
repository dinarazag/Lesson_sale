import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Flame, Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import LessonCard from '@/components/lesson/LessonCard';
import FilterSheet from '@/components/lesson/FilterSheet';
import BookingModal from '@/components/booking/BookingModal';
import BottomNav from '@/components/ui/BottomNav';
import NotificationToast from '@/components/notifications/NotificationToast';

export default function Feed() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [teacherFilter, setTeacherFilter] = useState('');
  const [filters, setFilters] = useState({
    subject: null,
    maxPrice: 5000,
    minRating: 0,
    timeSlot: null
  });
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
    } catch (error) {
      console.error('Failed to load user', error);
    }
  };

  const { data: lessons = [], isLoading } = useQuery({
    queryKey: ['lessons', 'active'],
    queryFn: () => base44.entities.Lesson.filter({ status: 'active' }, '-created_date'),
    enabled: !!user
  });

  // Get unread messages count
  const { data: chats = [] } = useQuery({
    queryKey: ['chats', user?.id, user?.user_type],
    queryFn: async () => {
      if (!user) return [];
      if (user.user_type === 'teacher') {
        return base44.entities.Chat.filter({ teacher_id: user.id });
      } else {
        return base44.entities.Chat.filter({ student_id: user.id });
      }
    },
    enabled: !!user
  });

  const unreadMessagesCount = chats.reduce((sum, chat) => {
    return sum + (user?.user_type === 'teacher' ? chat.unread_count_teacher : chat.unread_count_student);
  }, 0);

  const bookingMutation = useMutation({
    mutationFn: async (lesson) => {
      await base44.entities.Lesson.update(lesson.id, {
        status: 'booked',
        booked_by: user.id,
        booked_by_name: user.full_name,
        booked_at: new Date().toISOString()
      });

      // Create chat between teacher and student
      const chat = await base44.entities.Chat.create({
        lesson_id: lesson.id,
        teacher_id: lesson.teacher_id,
        teacher_name: lesson.teacher_name,
        teacher_avatar: lesson.teacher_avatar,
        student_id: user.id,
        student_name: user.full_name,
        student_avatar: user.avatar_url,
        lesson_subject: lesson.subject,
        lesson_date: lesson.lesson_date,
        last_message: 'Урок забронирован',
        last_message_at: new Date().toISOString(),
        unread_count_teacher: 1,
        unread_count_student: 0
      });

      // Create system message
      await base44.entities.Message.create({
        chat_id: chat.id,
        sender_id: 'system',
        sender_name: 'Система',
        sender_role: 'support',
        content: `Урок забронирован! ${lesson.teacher_name}, пожалуйста, свяжитесь с учеником и отправьте ссылку на урок.\n\nПреподаватель, обратите внимание: комиссия сервиса составляет 15% от стоимости урока. Ссылка на оплату придёт в чате с поддержкой.`,
        is_system: true,
        is_read: false
      });

      // Create notifications for both users
      await base44.entities.Notification.create({
        user_id: lesson.teacher_id,
        type: 'new_booking',
        title: 'Новое бронирование!',
        message: `${user.full_name} забронировал урок по предмету ${lesson.subject}`,
        link: createPageUrl(`Chat?id=${chat.id}`),
        related_chat_id: chat.id,
        related_lesson_id: lesson.id,
        is_read: false
      });

      await base44.entities.Notification.create({
        user_id: user.id,
        type: 'new_booking',
        title: 'Урок забронирован',
        message: `Вы забронировали урок у ${lesson.teacher_name}. Преподаватель свяжется с вами в чате.`,
        link: createPageUrl(`Chat?id=${chat.id}`),
        related_chat_id: chat.id,
        related_lesson_id: lesson.id,
        is_read: false
      });

      // Get teacher data for email
      const teachers = await base44.entities.User.filter({ id: lesson.teacher_id });
      if (teachers.length > 0 && teachers[0].notification_settings?.email_new_booking) {
        // Send email to teacher
        await base44.integrations.Core.SendEmail({
          to: teachers[0].email,
          subject: 'Новое бронирование урока - lesson_sale',
          body: `Здравствуйте, ${lesson.teacher_name}!

        Ученик ${user.full_name} забронировал ваш урок:
        - Предмет: ${lesson.subject}
        - Дата: ${new Date(lesson.lesson_date).toLocaleString('ru-RU')}
        - Стоимость: ${lesson.discounted_price} ₽

        Пожалуйста, свяжитесь с учеником в чате и отправьте ссылку на урок.

        С уважением,
        Команда lesson_sale`
        });
      }

      // Send email to student
      if (user.notification_settings?.email_new_booking) {
        await base44.integrations.Core.SendEmail({
          to: user.email,
          subject: 'Урок успешно забронирован - lesson_sale',
          body: `Здравствуйте, ${user.full_name}!

      Вы успешно забронировали урок:
      - Преподаватель: ${lesson.teacher_name}
      - Предмет: ${lesson.subject}
      - Дата: ${new Date(lesson.lesson_date).toLocaleString('ru-RU')}
      - Стоимость: ${lesson.discounted_price} ₽

      Преподаватель свяжется с вами в чате на платформе.

      С уважением,
      Команда lesson_sale`
        });
      }

      // Send payment reminder to teacher's support chat
      const teacherUsers = await base44.entities.User.filter({ id: lesson.teacher_id });
      if (teacherUsers.length > 0 && teacherUsers[0].support_chat_id) {
        await base44.entities.Message.create({
          chat_id: teacherUsers[0].support_chat_id,
          sender_id: 'support',
          sender_name: 'Поддержка',
          sender_role: 'support',
          content: `💰 Комиссия за урок\n\nУрок с ${user.full_name} забронирован. Комиссия платформы: ${Math.round(lesson.discounted_price * 0.15)} ₽ (15% от ${lesson.discounted_price} ₽)\n\n[Оплатить комиссию] - ссылка будет добавлена администратором`,
          is_read: false
        });

        await base44.entities.Chat.update(teacherUsers[0].support_chat_id, {
          last_message: 'Напоминание об оплате комиссии',
          last_message_at: new Date().toISOString(),
          unread_count_teacher: (teacherUsers[0].unread_count_teacher || 0) + 1
        });
      }
    },
    onSuccess: () => {
      setBookingSuccess(true);
      queryClient.invalidateQueries({ queryKey: ['lessons'] });
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    }
  });

  const handleBook = (lesson) => {
    setSelectedLesson(lesson);
    setBookingSuccess(false);
  };

  const confirmBooking = () => {
    bookingMutation.mutate(selectedLesson);
  };

  const closeBookingModal = () => {
    setSelectedLesson(null);
    setBookingSuccess(false);
  };

  // Fetch teacher by referral code or name
  const { data: teacherByRef } = useQuery({
    queryKey: ['teacher-search', teacherFilter],
    queryFn: async () => {
      if (!teacherFilter.trim()) return null;
      const query = teacherFilter.trim();
      
      // Try to find by referral code first
      const byCode = await base44.entities.User.filter({ 
        referral_code: query.toUpperCase(),
        user_type: 'teacher'
      });
      if (byCode.length > 0) return byCode[0];
      
      // Then try by name
      const byName = await base44.entities.User.filter({ 
        user_type: 'teacher'
      });
      return byName.find(t => t.full_name?.toLowerCase().includes(query.toLowerCase()));
    },
    enabled: !!teacherFilter && user?.user_type === 'student'
  });

  // Filter lessons
  const filteredLessons = lessons.filter((lesson) => {
    const now = new Date();
    const lessonDate = new Date(lesson.lesson_date);
    
    // Only show future lessons
    if (lessonDate <= now) return false;
    
    // Check if expired
    if (lesson.expires_at && new Date(lesson.expires_at) <= now) return false;

    // Teacher filter (by code or name)
    if (teacherFilter && teacherByRef) {
      if (lesson.teacher_id !== teacherByRef.id) return false;
    }

    // Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!lesson.teacher_name?.toLowerCase().includes(query) &&
          !lesson.subject?.toLowerCase().includes(query)) {
        return false;
      }
    }

    // Subject filter
    if (filters.subject && lesson.subject !== filters.subject) return false;

    // Price filter
    if (lesson.discounted_price > filters.maxPrice) return false;

    // Rating filter
    if (filters.minRating > 0 && (lesson.teacher_rating || 0) < filters.minRating) return false;

    // Time slot filter
    if (filters.timeSlot) {
      const hour = lessonDate.getHours();
      if (filters.timeSlot === 'morning' && (hour < 8 || hour >= 12)) return false;
      if (filters.timeSlot === 'afternoon' && (hour < 12 || hour >= 17)) return false;
      if (filters.timeSlot === 'evening' && (hour < 17 || hour >= 21)) return false;
    }

    return true;
  });

  const activeFiltersCount = [
    filters.subject,
    filters.maxPrice < 5000,
    filters.minRating > 0,
    filters.timeSlot
  ].filter(Boolean).length;

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Notification Toast */}
      <NotificationToast userId={user?.id} />
      {/* Header */}
      <div className="bg-white sticky top-0 z-40 px-4 pt-4 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <Flame className="w-6 h-6 text-orange-500" />
          <h1 className="text-xl font-bold text-gray-900">Горящие уроки</h1>
        </div>
        
        <div className="space-y-3">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Поиск по предмету или имени"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11 rounded-xl bg-gray-50 border-0"
              />
            </div>
            <FilterSheet 
              filters={filters}
              onFiltersChange={setFilters}
              activeFiltersCount={activeFiltersCount}
            />
          </div>
          
          {user?.user_type === 'student' && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Найти уроки моего учителя (код или имя)"
                value={teacherFilter}
                onChange={(e) => setTeacherFilter(e.target.value)}
                className="pl-9 h-10 rounded-xl bg-orange-50 border-orange-200 text-sm placeholder:text-gray-500"
              />
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-4">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          </div>
        ) : filteredLessons.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Flame className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Нет доступных уроков</h3>
            <p className="text-gray-500">Попробуйте изменить фильтры или зайдите позже</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredLessons.map((lesson) => (
              <LessonCard
                key={lesson.id}
                lesson={lesson}
                onBook={handleBook}
              />
            ))}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      <BookingModal
        open={!!selectedLesson}
        onClose={closeBookingModal}
        lesson={selectedLesson}
        onConfirm={confirmBooking}
        isLoading={bookingMutation.isPending}
        isSuccess={bookingSuccess}
      />

      <BottomNav userType={user?.user_type} unreadMessagesCount={unreadMessagesCount} />
    </div>
  );
}