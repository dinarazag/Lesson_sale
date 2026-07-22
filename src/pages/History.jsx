import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Calendar, Star, MessageSquare, User, Loader2, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import BottomNav from '@/components/ui/BottomNav';
import ReviewForm from '@/components/review/ReviewForm';

import { getStudentLevelLabel } from '@/lib/lessonSubjects';

const statusLabels = {
  active: { label: 'Активно', color: 'bg-green-100 text-green-700' },
  booked: { label: 'Забронировано', color: 'bg-blue-100 text-blue-700' },
  completed: { label: 'Завершён', color: 'bg-gray-100 text-gray-700' },
  expired: { label: 'Истёк', color: 'bg-gray-100 text-gray-500' },
  cancelled: { label: 'Отменён', color: 'bg-red-100 text-red-700' }
};

export default function History() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [reviewLesson, setReviewLesson] = useState(null);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const userData = await base44.auth.me();
    setUser(userData);
  };

  const { data: lessons = [], isLoading } = useQuery({
    queryKey: ['history-lessons', user?.id, user?.user_type],
    queryFn: async () => {
      if (user.user_type === 'teacher') {
        return base44.entities.Lesson.filter({ teacher_id: user.id }, '-lesson_date');
      } else {
        return base44.entities.Lesson.filter({ booked_by: user.id }, '-lesson_date');
      }
    },
    enabled: !!user
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['user-reviews', user?.id],
    queryFn: () => base44.entities.Review.filter({ student_id: user.id }),
    enabled: !!user && user.user_type === 'student'
  });

  // Get chats and unread count
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

  // Map lesson IDs to chat IDs
  const lessonChatMap = {};
  chats.forEach(chat => {
    lessonChatMap[chat.lesson_id] = chat.id;
  });

  const reviewMutation = useMutation({
    mutationFn: async ({ lesson, rating, comment }) => {
      await base44.entities.Review.create({
        lesson_id: lesson.id,
        teacher_id: lesson.teacher_id,
        student_id: user.id,
        student_name: user.full_name,
        rating,
        comment,
        subject: lesson.subject
      });

      // Update lesson status
      await base44.entities.Lesson.update(lesson.id, { status: 'completed' });

      // Update teacher rating
      const teacherReviews = await base44.entities.Review.filter({ teacher_id: lesson.teacher_id });
      const allRatings = [...teacherReviews, { rating }];
      const avgRating = allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length;
      
      const teachers = await base44.entities.User.filter({ id: lesson.teacher_id });
      if (teachers.length > 0) {
        await base44.entities.User.update(lesson.teacher_id, {
          average_rating: avgRating,
          rating_count: allRatings.length,
          total_lessons: (teachers[0].total_lessons || 0) + 1
        });
      }
    },
    onSuccess: () => {
      setReviewSuccess(true);
      queryClient.invalidateQueries({ queryKey: ['history-lessons'] });
      queryClient.invalidateQueries({ queryKey: ['user-reviews'] });
    }
  });

  const now = new Date();
  
  const upcomingLessons = lessons.filter(l => 
    new Date(l.lesson_date) > now && ['active', 'booked'].includes(l.status)
  );
  
  const pastLessons = lessons.filter(l => 
    new Date(l.lesson_date) <= now || ['completed', 'expired', 'cancelled'].includes(l.status)
  );

  const reviewedLessonIds = new Set(reviews.map(r => r.lesson_id));

  const handleReview = (lesson) => {
    setReviewLesson(lesson);
    setReviewSuccess(false);
  };

  const submitReview = ({ rating, comment }) => {
    reviewMutation.mutate({ lesson: reviewLesson, rating, comment });
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  const renderLessonCard = (lesson, showReviewButton = false) => {
    const lessonDate = new Date(lesson.lesson_date);
    const canReview = showReviewButton && 
                      user.user_type === 'student' && 
                      lesson.status === 'booked' &&
                      lessonDate <= now &&
                      !reviewedLessonIds.has(lesson.id);

    return (
      <div key={lesson.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            {user.user_type === 'student' ? (
              lesson.teacher_avatar ? (
                <img 
                  src={lesson.teacher_avatar}
                  alt={lesson.teacher_name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                  <User className="w-6 h-6 text-orange-500" />
                </div>
              )
            ) : (
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <User className="w-6 h-6 text-blue-500" />
              </div>
            )}
            <div>
              <h3 className="font-semibold text-gray-900">
                {user.user_type === 'student' ? lesson.teacher_name : lesson.booked_by_name || 'Ожидает бронирования'}
              </h3>
              <p className="text-sm text-gray-500">{lesson.subject}</p>
            </div>
          </div>
          <Badge className={statusLabels[lesson.status]?.color || 'bg-gray-100'}>
            {statusLabels[lesson.status]?.label || lesson.status}
          </Badge>
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {format(lessonDate, 'd MMM', { locale: ru })}
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {format(lessonDate, 'HH:mm')}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-gray-100">
              {getStudentLevelLabel(lesson.student_level, lesson.subject)}
            </Badge>
            <span className="font-semibold text-gray-900">{lesson.discounted_price} ₽</span>
          </div>

          <div className="flex items-center gap-2">
            {lesson.status === 'booked' && lessonChatMap[lesson.id] && (
              <Link to={createPageUrl(`Chat?id=${lessonChatMap[lesson.id]}`)}>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-lg border-orange-200 text-orange-600 hover:bg-orange-50"
                >
                  <MessageSquare className="w-4 h-4 mr-1" />
                  Чат
                </Button>
              </Link>
            )}

            {canReview && (
              <Button
                size="sm"
                onClick={() => handleReview(lesson)}
                className="bg-orange-500 hover:bg-orange-600 rounded-lg"
              >
                <Star className="w-4 h-4 mr-1" />
                Оценить
              </Button>
            )}

            {reviewedLessonIds.has(lesson.id) && (
              <div className="flex items-center gap-1 text-green-600">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-sm">Оценено</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white sticky top-0 z-40 px-4 pt-4 pb-4 border-b border-gray-100">
        <h1 className="text-xl font-bold text-gray-900 mb-4">История уроков</h1>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full bg-gray-100 rounded-xl p-1">
            <TabsTrigger 
              value="upcoming" 
              className="flex-1 rounded-lg data-[state=active]:bg-white"
            >
              Предстоящие
            </TabsTrigger>
            <TabsTrigger 
              value="past"
              className="flex-1 rounded-lg data-[state=active]:bg-white"
            >
              Прошедшие
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content */}
      <div className="px-4 py-4">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          </div>
        ) : activeTab === 'upcoming' ? (
          upcomingLessons.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Нет предстоящих уроков</h3>
              <p className="text-gray-500 mb-6">
                {user.user_type === 'student' 
                  ? 'Забронируйте урок в ленте'
                  : 'Создайте горящий урок'
                }
              </p>
              <Button
                onClick={() => navigate(createPageUrl(user.user_type === 'student' ? 'Feed' : 'CreateLesson'))}
                className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl"
              >
                {user.user_type === 'student' ? 'К урокам' : 'Создать урок'}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingLessons.map(lesson => renderLessonCard(lesson, false))}
            </div>
          )
        ) : (
          pastLessons.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Пока нет завершённых уроков</h3>
            </div>
          ) : (
            <div className="space-y-4">
              {pastLessons.map(lesson => renderLessonCard(lesson, true))}
            </div>
          )
        )}
      </div>

      {/* Review Modal */}
      <ReviewForm
        open={!!reviewLesson}
        onClose={() => {
          setReviewLesson(null);
          setReviewSuccess(false);
        }}
        lesson={reviewLesson}
        onSubmit={submitReview}
        isLoading={reviewMutation.isPending}
        isSuccess={reviewSuccess}
      />

      <BottomNav userType={user?.user_type} unreadMessagesCount={unreadMessagesCount} />
    </div>
  );
}