import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Flame, CheckCircle2, AlertCircle } from 'lucide-react';
import BottomNav from '@/components/ui/BottomNav';
import { motion } from 'framer-motion';
import {
  SUBJECT_GROUPS,
  getDefaultLevelForSubject,
  getLevelsForSubject,
  normalizeLevelForSubject,
  isLanguageSubject,
} from '@/lib/lessonSubjects';
import { APP_VERSION_LABEL } from '@/lib/version';

export default function CreateLesson() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    subject: 'Английский язык',
    student_level: 'intermediate',
    lesson_date: '',
    lesson_time: '',
    original_price: '',
    discounted_price: ''
  });

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const userData = await base44.auth.me();
    if (userData?.user_type !== 'teacher') {
      navigate(createPageUrl('Feed'));
      return;
    }
    setUser(userData);
    if (userData.subject) {
      setFormData((prev) => ({
        ...prev,
        subject: userData.subject,
        student_level: normalizeLevelForSubject(userData.subject, prev.student_level),
      }));
    }
  };

  const validateForm = () => {
    if (!formData.lesson_date || !formData.lesson_time) {
      setError('Укажите дату и время урока');
      return false;
    }

    const lessonDateTime = new Date(`${formData.lesson_date}T${formData.lesson_time}`);
    if (lessonDateTime <= new Date()) {
      setError('Урок должен быть в будущем');
      return false;
    }

    if (!formData.original_price || !formData.discounted_price) {
      setError('Укажите цены');
      return false;
    }

    const original = parseFloat(formData.original_price);
    const discounted = parseFloat(formData.discounted_price);

    if (discounted >= original) {
      setError('Цена со скидкой должна быть меньше обычной');
      return false;
    }

    const discountPercent = ((original - discounted) / original) * 100;
    if (discountPercent < 20) {
      setError('Скидка должна быть минимум 20%');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setIsLoading(true);

    const lessonDateTime = new Date(`${formData.lesson_date}T${formData.lesson_time}`);
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    await base44.entities.Lesson.create({
      teacher_id: user.id,
      teacher_name: user.full_name,
      teacher_avatar: user.avatar_url,
      teacher_rating: user.average_rating || 5,
      subject: formData.subject,
      student_level: formData.student_level,
      lesson_date: lessonDateTime.toISOString(),
      format: 'online',
      original_price: parseFloat(formData.original_price),
      discounted_price: parseFloat(formData.discounted_price),
      expires_at: expiresAt.toISOString(),
      status: 'active'
    });

    setIsLoading(false);
    setIsSuccess(true);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4 pb-24">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Урок создан!</h2>
          <p className="text-gray-600 mb-8">
            Ваш горящий урок теперь виден ученикам
          </p>
          <div className="space-y-3">
            <Button
              onClick={() => navigate(createPageUrl('Feed'))}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-orange-500 to-red-500"
            >
              Смотреть в ленте
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setIsSuccess(false);
                setFormData({
                  subject: user?.subject || 'Английский язык',
                  student_level: getDefaultLevelForSubject(user?.subject || 'Английский язык'),
                  lesson_date: '',
                  lesson_time: '',
                  original_price: '',
                  discounted_price: ''
                });
              }}
              className="w-full h-12 rounded-xl"
            >
              Создать ещё
            </Button>
          </div>
        </motion.div>
        <BottomNav userType="teacher" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-100 px-4 py-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div className="flex items-center gap-2 flex-1">
            <Flame className="w-5 h-5 text-orange-500" />
            <h1 className="text-lg font-semibold text-gray-900">Создать горящий урок</h1>
          </div>
          <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded-lg">
            {APP_VERSION_LABEL}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="px-4 py-6 space-y-6">
        {/* Subject */}
        <div>
          <Label className="text-gray-700 font-medium">Предмет</Label>
          <Select
            value={formData.subject}
            onValueChange={(value) =>
              setFormData({
                ...formData,
                subject: value,
                student_level: normalizeLevelForSubject(value, formData.student_level),
              })
            }
          >
            <SelectTrigger className="mt-2 h-12 rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SUBJECT_GROUPS.map((group) => (
                <SelectGroup key={group.label}>
                  <SelectLabel>{group.label}</SelectLabel>
                  {group.subjects.map((subject) => (
                    <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                  ))}
                </SelectGroup>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Level */}
        <div>
          <Label className="text-gray-700 font-medium">
            Уровень ученика
            {isLanguageSubject(formData.subject) ? ' (CEFR)' : ''}
          </Label>
          <Select
            value={formData.student_level}
            onValueChange={(value) => setFormData({ ...formData, student_level: value })}
          >
            <SelectTrigger className="mt-2 h-12 rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {getLevelsForSubject(formData.subject).map((level) => (
                <SelectItem key={level.value} value={level.value}>{level.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-gray-700 font-medium">Дата</Label>
            <Input
              type="date"
              value={formData.lesson_date}
              onChange={(e) => setFormData({ ...formData, lesson_date: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
              className="mt-2 h-12 rounded-xl"
            />
          </div>
          <div>
            <Label className="text-gray-700 font-medium">Время</Label>
            <Input
              type="time"
              value={formData.lesson_time}
              onChange={(e) => setFormData({ ...formData, lesson_time: e.target.value })}
              className="mt-2 h-12 rounded-xl"
            />
          </div>
        </div>

        {/* Prices */}
        <div className="bg-orange-50 rounded-2xl p-4 space-y-4">
          <div>
            <Label className="text-gray-700 font-medium">Обычная цена (₽)</Label>
            <Input
              type="number"
              placeholder="2000"
              value={formData.original_price}
              onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
              className="mt-2 h-12 rounded-xl bg-white"
            />
          </div>
          <div>
            <Label className="text-gray-700 font-medium">Цена со скидкой (₽)</Label>
            <Input
              type="number"
              placeholder="1500"
              value={formData.discounted_price}
              onChange={(e) => setFormData({ ...formData, discounted_price: e.target.value })}
              className="mt-2 h-12 rounded-xl bg-white"
            />
            <p className="text-xs text-gray-500 mt-2">Минимальная скидка — 20%</p>
          </div>
          
          {formData.original_price && formData.discounted_price && (
            <div className="text-center py-2">
              <span className="text-2xl font-bold text-orange-600">
                -{Math.round((1 - parseFloat(formData.discounted_price) / parseFloat(formData.original_price)) * 100)}%
              </span>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-xl">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Info */}
        <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
          <p className="text-sm text-gray-600">
            <strong>Важно:</strong> Предложение будет активно 24 часа. После бронирования откроется чат с учеником, где вы сможете отправить ссылку на урок.
          </p>
          <p className="text-xs text-orange-600 font-medium">
            Комиссия платформы: 15% от стоимости урока. Ссылка на оплату придёт в чате с поддержкой после бронирования.
          </p>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-14 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-lg font-semibold"
        >
          {isLoading ? 'Создание...' : 'Опубликовать урок'}
        </Button>
      </form>

      <BottomNav userType="teacher" />
    </div>
  );
}