import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  User, 
  Star, 
  BookOpen, 
  GraduationCap, 
  Phone, 
  Mail,
  Settings,
  LogOut,
  HelpCircle,
  MessageSquare,
  Upload,
  Edit2,
  CheckCircle2,
  Loader2,
  ChevronRight,
  Shield,
  Bell,
  Clock,
  Users
} from 'lucide-react';
import BottomNav from '@/components/ui/BottomNav';
import NotificationSettings from '@/components/profile/NotificationSettings';

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editData, setEditData] = useState({});
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const userData = await base44.auth.me();
    if (!userData?.onboarding_completed) {
      navigate(createPageUrl('Onboarding'));
      return;
    }
    setUser(userData);
    setEditData({
      phone: userData.phone || '',
      bio: userData.bio || '',
      subject: userData.subject || '',
      experience_years: userData.experience_years || ''
    });
  };

  const { data: reviews = [] } = useQuery({
    queryKey: ['teacher-reviews', user?.id],
    queryFn: () => base44.entities.Review.filter({ teacher_id: user.id }, '-created_date'),
    enabled: !!user && user.user_type === 'teacher'
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

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsLoading(true);
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await base44.auth.updateMe({ avatar_url: file_url });
      setUser({ ...user, avatar_url: file_url });
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    await base44.auth.updateMe({
      ...editData,
      experience_years: editData.experience_years ? parseInt(editData.experience_years) : 0
    });
    setUser({ ...user, ...editData });
    setIsEditing(false);
    setIsLoading(false);
  };

  const handleLogout = () => {
    base44.auth.logout('/Landing');
  };

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
      <div className="bg-gradient-to-br from-orange-500 to-red-500 px-4 pt-8 pb-16 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10 flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold">Профиль</h1>
          <button
            onClick={() => setIsEditing(true)}
            className="p-2 bg-white/20 rounded-xl"
          >
            <Edit2 className="w-5 h-5" />
          </button>
        </div>

        <div className="relative z-10 flex items-center gap-4">
          <div className="relative">
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
              {user.avatar_url ? (
                <img 
                  src={user.avatar_url}
                  alt={user.full_name}
                  className="w-20 h-20 rounded-full object-cover border-4 border-white/30"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center border-4 border-white/30">
                  <User className="w-10 h-10 text-white" />
                </div>
              )}
              <div className="absolute bottom-0 right-0 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-lg">
                <Upload className="w-3.5 h-3.5 text-orange-500" />
              </div>
            </label>
          </div>
          <div>
            <h2 className="text-xl font-bold">{user.full_name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <Badge className="bg-white/20 border-0 text-white">
                {user.user_type === 'teacher' ? (
                  <><GraduationCap className="w-3 h-3 mr-1" /> Преподаватель</>
                ) : (
                  <><BookOpen className="w-3 h-3 mr-1" /> Ученик</>
                )}
              </Badge>
              {user.is_verified && (
                <Badge className="bg-green-500/30 border-0 text-white">
                  <Shield className="w-3 h-3 mr-1" /> Верифицирован
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats for teachers */}
      {user.user_type === 'teacher' && (
        <div className="px-4 -mt-8 relative z-20">
          <div className="bg-white rounded-2xl shadow-lg p-4 grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                <span className="text-2xl font-bold text-gray-900">
                  {user.average_rating?.toFixed(1) || '5.0'}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Рейтинг</p>
            </div>
            <div className="text-center border-x border-gray-100">
              <span className="text-2xl font-bold text-gray-900">{user.total_lessons || 0}</span>
              <p className="text-xs text-gray-500 mt-1">Уроков</p>
            </div>
            <div className="text-center">
              <span className="text-2xl font-bold text-gray-900">{user.rating_count || 0}</span>
              <p className="text-xs text-gray-500 mt-1">Отзывов</p>
            </div>
          </div>
        </div>
      )}

      {/* Info */}
      <div className="px-4 mt-6 space-y-4">
        {/* Contact Info */}
        <div className="bg-white rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-3 py-2">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Mail className="w-5 h-5 text-blue-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium text-gray-900">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 py-2">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <Phone className="w-5 h-5 text-green-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-500">Телефон</p>
              <p className="font-medium text-gray-900">{user.phone || 'Не указан'}</p>
            </div>
          </div>
        </div>

        {/* Teacher Info */}
        {user.user_type === 'teacher' && (
          <div className="bg-white rounded-2xl p-4">
            <h3 className="font-semibold text-gray-900 mb-3">О преподавателе</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Предмет</p>
                <p className="font-medium text-gray-900">{user.subject || 'Не указан'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Опыт</p>
                <p className="font-medium text-gray-900">{user.experience_years ? `${user.experience_years} лет` : 'Не указан'}</p>
              </div>
              {user.bio && (
                <div>
                  <p className="text-sm text-gray-500">О себе</p>
                  <p className="text-gray-700 mt-1">{user.bio}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Reviews for teacher */}
        {user.user_type === 'teacher' && reviews.length > 0 && (
          <div className="bg-white rounded-2xl p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Отзывы учеников</h3>
            <div className="space-y-4">
              {reviews.slice(0, 3).map((review) => (
                <div key={review.id} className="pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">{review.student_name}</span>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star 
                          key={i}
                          className={`w-4 h-4 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`}
                        />
                      ))}
                    </div>
                  </div>
                  {review.comment && (
                    <p className="text-sm text-gray-600">{review.comment}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl overflow-hidden">
          {user.user_type === 'teacher' && (
            <Link 
              to={createPageUrl('Referral')}
              className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-red-100 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-orange-500" />
              </div>
              <div className="flex-1">
                <span className="font-medium text-gray-900">Пригласить учеников</span>
                <p className="text-xs text-gray-500">Получайте 20% комиссии</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </Link>
          )}
          <Link 
            to={createPageUrl('History')}
            className={`flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors ${user.user_type === 'teacher' ? 'border-t border-gray-100' : ''}`}
          >
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-500" />
            </div>
            <span className="flex-1 font-medium text-gray-900">История уроков</span>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </Link>
          <Link 
            to={createPageUrl('Chats')}
            className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors border-t border-gray-100"
          >
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center relative">
              <MessageSquare className="w-5 h-5 text-green-500" />
              {unreadMessagesCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                  {unreadMessagesCount > 9 ? '9+' : unreadMessagesCount}
                </span>
              )}
            </div>
            <span className="flex-1 font-medium text-gray-900">Чаты</span>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </Link>
          <Link 
            to={createPageUrl('Notifications')}
            className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors border-t border-gray-100"
          >
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center relative">
              <Bell className="w-5 h-5 text-orange-500" />
              {(() => {
                const notificationCount = chats.reduce((sum, chat) => {
                  return sum + (user?.user_type === 'teacher' ? chat.unread_count_teacher : chat.unread_count_student);
                }, 0);
                return notificationCount > 0 ? (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </span>
                ) : null;
              })()}
            </div>
            <span className="flex-1 font-medium text-gray-900">Уведомления</span>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </Link>
        </div>

        {/* Settings */}
        <div className="bg-white rounded-2xl overflow-hidden">
          <button 
            onClick={() => setShowNotificationSettings(true)}
            className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <Settings className="w-5 h-5 text-purple-500" />
            </div>
            <span className="flex-1 font-medium text-gray-900 text-left">Настройки уведомлений</span>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
          <Link 
            to={createPageUrl('FAQ')}
            className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors border-t border-gray-100"
          >
            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
              <HelpCircle className="w-5 h-5 text-indigo-500" />
            </div>
            <span className="flex-1 font-medium text-gray-900">FAQ</span>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </Link>
          {user.support_chat_id && (
            <Link 
              to={createPageUrl(`Chat?id=${user.support_chat_id}`)}
              className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors border-t border-gray-100"
            >
              <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-teal-500" />
              </div>
              <span className="flex-1 font-medium text-gray-900">Чат с поддержкой</span>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </Link>
          )}
        </div>

        {/* Logout */}
        <Button
          variant="outline"
          onClick={handleLogout}
          className="w-full h-12 rounded-xl border-red-200 text-red-600 hover:bg-red-50"
        >
          <LogOut className="w-5 h-5 mr-2" />
          Выйти
        </Button>
      </div>

      {/* Notification Settings Dialog */}
      <Dialog open={showNotificationSettings} onOpenChange={setShowNotificationSettings}>
        <DialogContent className="sm:max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle>Настройки уведомлений</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <NotificationSettings 
              user={user} 
              onUpdate={() => {
                loadUser();
                setShowNotificationSettings(false);
              }} 
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle>Редактировать профиль</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-gray-700">Телефон</Label>
              <Input
                value={editData.phone}
                onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                placeholder="+7 (999) 123-45-67"
                className="mt-2 h-12 rounded-xl"
              />
            </div>

            {user.user_type === 'teacher' && (
              <>
                <div>
                  <Label className="text-gray-700">Предмет</Label>
                  <Input
                    value={editData.subject}
                    onChange={(e) => setEditData({ ...editData, subject: e.target.value })}
                    className="mt-2 h-12 rounded-xl"
                  />
                </div>
                <div>
                  <Label className="text-gray-700">Опыт (лет)</Label>
                  <Input
                    type="number"
                    value={editData.experience_years}
                    onChange={(e) => setEditData({ ...editData, experience_years: e.target.value })}
                    className="mt-2 h-12 rounded-xl"
                  />
                </div>
                <div>
                  <Label className="text-gray-700">О себе</Label>
                  <Textarea
                    value={editData.bio}
                    onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                    className="mt-2 min-h-[100px] rounded-xl resize-none"
                  />
                </div>
              </>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsEditing(false)}
                className="flex-1 h-12 rounded-xl"
                disabled={isLoading}
              >
                Отмена
              </Button>
              <Button
                onClick={handleSave}
                className="flex-1 h-12 rounded-xl bg-gradient-to-r from-orange-500 to-red-500"
                disabled={isLoading}
              >
                {isLoading ? 'Сохранение...' : 'Сохранить'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <BottomNav userType={user?.user_type} unreadMessagesCount={unreadMessagesCount} />
    </div>
  );
}