import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { GraduationCap, BookOpen, ArrowRight, Upload, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState({
    user_type: null,
    phone: '',
    bio: '',
    experience_years: '',
    subject: 'Английский язык',
    avatar_url: ''
  });

  useEffect(() => {
    checkOnboarding();
  }, []);

  const checkOnboarding = async () => {
    try {
      const user = await base44.auth.me();
      if (user?.onboarding_completed) {
        navigate(createPageUrl('Feed'));
      }
    } catch (error) {
      // User not authenticated, redirect to landing
      navigate(createPageUrl('Landing'));
    }
  };

  const handleRoleSelect = (role) => {
    setUserData({ ...userData, user_type: role });
    setStep(2);
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsLoading(true);
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setUserData({ ...userData, avatar_url: file_url });
      setIsLoading(false);
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    const updatedUser = await base44.auth.updateMe({
      ...userData,
      experience_years: userData.experience_years ? parseInt(userData.experience_years) : 0,
      onboarding_completed: true,
      notification_settings: {
        email_new_message: true,
        email_new_booking: true,
        email_lesson_reminder: true,
        push_new_message: true,
        push_new_booking: true
      }
    });

    // Create support chat
    const me = await base44.auth.me();
    const supportChat = await base44.entities.Chat.create({
      lesson_id: 'support',
      teacher_id: 'support',
      teacher_name: 'Поддержка lesson_sale',
      teacher_avatar: '',
      student_id: me.id,
      student_name: me.full_name,
      student_avatar: me.avatar_url,
      lesson_subject: 'Поддержка',
      last_message: 'Добро пожаловать!',
      last_message_at: new Date().toISOString(),
      unread_count_teacher: 0,
      unread_count_student: 1
    });

    // Save support chat ID
    await base44.auth.updateMe({ support_chat_id: supportChat.id });

    // Send welcome message with onboarding info
    const welcomeMessage = userData.user_type === 'teacher' 
      ? `Добро пожаловать в lesson_sale, ${userData.full_name || 'преподаватель'}! 🎓

    📚 Краткая инструкция:
    1. Создавайте «горящие» уроки со скидкой минимум 20%
    2. После бронирования откроется чат с учеником
    3. Отправьте ученику ссылку на урок
    4. Комиссия платформы — 15% (ссылка на оплату придёт сюда после бронирования)

    💬 Если возникнут вопросы, пишите в этот чат — мы всегда на связи!`
      : `Добро пожаловать в lesson_sale, ${userData.full_name || 'ученик'}! 📖

    🔥 Как найти урок:
    1. Просматривайте ленту «горящих» уроков со скидками
    2. Бронируйте подходящий урок
    3. Преподаватель свяжется с вами в чате
    4. Оплата напрямую преподавателю

    💬 Нужна помощь? Пишите в этот чат!`;

    await base44.entities.Message.create({
      chat_id: supportChat.id,
      sender_id: 'support',
      sender_name: 'Поддержка',
      sender_role: 'support',
      content: welcomeMessage,
      is_system: false,
      is_read: false
    });

    navigate(createPageUrl('Feed'));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white px-4 py-8">
      <div className="max-w-md mx-auto">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
            lesson_sale
          </h1>
        </div>

        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {[1, 2].map((s) => (
            <div 
              key={s}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                s <= step ? 'bg-orange-500' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome to lesson_sale</h2>
              <p className="text-gray-600 mb-2">Добро пожаловать на платформу</p>
              <h3 className="text-xl font-semibold text-gray-800 mb-2 mt-6">Кто вы?</h3>
              <p className="text-gray-600 mb-8">Выберите вашу роль на платформе</p>

              <div className="space-y-4">
                <button
                  onClick={() => handleRoleSelect('student')}
                  className="w-full p-6 bg-white rounded-2xl border-2 border-gray-100 hover:border-orange-300 transition-all flex items-center gap-4 group"
                >
                  <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <BookOpen className="w-7 h-7 text-blue-500" />
                  </div>
                  <div className="text-left flex-1">
                    <h3 className="font-semibold text-gray-900 text-lg">Я ученик</h3>
                    <p className="text-gray-500 text-sm">Ищу преподавателя для занятий</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-orange-500 transition-colors" />
                </button>

                <button
                  onClick={() => handleRoleSelect('teacher')}
                  className="w-full p-6 bg-white rounded-2xl border-2 border-gray-100 hover:border-orange-300 transition-all flex items-center gap-4 group"
                >
                  <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <GraduationCap className="w-7 h-7 text-orange-500" />
                  </div>
                  <div className="text-left flex-1">
                    <h3 className="font-semibold text-gray-900 text-lg">Я преподаватель</h3>
                    <p className="text-gray-500 text-sm">Хочу проводить уроки</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-orange-500 transition-colors" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {userData.user_type === 'teacher' ? 'Расскажите о себе' : 'Почти готово!'}
              </h2>
              <p className="text-gray-600 mb-8">
                {userData.user_type === 'teacher' 
                  ? 'Эта информация поможет ученикам найти вас'
                  : 'Добавьте контактные данные'
                }
              </p>

              <div className="space-y-6">
                {/* Avatar */}
                <div className="flex justify-center">
                  <label className="relative cursor-pointer">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                    {userData.avatar_url ? (
                      <img 
                        src={userData.avatar_url}
                        alt="Avatar"
                        className="w-24 h-24 rounded-full object-cover border-4 border-orange-100"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center border-4 border-gray-50">
                        <User className="w-10 h-10 text-gray-400" />
                      </div>
                    )}
                    <div className="absolute bottom-0 right-0 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center shadow-lg">
                      <Upload className="w-4 h-4 text-white" />
                    </div>
                  </label>
                </div>

                {/* Phone */}
                <div>
                  <Label className="text-gray-700">Телефон</Label>
                  <Input
                    type="tel"
                    placeholder="+7 (999) 123-45-67"
                    value={userData.phone}
                    onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                    className="mt-2 h-12 rounded-xl"
                  />
                </div>

                {userData.user_type === 'teacher' && (
                  <>
                    {/* Subject */}
                    <div>
                      <Label className="text-gray-700">Предмет</Label>
                      <Input
                        placeholder="Английский язык"
                        value={userData.subject}
                        onChange={(e) => setUserData({ ...userData, subject: e.target.value })}
                        className="mt-2 h-12 rounded-xl"
                      />
                    </div>

                    {/* Experience */}
                    <div>
                      <Label className="text-gray-700">Опыт преподавания (лет)</Label>
                      <Input
                        type="number"
                        placeholder="5"
                        value={userData.experience_years}
                        onChange={(e) => setUserData({ ...userData, experience_years: e.target.value })}
                        className="mt-2 h-12 rounded-xl"
                      />
                    </div>

                    {/* Bio */}
                    <div>
                      <Label className="text-gray-700">О себе</Label>
                      <Textarea
                        placeholder="Расскажите о вашем опыте, методике преподавания..."
                        value={userData.bio}
                        onChange={(e) => setUserData({ ...userData, bio: e.target.value })}
                        className="mt-2 min-h-[100px] rounded-xl resize-none"
                      />
                    </div>
                  </>
                )}

                <Button
                  onClick={handleComplete}
                  disabled={isLoading}
                  className="w-full h-14 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-lg font-semibold"
                >
                  {isLoading ? 'Сохранение...' : 'Начать'}
                </Button>

                <button
                  onClick={() => setStep(1)}
                  className="w-full text-center text-gray-500 hover:text-gray-700"
                >
                  Назад
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}