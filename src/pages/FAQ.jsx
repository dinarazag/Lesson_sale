import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import BottomNav from '@/components/ui/BottomNav';

const faqData = [
  {
    category: 'Общие вопросы',
    questions: [
      {
        q: 'Что такое lesson_sale?',
        a: 'lesson_sale — это платформа для быстрого бронирования «горящих» уроков со скидкой. Преподаватели публикуют уроки с выгодными ценами, а ученики могут оперативно их забронировать.'
      },
      {
        q: 'Как работают «горящие» уроки?',
        a: 'Преподаватели создают уроки со скидкой минимум 20% от обычной цены. Предложение действует 24 часа или до бронирования. Это позволяет ученикам экономить, а преподавателям — заполнять свободные слоты.'
      },
      {
        q: 'Какая комиссия платформы?',
        a: 'Для учеников бронирование бесплатно. Преподаватели оплачивают комиссию сервиса в размере 15% от стоимости урока. Ссылка на оплату приходит в чате с поддержкой после бронирования урока учеником.'
      }
    ]
  },
  {
    category: 'Для учеников',
    questions: [
      {
        q: 'Как забронировать урок?',
        a: 'Выберите подходящий урок в ленте, нажмите «Забронировать» и подтвердите бронирование. После этого преподаватель свяжется с вами и отправит ссылку на урок.'
      },
      {
        q: 'Как оплатить урок?',
        a: 'Оплата происходит напрямую преподавателю. Способ оплаты вы согласуете с преподавателем после бронирования.'
      },
      {
        q: 'Могу ли я отменить бронирование?',
        a: 'Для отмены бронирования свяжитесь напрямую с преподавателем. Рекомендуем делать это заблаговременно.'
      }
    ]
  },
  {
    category: 'Для преподавателей',
    questions: [
      {
        q: 'Как создать урок?',
        a: 'Нажмите на кнопку «Создать» в нижнем меню, заполните форму с информацией об уроке и опубликуйте. Урок сразу появится в общей ленте.'
      },
      {
        q: 'Какая минимальная скидка?',
        a: 'Минимальная скидка составляет 20% от вашей обычной цены. Это делает предложение привлекательным для учеников.'
      },
      {
        q: 'Сколько действует предложение?',
        a: 'Предложение активно 24 часа с момента публикации или до бронирования учеником.'
      },
      {
        q: 'Как связаться с учеником?',
        a: 'После бронирования автоматически создаётся чат с учеником. Перейдите в раздел «Чаты» или нажмите кнопку «Чат» в истории урока. Отправьте ученику ссылку на урок через чат.'
      },
      {
        q: 'Как оплатить комиссию?',
        a: 'После бронирования урока в чат с поддержкой придёт ссылка на оплату комиссии 15%. Комиссия оплачивается один раз за каждый проведённый урок.'
      },
      {
        q: 'Есть ли чат с поддержкой?',
        a: 'Да, вы можете связаться с поддержкой через раздел «Поддержка» в профиле. Мы отвечаем в течение 24 часов.'
      }
    ]
  }
];

export default function FAQ() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [openItems, setOpenItems] = useState({});

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const userData = await base44.auth.me();
    setUser(userData);
  };

  const toggleItem = (categoryIndex, questionIndex) => {
    const key = `${categoryIndex}-${questionIndex}`;
    setOpenItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white sticky top-0 z-40 px-4 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">Часто задаваемые вопросы</h1>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6 space-y-6">
        {faqData.map((category, catIndex) => (
          <div key={catIndex}>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              {category.category}
            </h2>
            <div className="bg-white rounded-2xl overflow-hidden divide-y divide-gray-100">
              {category.questions.map((item, qIndex) => {
                const isOpen = openItems[`${catIndex}-${qIndex}`];
                return (
                  <div key={qIndex}>
                    <button
                      onClick={() => toggleItem(catIndex, qIndex)}
                      className="w-full px-4 py-4 flex items-start gap-3 text-left"
                    >
                      <span className="flex-1 font-medium text-gray-900">{item.q}</span>
                      <ChevronDown 
                        className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 text-gray-600">
                            {item.a}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <BottomNav userType={user?.user_type} />
    </div>
  );
}