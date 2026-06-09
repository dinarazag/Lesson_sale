import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Flame, Clock, Percent, Shield, Users, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import WaitlistSection from '@/components/landing/WaitlistSection';

export default function Landing() {
  const [waitlistFormOpen, setWaitlistFormOpen] = useState(false);

  const openWaitlist = () => {
    setWaitlistFormOpen(true);
    requestAnimationFrame(() => {
      document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-orange-500 to-red-500 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjIiIG9wYWNpdHk9Ii4xIi8+PC9nPjwvc3ZnPg==')] opacity-20" />

        <div className="relative max-w-4xl mx-auto px-4 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full mb-6">
              <Flame className="w-5 h-5" />
              <span className="font-semibold">Lesson Sale</span>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Горящие уроки<br />со скидками до 50%
            </h1>

            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto">
              Платформа для быстрого бронирования уроков от лучших преподавателей по выгодным ценам
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                type="button"
                onClick={openWaitlist}
                size="lg"
                className="bg-white text-orange-600 hover:bg-gray-50 h-14 px-8 rounded-2xl text-lg font-semibold"
              >
                Добавьте меня в лист ожидания
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-6xl mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Почему Lesson Sale?
          </h2>
          <p className="text-xl text-gray-600">
            Выгодно для учеников, удобно для преподавателей
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-8"
          >
            <div className="w-14 h-14 bg-orange-500 rounded-xl flex items-center justify-center mb-4">
              <Percent className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Скидки до 50%
            </h3>
            <p className="text-gray-600">
              Преподаватели выставляют свободные слоты со скидкой минимум 20% от обычной цены
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8"
          >
            <div className="w-14 h-14 bg-blue-500 rounded-xl flex items-center justify-center mb-4">
              <Clock className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Быстрое бронирование
            </h3>
            <p className="text-gray-600">
              Найдите урок и забронируйте за минуту. Преподаватель свяжется с вами в чате
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8"
          >
            <div className="w-14 h-14 bg-green-500 rounded-xl flex items-center justify-center mb-4">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Проверенные преподаватели
            </h3>
            <p className="text-gray-600">
              Читайте отзывы и выбирайте лучших преподавателей с высоким рейтингом
            </p>
          </motion.div>
        </div>

        {/* For Students */}
        <div className="bg-gray-50 rounded-3xl p-8 md:p-12 mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Users className="w-8 h-8 text-blue-500" />
            <h3 className="text-2xl font-bold text-gray-900">Для учеников</h3>
          </div>
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-600 text-sm font-bold">✓</span>
              </div>
              <p className="text-gray-700">Экономьте до 50% на уроках с преподавателями</p>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-600 text-sm font-bold">✓</span>
              </div>
              <p className="text-gray-700">Находите свободные слоты на удобное время</p>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-600 text-sm font-bold">✓</span>
              </div>
              <p className="text-gray-700">Регистрация и бронирование абсолютно бесплатны</p>
            </li>
          </ul>
        </div>

        {/* For Teachers */}
        <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-3xl p-8 md:p-12">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-8 h-8 text-orange-500" />
            <h3 className="text-2xl font-bold text-gray-900">Для преподавателей</h3>
          </div>
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-orange-600 text-sm font-bold">✓</span>
              </div>
              <p className="text-gray-700">Заполняйте свободные слоты и увеличивайте доход</p>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-orange-600 text-sm font-bold">✓</span>
              </div>
              <p className="text-gray-700">Привлекайте новых учеников через платформу</p>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-orange-600 text-sm font-bold">✓</span>
              </div>
              <p className="text-gray-700">Реферальная программа: приводите учеников — платите меньше комиссии</p>
            </li>
          </ul>
        </div>
      </div>

      <WaitlistSection
        formOpen={waitlistFormOpen}
        onFormOpenChange={setWaitlistFormOpen}
      />

      {/* Footer */}
      <div className="bg-gray-900 text-gray-400 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-sm">
            © 2026 Lesson Sale. Платформа для бронирования горящих уроков
          </p>
        </div>
      </div>
    </div>
  );
}
