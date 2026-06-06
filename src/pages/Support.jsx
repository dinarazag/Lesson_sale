import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Send, CheckCircle2, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import BottomNav from '@/components/ui/BottomNav';

export default function Support() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    message: ''
  });

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const userData = await base44.auth.me();
    setUser(userData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.message.trim()) return;

    setIsLoading(true);
    
    await base44.entities.SupportTicket.create({
      user_email: user?.email || '',
      user_name: user?.full_name || '',
      subject: formData.subject || 'Обращение в поддержку',
      message: formData.message,
      status: 'new'
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
          className="text-center max-w-sm"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Сообщение отправлено</h2>
          <p className="text-gray-600 mb-8">
            Мы получили ваше обращение и ответим в ближайшее время на email {user?.email}
          </p>
          <Button
            onClick={() => navigate(createPageUrl('Profile'))}
            className="w-full h-12 rounded-xl bg-gradient-to-r from-orange-500 to-red-500"
          >
            Вернуться в профиль
          </Button>
        </motion.div>
        <BottomNav userType={user?.user_type} />
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
          <h1 className="text-lg font-semibold text-gray-900">Поддержка</h1>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6">
        <div className="bg-white rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Напишите нам</h2>
              <p className="text-sm text-gray-500">Мы ответим в течение 24 часов</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="text-gray-700">Тема обращения</Label>
              <Input
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="Например: Проблема с бронированием"
                className="mt-2 h-12 rounded-xl"
              />
            </div>

            <div>
              <Label className="text-gray-700">Сообщение *</Label>
              <Textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Опишите вашу проблему или вопрос..."
                className="mt-2 min-h-[150px] rounded-xl resize-none"
                required
              />
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-600">
                <strong>Email для ответа:</strong> {user?.email || 'Загрузка...'}
              </p>
            </div>

            <Button
              type="submit"
              disabled={isLoading || !formData.message.trim()}
              className="w-full h-14 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-lg font-semibold"
            >
              {isLoading ? (
                'Отправка...'
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  Отправить
                </>
              )}
            </Button>
          </form>
        </div>
      </div>

      <BottomNav userType={user?.user_type} />
    </div>
  );
}