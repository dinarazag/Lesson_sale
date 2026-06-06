import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Star, Clock, Flame, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

import { getStudentLevelLabel } from '@/lib/lessonSubjects';

export default function LessonCard({ lesson, onBook, showBookButton = true }) {
  const discount = Math.round((1 - lesson.discounted_price / lesson.original_price) * 100);
  const lessonDate = new Date(lesson.lesson_date);
  const isToday = new Date().toDateString() === lessonDate.toDateString();
  
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 relative overflow-hidden">
      {/* Hot badge */}
      <div className="absolute -top-1 -right-1">
        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1.5 rounded-bl-xl rounded-tr-xl flex items-center gap-1 shadow-lg">
          <Flame className="w-4 h-4" />
          <span className="text-xs font-bold">-{discount}%</span>
        </div>
      </div>

      {/* Teacher info */}
      <div className="flex items-center gap-3 mb-3">
        <div className="relative">
          {lesson.teacher_avatar ? (
            <img 
              src={lesson.teacher_avatar} 
              alt={lesson.teacher_name}
              className="w-12 h-12 rounded-full object-cover border-2 border-orange-100"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center border-2 border-orange-100">
              <User className="w-6 h-6 text-orange-500" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{lesson.teacher_name}</h3>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className="text-sm font-medium text-gray-700">
                {lesson.teacher_rating?.toFixed(1) || '5.0'}
              </span>
            </div>
            <span className="text-gray-300">•</span>
            <span className="text-sm text-gray-500">{lesson.subject}</span>
          </div>
        </div>
      </div>

      {/* Level */}
      <div className="mb-3">
        <Badge variant="secondary" className="bg-gray-100 text-gray-600 font-medium">
          {getStudentLevelLabel(lesson.student_level, lesson.subject)}
        </Badge>
      </div>

      {/* Time and price */}
      <div className="flex items-end justify-between">
        <div>
          <div className="flex items-center gap-2 text-gray-600 mb-1">
            <Clock className="w-4 h-4" />
            <span className="text-sm">
              {isToday ? 'Сегодня' : format(lessonDate, 'd MMM', { locale: ru })}, {format(lessonDate, 'HH:mm')}
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900">{lesson.discounted_price} ₽</span>
            <span className="text-sm text-gray-400 line-through">{lesson.original_price} ₽</span>
          </div>
        </div>
        
        {showBookButton && lesson.status === 'active' && (
          <Button 
            onClick={(e) => {
              e.preventDefault();
              onBook?.(lesson);
            }}
            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold px-6 rounded-xl shadow-lg shadow-orange-200"
          >
            Забронировать
          </Button>
        )}
        
        {lesson.status === 'booked' && (
          <Badge className="bg-green-100 text-green-700 border-0">
            Забронировано
          </Badge>
        )}
      </div>
    </div>
  );
}