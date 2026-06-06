import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Calendar, Clock, User, MessageCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

export default function BookingModal({ open, onClose, lesson, onConfirm, isLoading, isSuccess }) {
  if (!lesson) return null;

  const lessonDate = new Date(lesson.lesson_date);

  if (isSuccess) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md rounded-3xl">
          <div className="flex flex-col items-center text-center py-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Урок забронирован!</h2>
            <p className="text-gray-600 mb-6">
              Чат с преподавателем {lesson.teacher_name} открыт. Преподаватель отправит вам ссылку на урок в чате.
            </p>
            
            <div className="bg-gray-50 rounded-2xl p-4 w-full mb-6">
              <div className="flex items-center gap-3 mb-3">
                <Calendar className="w-5 h-5 text-orange-500" />
                <span className="text-gray-700">
                  {format(lessonDate, 'd MMMM yyyy', { locale: ru })}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-orange-500" />
                <span className="text-gray-700">
                  {format(lessonDate, 'HH:mm')}
                </span>
              </div>
            </div>

            <Button 
              onClick={onClose}
              className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-red-500 h-12"
            >
              Отлично!
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl">Подтверждение бронирования</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {/* Teacher */}
          <div className="flex items-center gap-3 mb-4 pb-4 border-b">
            {lesson.teacher_avatar ? (
              <img 
                src={lesson.teacher_avatar} 
                alt={lesson.teacher_name}
                className="w-14 h-14 rounded-full object-cover"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center">
                <User className="w-7 h-7 text-orange-500" />
              </div>
            )}
            <div>
              <h3 className="font-semibold text-gray-900">{lesson.teacher_name}</h3>
              <p className="text-sm text-gray-500">{lesson.subject}</p>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <span className="text-gray-700">
                {format(lessonDate, 'd MMMM yyyy, EEEE', { locale: ru })}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-gray-400" />
              <span className="text-gray-700">{format(lessonDate, 'HH:mm')}</span>
            </div>
          </div>

          {/* Price */}
          <div className="bg-orange-50 rounded-2xl p-4 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Стоимость:</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-gray-900">{lesson.discounted_price} ₽</span>
                <span className="text-sm text-gray-400 line-through">{lesson.original_price} ₽</span>
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-xl mb-6">
            <MessageCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-700">
              После бронирования откроется чат с преподавателем. Преподаватель отправит вам ссылку на урок.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              className="flex-1 rounded-xl h-12"
              onClick={onClose}
              disabled={isLoading}
            >
              Отмена
            </Button>
            <Button 
              className="flex-1 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 h-12 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={onConfirm}
              disabled={isLoading}
            >
              {isLoading ? 'Бронирование...' : 'Забронировать'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}